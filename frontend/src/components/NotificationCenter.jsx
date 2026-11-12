import { useState } from 'react'

export default function NotificationCenter({
  notifications
}) {

  const [open, setOpen] = useState(false)

  return (

    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="relative bg-slate-900/70 border border-slate-700 rounded-2xl px-5 py-3 hover:border-cyan-500/50 transition-all"
      >

        🔔

        {notifications.length > 0 && (

          <span className="absolute -top-2 -right-2 bg-cyan-500 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">

            {notifications.length}

          </span>

        )}

      </button>

      {open && (

        <div className="absolute right-0 mt-4 w-[360px] bg-slate-950/95 backdrop-blur-2xl border border-slate-700 rounded-3xl shadow-2xl z-50 overflow-hidden">

          <div className="p-5 border-b border-slate-800">

            <h2 className="text-xl font-bold">
              Notifications
            </h2>

          </div>

          <div className="max-h-[400px] overflow-y-auto">

            {notifications.length === 0 && (

              <div className="p-6 text-slate-400">
                No notifications
              </div>

            )}

            {notifications.map((notification, index) => (

              <div
                key={index}
                className="p-5 border-b border-slate-800 hover:bg-slate-900/50 transition-all"
              >

                <p className="font-medium">
                  {notification.message}
                </p>

                <p className="text-slate-500 text-sm mt-2">
                  {notification.time}
                </p>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  )
}
