import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import RequestsList from './RequestsList'
import API_BASE_URL from '../config/api'

export default function FamilyPanel() {
  const [requests, setRequests] = useState([])
  const previousStatuses = useRef({})

  const [form, setForm] = useState({
    type: 'movie',
    title: '',
    requester: ''
  })

  const loadRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`)

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
      }

      const data = await res.json()
      const statusMap = {}

      data.forEach(request => {
        const oldStatus = previousStatuses.current[request.id]

        if (
          oldStatus &&
          oldStatus !== request.status &&
          request.status === 'Fulfilled'
        ) {
          toast.success(`🎉 ${request.title} is now available`)
        }

        statusMap[request.id] = request.status
      })

      previousStatuses.current = statusMap
      setRequests(data)
    } catch (error) {
      console.error('Unable to load requests:', error)
    }
  }, [])

  useEffect(() => {
    const initialLoad = setTimeout(loadRequests, 0)
    const interval = setInterval(loadRequests, 2000)

    return () => {
      clearTimeout(initialLoad)
      clearInterval(interval)
    }
  }, [loadRequests])

  const submitRequest = async () => {
    if (!form.title.trim() || !form.requester.trim()) {
      toast.error('Please enter a title and your name')
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      if (!res.ok) {
        throw new Error(`Submission failed: ${res.status}`)
      }

      toast.success(`✅ ${form.title} request submitted`)

      setForm({
        type: 'movie',
        title: '',
        requester: ''
      })

      await loadRequests()
    } catch (error) {
      console.error('Unable to submit request:', error)
      toast.error('Unable to submit request')
    }
  }

  return (
    <div>
      <section className="mb-14">
        <h2 className="text-3xl font-bold mb-6">
          Request Media
        </h2>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
          <div className="grid md:grid-cols-3 gap-4">
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="bg-slate-950 border border-slate-700 rounded-2xl px-4 py-4"
            >
              <option value="movie">Movie</option>
              <option value="tv">TV Show</option>
              <option value="game">Game</option>
            </select>

            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="bg-slate-950 border border-slate-700 rounded-2xl px-4 py-4"
            />

            <input
              type="text"
              placeholder="Your Name"
              value={form.requester}
              onChange={e => setForm({ ...form, requester: e.target.value })}
              className="bg-slate-950 border border-slate-700 rounded-2xl px-4 py-4"
            />
          </div>

          <button
            onClick={submitRequest}
            className="mt-6 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-4 rounded-2xl transition-all"
          >
            Submit Request
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">
          Request Queue
        </h2>

        <RequestsList requests={requests} />
      </section>

      <section className="mt-14">
        <h2 className="text-3xl font-bold mb-6">
          Recently Completed
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {requests
            .filter(request => request.status === 'Fulfilled')
            .slice(0, 6)
            .map(request => (
              <div
                key={request.id}
                className="bg-green-950/20 border border-green-500/20 rounded-2xl p-5 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="text-4xl mb-4">
                  {request.type === 'movie' && '🎬'}
                  {request.type === 'tv' && '📺'}
                  {request.type === 'game' && '🎮'}
                </div>

                <h3 className="text-xl font-semibold">
                  {request.title}
                </h3>

                <p className="text-green-300 mt-3 animate-pulse">
                  Available Now
                </p>
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}
