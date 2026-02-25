const STATUS_ORDER = ['Pending', 'Searching Driver', 'Assigned', 'Completed'];

const statusStyles = {
  Pending: 'bg-amber-400/20 text-amber-200 border-amber-300/30',
  'Searching Driver': 'bg-sky-400/20 text-sky-200 border-sky-300/30',
  Assigned: 'bg-emerald-400/20 text-emerald-200 border-emerald-300/30',
  Completed: 'bg-slate-400/20 text-slate-200 border-slate-300/30'
};

export default function RideListPanel({ ridesByStatus }) {
  return (
    <section className="glass-panel rounded-2xl p-5">
      <h2 className="text-lg font-semibold text-slate-100">Ride Queue</h2>
      <div className="mt-4 space-y-4">
        {STATUS_ORDER.map((status) => {
          const rides = ridesByStatus[status] || [];
          return (
            <div key={status}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">{status}</h3>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
                >
                  {rides.length}
                </span>
              </div>
              <div className="space-y-2">
                {rides.length === 0 && (
                  <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-3 text-xs text-slate-400">
                    No rides in this status.
                  </p>
                )}
                {rides.map((ride) => (
                  <article key={ride.id} className="glass-panel rounded-xl p-3">
                    <p className="text-sm font-medium text-slate-100">Ride #{ride.id}</p>
                    <p className="mt-1 text-xs text-slate-300">{ride.pickupLocation} → {ride.dropLocation}</p>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
