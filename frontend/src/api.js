// Determine API endpoint based on environment
let API_BASE;

// In production (Docker): use relative path to talk to same server
// In development: use localhost:PORT
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Development mode - use VITE_BACKEND_PORT
  const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || 5000;
  API_BASE = `http://localhost:${BACKEND_PORT}/api`;
} else {
  // Production mode - use same-origin requests (Coolify domain)
  API_BASE = '/api';
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`
  };
};

export default API_BASE;