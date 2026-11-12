import AdminRequestsPanel from '../components/AdminRequestsPanel'
export default function AdminView({
  stats,
  docker,
  services
}) {
  return (
    <>

      {stats && (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">

          <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-6">
            <p className="text-slate-400">
              CPU
            </p>

            <h2 className="text-5xl font-bold mt-4 text-cyan-300">
              {stats.cpu}%
            </h2>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6">
            <p className="text-slate-400">
              MEMORY
            </p>

            <h2 className="text-5xl font-bold mt-4 text-purple-300">
              {stats.ramUsed}GB
            </h2>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-6">
            <p className="text-slate-400">
              TEMP
            </p>

            <h2 className="text-5xl font-bold mt-4 text-amber-300">
              {stats.temperature}°C
            </h2>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-green-500/20 rounded-3xl p-6">
            <p className="text-slate-400">
              CONTAINERS
            </p>

            <h2 className="text-5xl font-bold mt-4 text-green-300">
              {docker.length}
            </h2>
          </div>

        </section>
      )}

      <section className="mb-14">

        <h2 className="text-3xl font-bold mb-6">
          Service Launcher
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {services.map(service => (
            <a
              key={service.name}
              href={service.url}
              target="_blank"
              className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-3xl p-7 hover:border-cyan-500/50 hover:-translate-y-1 transition-all"
            >

              <div className="text-5xl mb-6">
                {service.icon}
              </div>

              <h3 className="text-2xl font-semibold">
                {service.name}
              </h3>

            </a>
          ))}

        </div>

      </section>

      <section>

        <h2 className="text-3xl font-bold mb-6">
          Container Matrix
        </h2>

        <div className="space-y-4">

          {docker.map(container => (
            <div
              key={container.name}
              className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl px-6 py-5 flex justify-between items-center"
            >

              <div>

                <h3 className="font-semibold text-lg">
                  {container.name}
                </h3>

                <p className="text-slate-500 text-sm mt-1">
                  {container.image}
                </p>

              </div>

              <div className={
                container.state === 'running'
                  ? 'text-green-400 font-semibold'
                  : 'text-red-400 font-semibold'
              }>
                {container.state}
              </div>

            </div>
          ))}

        </div>

      </section>
     <AdminRequestsPanel />
    </>
  )
}
