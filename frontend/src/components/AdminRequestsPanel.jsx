
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import API_BASE_URL from '../config/api'

export default function AdminRequestsPanel() {
  const [requests, setRequests] = useState([])
  const knownIds = useRef(new Set())

  const loadRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`)

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
      }

      const data = await res.json()

      data.forEach(request => {
        if (!knownIds.current.has(request.id)) {
          if (knownIds.current.size > 0) {
            toast(`🔔 New ${request.type} request: ${request.title}`)
          }

          knownIds.current.add(request.id)
        }
      })

      setRequests(data)
    } catch (error) {
      console.error('Unable to load requests:', error)
    }
  }, [])

  useEffect(() => {
    const initialLoad = setTimeout(() => {
      void loadRequests()
    }, 0)

    const interval = setInterval(() => {
      void loadRequests()
    }, 2000)

    return () => {
      clearTimeout(initialLoad)
      clearInterval(interval)
    }
  }, [loadRequests])

  const updateStatus = async (id, status, title) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/requests/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        }
      )

      if (!res.ok) {
        throw new Error(`Update failed: ${res.status}`)
      }

      if (status === 'Getting') {
        toast(`⬇️ Getting ${title}`)
      }

      if (status === 'Fulfilled') {
        toast.success(`✅ ${title} fulfilled`)
      }

      await loadRequests()
    } catch (error) {
      console.error('Unable to update request:', error)
      toast.error('Unable to update request')
    }
  }

  return (
    <section className="mt-14">
      <h2 className="text-3xl font-bold mb-6">
        Request Control Center
      </h2>

      <div className="space-y-4">
        {requests.map(request => (
          <div
            key={request.id}
            className={
              request.status === 'Fulfilled'
                ? 'bg-green-950/20 border border-green-500/20 backdrop-blur-xl rounded-2xl p-6 flex justify-between items-center transition-all duration-500'
                : 'bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 flex justify-between items-center transition-all duration-500'
            }
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {request.type === 'movie' && '🎬'}
                  {request.type === 'tv' && '📺'}
                  {request.type === 'game' && '🎮'}
                </span>

                <h3 className="text-2xl font-semibold">
                  {request.title}
                </h3>

                {request.status === 'Pending' && (
                  <span className="bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                    NEW
                  </span>
                )}
              </div>

              <p className="text-slate-400 mt-2">
                Requested by {request.requester}
              </p>

              <p className="mt-2">
                Status:
                <span className={
                  request.status === 'Fulfilled'
                    ? 'text-green-400 ml-2'
                    : request.status === 'Getting'
                      ? 'text-cyan-400 ml-2'
                      : 'text-yellow-400 ml-2'
                }>
                  {request.status}
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => updateStatus(request.id, 'Getting', request.title)}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-3 rounded-2xl transition-all"
              >
                Get
              </button>

              <button
                onClick={() => updateStatus(request.id, 'Fulfilled', request.title)}
                className="bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-3 rounded-2xl transition-all"
              >
                Fulfilled
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
