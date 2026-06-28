// ============================================================
// API barrel – everything importable from "../../api"
// Usage: import { apiFetch, apiDownload, getFileUrl } from "@/api"
// ============================================================
export {
  apiFetch,
  apiUpload,
  apiDownload,
  getAuthHeaders,
  getFileUrl,
  getToken,
  clearSession,
  API_BASE,
  API_ORIGIN,
} from "./client";

export { default } from "./client";

// Re-export services for convenience
export * from "./services";
