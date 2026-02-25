import { useState } from 'react';

export default function RideCreationPanel({ onCreateRide }) {
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!pickup.trim() || !drop.trim()) return;

    await onCreateRide({ pickupLocation: pickup.trim(), dropLocation: drop.trim() });
    setPickup('');
    setDrop('');
  }

  return (
    <section className="glass-panel rounded-2xl p-5">
      <h2 className="text-lg font-semibold text-slate-100">Ride Creation</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          placeholder="Pickup Location"
          className="w-full rounded-xl border border-slate-600/50 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-400"
        />
        <input
          value={drop}
          onChange={(e) => setDrop(e.target.value)}
          placeholder="Drop Location"
          className="w-full rounded-xl border border-slate-600/50 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-400"
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          Create Ride
        </button>
      </form>
    </section>
  );
}
