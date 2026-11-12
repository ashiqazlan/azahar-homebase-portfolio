
import { useEffect, useState } from 'react'

export default function RequestsList({ requests }) {
  const [now, setNow] = useState(0)

  useEffect(() => {
    const initialUpdate = setTimeout(() => {
      setNow(Date.now())
    }, 0)

    const interval = setInterval(() => {
      setNow(Date.now())
    }, 60000)

    return () => {
      clearTimeout(initialUpdate)
      clearInterval(interval)
    }
  }, [])

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const isNew = (dateString) => {
    if (!now) return false

    const created = new Date(dateString).getTime()
    const diffMinutes = (now - created) / 1000 / 60

    return diffMinutes >= 0 && diffMinutes < 10
  }

  return (
    <div className="space-y-4 mt-8">
      {requests.map(request => (
        <div
          key={request.id}
          className={
            request.status === 'Fulfilled'
              ? 'bg-green-950/30 border border-green-500/30 backdrop-blur-xl rounded-2xl p-5 flex justify-between items-center transition-all duration-500'
              : 'bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-5 flex justify-between items-center transition-all duration-500'
          }
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {request.type === 'movie' && '🎬'}
                {request.type === 'tv' && '📺'}
                {request.type === 'game' && '🎮'}
              </span>

              <h3 className="text-xl font-semibold">
                {request.title}
              </h3>

              {isNew(request.created_at) && (
                <span className="bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  NEW
                </span>
              )}
            </div>

            <p className="text-slate-400 mt-2">
              Requested by {request.requester}
            </p>

            <p className="text-slate-500 text-sm mt-1">
              {formatTime(request.created_at)}
            </p>
          </div>

          <div className="text-right">
            <div className={
              request.status === 'Fulfilled'
                ? 'text-green-400 font-bold text-lg'
                : request.status === 'Getting'
                ? 'text-cyan-400 font-bold text-lg'
                : 'text-yellow-400 font-bold text-lg'
            }>
              {request.status}
            </div>

            {request.status === 'Fulfilled' && (
              <div className="text-green-300 text-sm mt-2 animate-pulse">
                Ready in library
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
