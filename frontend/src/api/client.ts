// ============================================================
// Intellica – Enhanced API Client
// Single centralized fetch client with:
//  • Auth headers
//  • Auto token refresh (placeholder, backend can issue refresh)
//  • 401 → clear session + redirect
//  • Typed responses
//  • Upload progress support
//  • Download blob support
//  • Dev-only request logging
// ============================================================

const configuredOrigin = import.meta.env.VITE_API_ORIGIN?.replace(/\/$/, "");
let fallbackOrigin = "";
if (typeof window !== "undefined") {
  // If running on Vite dev server port, point to the backend port on the same host IP
  if (window.location.port === "5173" || window.location.port === "3000") {
    fallbackOrigin = `${window.location.protocol}//${window.location.hostname}:5000`;
  } else {
    fallbackOrigin = window.location.origin;
  }
}

export const API_ORIGIN = configuredOrigin || fallbackOrigin;
export const API_BASE = `${API_ORIGIN}/api`.replace(/([^:/]\/)\/{2,}/g, "$1");

const IS_DEV = import.meta.env.DEV;
const DEFAULT_TIMEOUT_MS = 30_000;

// ── Token helpers ────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function clearSession(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_department");
  localStorage.removeItem("user_designation");
  localStorage.removeItem("userId");
  localStorage.removeItem("profileCompleted");
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── File URL helper ──────────────────────────────────────────
export function getFileUrl(filePath?: string | null): string {
  if (!filePath) return "";
  const raw = String(filePath).trim();
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const normalized = raw.replace(/^\/+/, "");
  const resolved = normalized.startsWith("uploads/") ? normalized : `uploads/${normalized}`;
  return API_ORIGIN ? `${API_ORIGIN}/${resolved}` : `/${resolved}`;
}

// ── Internal helpers ─────────────────────────────────────────
async function readResponse(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  if (contentType.includes("text/")) return response.text();
  return response.blob();
}

function withTimeout(promise: Promise<Response>, ms: number): Promise<Response> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out. Please check your connection.")), ms)
  );
  return Promise.race([promise, timeout]);
}

// ── Main apiFetch ────────────────────────────────────────────
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const url = `${API_BASE}${endpoint}`;
  const startTime = Date.now();

  const fetchPromise = fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  let response: Response;
  try {
    response = await withTimeout(fetchPromise, DEFAULT_TIMEOUT_MS);
  } catch (err: any) {
    if (IS_DEV) console.error(`[API] TIMEOUT ${endpoint}`, err.message);
    throw new Error(err.message || "Network error. Please try again.");
  }

  const elapsed = Date.now() - startTime;
  if (IS_DEV) {
    console.log(`[API] ${options.method || "GET"} ${endpoint} → ${response.status} (${elapsed}ms)`);
  }

  // Auth expired → clear session + redirect
  if (response.status === 401) {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    throw new Error("Session expired. Please login again.");
  }

  const data = await readResponse(response);

  if (!response.ok) {
    const message =
      (typeof data === "object" && data?.message) ||
      (typeof data === "string" && data) ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

// ── Upload with progress ─────────────────────────────────────
export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}${endpoint}`);

    const token = getToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data as T);
        } else {
          reject(new Error(data?.message || "Upload failed"));
        }
      } catch {
        reject(new Error("Upload failed: invalid response"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));
    xhr.timeout = 120_000; // 2 min for uploads

    xhr.send(formData);
  });
}

// ── Download blob ────────────────────────────────────────────
export async function apiDownload(
  endpoint: string,
  filename: string
): Promise<void> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) throw new Error("Download failed");

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default API_BASE;
