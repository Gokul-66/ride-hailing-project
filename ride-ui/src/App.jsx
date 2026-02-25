import { useEffect, useMemo, useRef, useState } from 'react';
import RideCreationPanel from './components/RideCreationPanel';
import RideListPanel from './components/RideListPanel';
import DriverPoolPanel from './components/DriverPoolPanel';
import SystemEventsPanel from './components/SystemEventsPanel';
import { api } from './api';

const STATUS_GROUP_MAP = {
  REQUESTED: 'Pending',
  DRIVER_ASSIGNED: 'Assigned',
  ONGOING: 'Assigned',
  COMPLETED: 'Completed',
  CANCELLED: 'Completed'
};
const POLLABLE_STATUSES = new Set(['REQUESTED']);

function normalizeRide(rawRide) {
  if (!rawRide) return null;
  const ride = rawRide._doc || rawRide;
  const idValue = ride.id || ride._id;

  let id = null;
  if (typeof idValue === 'string') {
    id = idValue;
  } else if (idValue?.buffer) {
    id = Array.from(idValue.buffer)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  } else if (idValue?.toString) {
    id = idValue.toString();
  }

  return {
    id,
    pickupLocation: ride.pickup || ride.pickupLocation || 'Unknown Pickup',
    dropLocation: ride.drop || ride.dropLocation || 'Unknown Drop',
    status: ride.status || 'REQUESTED',
    driver: ride.driver || null
  };
}

export default function App() {
  const [rides, setRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [events, setEvents] = useState([]);
  const prevRideStatesRef = useRef(new Map());
  const ridesRef = useRef([]);
  const didInitialLoadRef = useRef(false);

  function hasRideStateChanges(prevRides, nextRides) {
    if (prevRides.length !== nextRides.length) return true;
    const prevMap = new Map(prevRides.map((ride) => [ride.id, ride]));
    for (const ride of nextRides) {
      const prev = prevMap.get(ride.id);
      if (!prev) return true;
      if (prev.status !== ride.status || prev.driver !== ride.driver) return true;
    }
    return false;
  }

  useEffect(() => {
    ridesRef.current = rides;
  }, [rides]);

  useEffect(() => {
    if (didInitialLoadRef.current) return;
    didInitialLoadRef.current = true;
    loadInitialRides();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshTrackedRides();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  async function loadInitialRides() {
    try {
      const response = await api.getRides();
      const initialRides = (response?.data || []).map(normalizeRide).filter(Boolean);
      setRides(initialRides);
      ridesRef.current = initialRides;
      syncDriversFromRides(initialRides);
      initialRides.forEach((ride) => {
        prevRideStatesRef.current.set(ride.id, { status: ride.status, driver: ride.driver });
      });
      addLocalEvent('System Ready', `Loaded ${initialRides.length} rides`);
    } catch (error) {
      addLocalEvent('Initial Load Failed', error.message);
    }
  }

  function addLocalEvent(type, message) {
    setEvents((prev) => [
      {
        id: crypto.randomUUID(),
        type,
        message,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  }

  function syncDriversFromRides(updatedRides) {
    const assignedDrivers = updatedRides
      .filter((ride) => Boolean(ride.driver))
      .map((ride) => ({ id: ride.driver, status: 'Busy' }));

    setDrivers((prev) => {
      const manualDrivers = prev.filter((driver) => driver.id.startsWith('LOCAL_'));
      const merged = new Map([...manualDrivers, ...assignedDrivers].map((item) => [item.id, item]));
      return [...merged.values()];
    });
  }

  async function refreshTrackedRides() {
    const trackedRides = ridesRef.current.filter((ride) => POLLABLE_STATUSES.has(ride.status));
    if (trackedRides.length === 0) return;

    try {
      const response = await api.getRides();
      const latestRides = (response?.data || []).map(normalizeRide).filter(Boolean);

      if (latestRides.length === 0) return;

      const latestMap = new Map(latestRides.map((ride) => [ride.id, ride]));
      const mergedRides = ridesRef.current.map((ride) => latestMap.get(ride.id) || ride);

      if (hasRideStateChanges(ridesRef.current, mergedRides)) {
        setRides(mergedRides);
        ridesRef.current = mergedRides;
        syncDriversFromRides(mergedRides);
      }

      latestRides.forEach((ride) => {
        const prev = prevRideStatesRef.current.get(ride.id);
        if (prev && prev.status !== ride.status) {
          addLocalEvent('Ride Updated', `Ride #${ride.id} moved to ${ride.status}`);
        }
        if (ride.driver && (!prev || prev.driver !== ride.driver)) {
          addLocalEvent('Ride Assigned', `Ride #${ride.id} assigned to ${ride.driver}`);
        }
        prevRideStatesRef.current.set(ride.id, { status: ride.status, driver: ride.driver });
      });
    } catch (error) {
      addLocalEvent('Sync Failed', error.message);
    }
  }

  async function handleCreateRide(payload) {
    try {
      const backendPayload = {
        riderName: 'Dashboard Rider',
        pickup: payload.pickupLocation,
        drop: payload.dropLocation
      };

      const response = await api.createRide(backendPayload);
      const ride = normalizeRide(response?.data);
      if (!ride) {
        addLocalEvent('Ride Creation Failed', 'Backend returned empty ride payload');
        return;
      }

      const nextRides = [ride, ...ridesRef.current];
      setRides(nextRides);
      ridesRef.current = nextRides;
      prevRideStatesRef.current.set(ride.id, { status: ride.status, driver: ride.driver });
      addLocalEvent('Ride Created', `${ride.pickupLocation} to ${ride.dropLocation}`);
      syncDriversFromRides(nextRides);
    } catch (error) {
      addLocalEvent('Ride Creation Failed', error.message);
    }
  }

  function handleAddDriver() {
    const localDriver = {
      id: `LOCAL_${Math.floor(Math.random() * 900 + 100)}`,
      status: 'Available'
    };
    setDrivers((prev) => [localDriver, ...prev]);
    addLocalEvent('Driver Available', `Local driver ${localDriver.id} added`);
  }

  function handleToggleDriverStatus(driver) {
    const nextStatus = driver.status === 'Available' ? 'Busy' : 'Available';
    setDrivers((prev) =>
      prev.map((item) => (item.id === driver.id ? { ...item, status: nextStatus } : item))
    );
    addLocalEvent(
      nextStatus === 'Available' ? 'Driver Available' : 'Driver Busy',
      `${driver.id} is now ${nextStatus}`
    );
  }

  const ridesByStatus = useMemo(() => {
    const grouped = {
      Pending: [],
      'Searching Driver': [],
      Assigned: [],
      Completed: []
    };

    rides.forEach((ride) => {
      const group = STATUS_GROUP_MAP[ride.status] || 'Pending';
      if (group === 'Pending' && ride.status === 'REQUESTED') {
        grouped['Searching Driver'].push(ride);
        return;
      }
      grouped[group].push(ride);
    });

    return grouped;
  }, [rides]);

  return (
    <main className="min-h-screen p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-slate-50 md:text-2xl">
          Real-Time Ride Dispatch & Driver Allocation System
        </h1>
        <p className="mt-1 text-sm text-slate-300">Backend-driven state dashboard</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <RideCreationPanel onCreateRide={handleCreateRide} />
          <RideListPanel ridesByStatus={ridesByStatus} />
        </div>
        <DriverPoolPanel
          drivers={drivers}
          onToggleStatus={handleToggleDriverStatus}
          onAddDriver={handleAddDriver}
        />
      </section>

      <section className="mt-4">
        <SystemEventsPanel events={events} />
      </section>
    </main>
  );
}
