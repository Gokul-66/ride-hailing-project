const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getRides: () => request('/api/rides'),
  createRide: (payload) =>
    request('/api/rides', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getRideById: (rideId) => request(`/api/rides/${rideId}`)
};
