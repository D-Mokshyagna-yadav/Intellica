const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

const isLocalhost = typeof window !== "undefined" && LOCAL_HOSTS.has(window.location.hostname);
const configuredOrigin = import.meta.env.VITE_API_ORIGIN?.replace(/\/$/, "");
const fallbackOrigin = isLocalhost ? `http://localhost:${import.meta.env.VITE_BACKEND_PORT || 5000}` : "";

export const API_ORIGIN = configuredOrigin || fallbackOrigin;
export const API_BASE = `${API_ORIGIN}/api`.replace(/([^:]\/)\/+/g, "$1");

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getFileUrl(filePath) {
  if (!filePath) {
    return "";
  }

  const normalizedPath = String(filePath).replace(/^\/+/, "");
  return API_ORIGIN ? `${API_ORIGIN}/${normalizedPath}` : `/${normalizedPath}`;
}

export async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: options.credentials || "include",
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await readApiResponse(response);

  if (!response.ok) {
    const message =
      (typeof data === "object" && data?.message) ||
      (typeof data === "string" && data) ||
      "Request failed";

    throw new Error(message);
  }

  return data;
}

export default API_BASE;
