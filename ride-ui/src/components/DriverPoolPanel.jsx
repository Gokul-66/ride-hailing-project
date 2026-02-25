export default function DriverPoolPanel({ drivers, onToggleStatus, onAddDriver }) {
  return (
    <section className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Driver Pool</h2>
        <button
          onClick={onAddDriver}
          className="rounded-xl border border-emerald-300/30 bg-emerald-400/20 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/30"
        >
          Add Driver
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {drivers.length === 0 && (
          <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-3 text-xs text-slate-400">
            No drivers found.
          </p>
        )}

        {drivers.map((driver) => {
          const isAvailable = driver.status === 'Available';
          return (
            <article key={driver.id} className="glass-panel flex items-center justify-between rounded-xl p-3">
              <div>
                <p className="text-sm font-medium text-slate-100">Driver #{driver.id}</p>
                <span
                  className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                    isAvailable
                      ? 'border-emerald-300/30 bg-emerald-400/20 text-emerald-100'
                      : 'border-rose-300/30 bg-rose-400/20 text-rose-100'
                  }`}
                >
                  {driver.status}
                </span>
              </div>
              <button
                onClick={() => onToggleStatus(driver)}
                className="rounded-xl border border-slate-500/40 bg-slate-800/40 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-700/50"
              >
                Toggle {isAvailable ? 'Busy' : 'Available'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
