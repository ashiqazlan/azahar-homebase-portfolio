import { useState } from 'react'
import API_BASE_URL from '../config/api'

export default function Topbar({
  mode,
  setMode,
  adminAuthenticated,
  onLoginSuccess,
  onLogout
}) {
  const [showLogin, setShowLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async () => {
    if (!password) {
      setError('Please enter your password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setPassword('')
      setShowLogin(false)
      onLoginSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'same-origin'
      })
    } finally {
      onLogout()
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setMode('family')}
        className={
          mode === 'family'
            ? 'bg-cyan-500 text-black font-bold px-6 py-3 rounded-2xl'
            : 'bg-slate-900/60 border border-slate-700 px-6 py-3 rounded-2xl'
        }
      >
        Family
      </button>

      <button
        onClick={() => {
          if (adminAuthenticated) {
            setMode('admin')
          } else {
            setError('')
            setShowLogin(true)
          }
        }}
        className={
          mode === 'admin'
            ? 'bg-cyan-500 text-black font-bold px-6 py-3 rounded-2xl'
            : 'bg-slate-900/60 border border-slate-700 px-6 py-3 rounded-2xl'
        }
      >
        Admin
      </button>

      {adminAuthenticated && (
        <button
          onClick={logout}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-3 rounded-2xl"
        >
          Logout
        </button>
      )}

      {showLogin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-950 border border-slate-700 rounded-3xl p-8 w-[400px] max-w-[90vw]">
            <h2 className="text-2xl font-bold mb-6">
              Admin Access
            </h2>

            <form
              onSubmit={event => {
                event.preventDefault()
                login()
              }}
            >
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Enter admin password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-4"
                autoFocus
              />

              {error && (
                <p className="text-red-400 text-sm mt-3">
                  {error}
                </p>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-4 rounded-2xl"
                >
                  {loading ? 'Checking...' : 'Login'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false)
                    setPassword('')
                    setError('')
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
