require('dotenv').config({ path: require('path').join(__dirname, '.env') })

const express = require('express')
const crypto = require('crypto')
const si = require('systeminformation')
const Docker = require('dockerode')
const initDB = require('./db')

const app = express()
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

const PORT = Number(process.env.PORT || 3001)
const SESSION_DURATION = 8 * 60 * 60 * 1000
const COOKIE_NAME = 'azahar_session'

const passwordConfig = process.env.ADMIN_PASSWORD_HASH || ''
const sessionSecret = process.env.SESSION_SECRET || ''

if (!passwordConfig.startsWith('scrypt$') || !sessionSecret) {
  throw new Error('Missing or invalid authentication configuration.')
}

app.disable('x-powered-by')
app.use(express.json({ limit: '10kb' }))

const loginAttempts = new Map()

function verifyPassword(password) {
  const [, salt, storedHash] = passwordConfig.split('$')

  if (!salt || !storedHash || !/^[a-f0-9]{128}$/i.test(storedHash)) {
    return false
  }

  const calculatedHash = crypto.scryptSync(password, salt, 64)
  const expectedHash = Buffer.from(storedHash, 'hex')

  return expectedHash.length === calculatedHash.length &&
    crypto.timingSafeEqual(calculatedHash, expectedHash)
}

function signSession(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', sessionSecret)
    .update(encoded)
    .digest('base64url')

  return `${encoded}.${signature}`
}

function verifySession(token) {
  if (!token || typeof token !== 'string') return false

  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [encoded, suppliedSignature] = parts

  const expectedSignature = crypto
    .createHmac('sha256', sessionSecret)
    .update(encoded)
    .digest()

  let actualSignature

  try {
    actualSignature = Buffer.from(suppliedSignature, 'base64url')
  } catch {
    return false
  }

  if (
    actualSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return false
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString()
    )

    return payload.role === 'admin' &&
      Number.isInteger(payload.exp) &&
      payload.exp > Date.now()
  } catch {
    return false
  }
}

function getCookie(req, name) {
  const cookies = req.headers.cookie || ''

  for (const item of cookies.split(';')) {
    const separator = item.indexOf('=')

    if (separator === -1) continue

    const key = item.slice(0, separator).trim()
    const value = item.slice(separator + 1).trim()

    if (key === name) return decodeURIComponent(value)
  }

  return null
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_DURATION
  }
}

function requireAdmin(req, res, next) {
  const token = getCookie(req, COOKIE_NAME)

  if (!verifySession(token)) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  next()
}

function checkLoginLimit(req, res, next) {
  const key = req.ip
  const now = Date.now()
  const windowMs = 15 * 60 * 1000

  const attempts = (loginAttempts.get(key) || [])
    .filter(timestamp => now - timestamp < windowMs)

  if (attempts.length >= 5) {
    return res.status(429).json({
      error: 'Too many login attempts. Try again later.'
    })
  }

  attempts.push(now)
  loginAttempts.set(key, attempts)

  next()
}

const SERVICES = [
  {
    name: 'Jellyfin',
    url: process.env.JELLYFIN_URL || '',
    icon: '🎬',
    admin: true,
    family: true
  },
  {
    name: 'Photos',
    url: process.env.PHOTOS_URL || '',
    icon: '🖼️',
    admin: true,
    family: true
  },
  {
    name: 'Files',
    url: process.env.FILES_URL || '',
    icon: '📁',
    admin: true,
    family: true
  },
  {
    name: 'NPM',
    url: process.env.NPM_URL || '',
    icon: '🌐',
    admin: true,
    family: false
  }
]

// Authentication routes

app.post('/api/auth/login', checkLoginLimit, (req, res) => {
  const { password } = req.body || {}

  if (typeof password !== 'string' || password.length > 256) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }

  if (!verifyPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = signSession({
    role: 'admin',
    exp: Date.now() + SESSION_DURATION
  })

  loginAttempts.delete(req.ip)

  res.cookie(COOKIE_NAME, token, cookieOptions())
  res.json({ success: true })
})

app.get('/api/auth/me', (req, res) => {
  if (!verifySession(getCookie(req, COOKIE_NAME))) {
    return res.status(401).json({ authenticated: false })
  }

  res.json({ authenticated: true })
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions())
  res.json({ success: true })
})

// Family-accessible routes

app.get('/api/services', (req, res) => {
  res.json(SERVICES)
})

app.get('/api/requests', async (req, res) => {
  try {
    const requests = await db.all(
      'SELECT * FROM requests ORDER BY created_at DESC'
    )

    res.json(requests)
  } catch (err) {
    console.error('Request retrieval failed:', err.message)
    res.status(500).json({ error: 'Unable to retrieve requests' })
  }
})

app.post('/api/requests', async (req, res) => {
  try {
    const { type, title, requester } = req.body || {}

    if (
      !['movie', 'tv', 'game'].includes(type) ||
      typeof title !== 'string' ||
      typeof requester !== 'string' ||
      !title.trim() ||
      !requester.trim() ||
      title.length > 150 ||
      requester.length > 80
    ) {
      return res.status(400).json({ error: 'Invalid request details' })
    }

    await db.run(
      `INSERT INTO requests (type, title, requester)
       VALUES (?, ?, ?)`,
      [type, title.trim(), requester.trim()]
    )

    res.status(201).json({ success: true })
  } catch (err) {
    console.error('Request submission failed:', err.message)
    res.status(500).json({ error: 'Unable to submit request' })
  }
})

// Admin-only routes

app.get('/api/stats', requireAdmin, async (req, res) => {
  try {
    const [cpu, mem, temp] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.cpuTemperature()
    ])

    res.json({
      cpu: cpu.currentLoad.toFixed(1),
      ramUsed: (mem.used / 1024 / 1024 / 1024).toFixed(1),
      ramTotal: (mem.total / 1024 / 1024 / 1024).toFixed(1),
      temperature: temp.main || 0
    })
  } catch (err) {
    console.error('System statistics failed:', err.message)
    res.status(500).json({ error: 'Unable to retrieve system statistics' })
  }
})

app.get('/api/docker', requireAdmin, async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true })

    res.json(containers.map(c => ({
      name: c.Names[0].replace('/', ''),
      image: c.Image,
      state: c.State,
      status: c.Status
    })))
  } catch (err) {
    console.error('Docker query failed:', err.message)
    res.status(500).json({ error: 'Unable to retrieve container information' })
  }
})

app.put('/api/requests/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { status } = req.body || {}

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid request ID' })
    }

    if (!['Pending', 'Getting', 'Fulfilled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid request status' })
    }

    const result = await db.run(
      `UPDATE requests SET status = ? WHERE id = ?`,
      [status, id]
    )

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Request not found' })
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Request update failed:', err.message)
    res.status(500).json({ error: 'Unable to update request' })
  }
})

// Start only after the database is ready

let db

async function startServer() {
  db = await initDB()

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Azahar backend running on port ${PORT}`)
  })
}

startServer().catch(err => {
  console.error('Backend startup failed:', err)
  process.exit(1)
})
