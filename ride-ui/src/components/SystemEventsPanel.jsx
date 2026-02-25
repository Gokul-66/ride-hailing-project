export default function SystemEventsPanel({ events }) {
  return (
    <section className="glass-panel rounded-2xl p-5">
      <h2 className="text-lg font-semibold text-slate-100">System / Queue Events</h2>
      <div className="mt-4 max-h-64 space-y-2 overflow-auto pr-1">
        {events.length === 0 && (
          <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-3 text-xs text-slate-400">
            No events yet.
          </p>
        )}

        {events.map((event, index) => (
          <article key={`${event.id || event.timestamp || 'event'}-${index}`} className="glass-panel rounded-xl p-3">
            <p className="text-sm font-medium text-slate-100">{event.type || 'System Event'}</p>
            <p className="mt-1 text-xs text-slate-300">{event.message || event.description || 'No details provided.'}</p>
            {event.timestamp && (
              <p className="mt-2 text-[11px] text-slate-400">
                {new Date(event.timestamp).toLocaleString()}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
