import { useEffect, useState } from 'react'
import './App.css'

import Topbar from './components/Topbar'
import FamilyPanel from './components/FamilyPanel'
import AdminView from './pages/AdminView'
import ThemeSelector from './components/ThemeSelector'

import { themes } from './themes/themes'
import API_BASE_URL from './config/api'

function App() {
  const [mode, setMode] = useState('family')
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)

  const [currentTheme, setCurrentTheme] = useState('cyberpunk')
  const [services, setServices] = useState([])
  const [stats, setStats] = useState(null)
  const [docker, setDocker] = useState([])

  const theme = themes[currentTheme]

  // Check whether an existing admin session is still valid.
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'same-origin'
    })
      .then(response => {
        if (response.ok) {
          setAdminAuthenticated(true)
        }
      })
      .catch(err => {
        console.error('Session check failed:', err)
      })
  }, [])

  // Load family-accessible services.
  useEffect(() => {
    const loadServices = () => {
      fetch(`${API_BASE_URL}/api/services`)
        .then(response => {
          if (!response.ok) throw new Error('Unable to load services')
          return response.json()
        })
        .then(setServices)
        .catch(err => console.error('Services loading failed:', err))
    }

    loadServices()

    const interval = setInterval(loadServices, 5000)
    return () => clearInterval(interval)
  }, [])

  // Admin-only information is requested only after authentication.
  useEffect(() => {
    if (!adminAuthenticated) return

    let cancelled = false

    const loadAdminData = async () => {
      try {
        const [statsResponse, dockerResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/stats`, {
            credentials: 'same-origin'
          }),
          fetch(`${API_BASE_URL}/api/docker`, {
            credentials: 'same-origin'
          })
        ])

        if (statsResponse.status === 401 || dockerResponse.status === 401) {
          if (!cancelled) {
            setAdminAuthenticated(false)
            setMode('family')
            setStats(null)
            setDocker([])
          }
          return
        }

        if (!statsResponse.ok || !dockerResponse.ok) {
          throw new Error('Unable to load admin information')
        }

        const [statsData, dockerData] = await Promise.all([
          statsResponse.json(),
          dockerResponse.json()
        ])

        if (!cancelled) {
          setStats(statsData)
          setDocker(dockerData)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Admin data loading failed:', err)
        }
      }
    }

    loadAdminData()

    const interval = setInterval(loadAdminData, 5000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [adminAuthenticated])

  const handleLoginSuccess = () => {
    setAdminAuthenticated(true)
    setMode('admin')
  }

  const handleLogout = () => {
    setAdminAuthenticated(false)
    setMode('family')
    setStats(null)
    setDocker([])
  }

  return (
    <div className={`min-h-screen text-white transition-all duration-700 relative overflow-hidden ${theme.background}`}>
      <div className={`absolute inset-0 ${theme.overlay}`}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Topbar
              mode={mode}
              setMode={setMode}
              adminAuthenticated={adminAuthenticated}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
            />
          </div>

          <ThemeSelector
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
          />
        </div>

        {mode === 'admin' && adminAuthenticated && (
          <AdminView
            stats={stats}
            docker={docker}
            services={services}
          />
        )}

        {mode === 'family' && (
          <FamilyPanel />
        )}
      </div>
    </div>
  )
}

export default App
