const configuredOrigin = import.meta.env.VITE_API_ORIGIN?.replace(/\/$/, "");
const fallbackOrigin = typeof window !== "undefined" ? window.location.origin : "";

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

  const rawPath = String(filePath).trim();
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    return rawPath;
  }

  const normalizedPath = rawPath.replace(/^\/+/, "");
  const resolvedPath = normalizedPath.startsWith("uploads/") ? normalizedPath : `uploads/${normalizedPath}`;
  return API_ORIGIN ? `${API_ORIGIN}/${resolvedPath}` : `/${resolvedPath}`;
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

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

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
