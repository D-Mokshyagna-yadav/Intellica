// ============================================================
// Upload Service – achievement upload CRUD + approval workflow
// ============================================================
import { apiFetch, apiUpload, apiDownload } from "../client";
import type { Upload, PaginationParams, ReportFilters } from "../../types";

export interface UploadListParams extends PaginationParams {
  status?: string;
  department?: string;
  academicYear?: string;
  semester?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
}

export const uploadService = {
  /** Submit a new achievement upload */
  create: (formData: FormData, onProgress?: (pct: number) => void) =>
    apiUpload<{ message: string; upload: Upload }>("/uploads", formData, onProgress),

  /** Get current user's uploads */
  getMyUploads: (params?: UploadListParams) => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch<Upload[]>(`/uploads/mine${query ? `?${query}` : ""}`);
  },

  /** Update an existing upload */
  update: (id: string, formData: FormData, onProgress?: (pct: number) => void) =>
    apiUpload<{ message: string; upload: Upload }>(`/uploads/${id}`, formData, onProgress),

  /** Get uploads for a specific faculty (HOD/Admin) */
  getFacultyUploads: (facultyId: string) =>
    apiFetch<Upload[]>(`/uploads/faculty/${facultyId}`),

  /** Get uploads by category */
  getByCategory: (category: string, facultyId?: string) => {
    const q = facultyId ? `?facultyId=${facultyId}` : "";
    return apiFetch<Upload[]>(`/uploads/category/${category}${q}`);
  },

  // ── HOD Approval ───────────────────────────────────────────
  /** Get pending uploads for HOD */
  getPendingForHod: () => apiFetch<Upload[]>("/hod/pending-uploads"),

  /** HOD approves upload */
  hodApprove: (id: string) =>
    apiFetch<{ message: string }>(`/hod/approve-upload/${id}`, { method: "PUT" }),

  /** HOD bulk approve */
  hodBulkApprove: (uploadIds: string[]) =>
    apiFetch<{ message: string }>("/hod/bulk-approve", {
      method: "POST",
      body: JSON.stringify({ uploadIds }),
    }),

  /** HOD returns upload for revision */
  hodReturnForRevision: (id: string, reason: string) =>
    apiFetch<{ message: string; upload: Upload }>(`/hod/return-revision/${id}`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),

  /** HOD adds comment/discussion */
  hodDiscussion: (id: string, comment: string) =>
    apiFetch<{ message: string; upload: Upload }>(`/hod/discussion/${id}`, {
      method: "PUT",
      body: JSON.stringify({ comment }),
    }),

  // ── Admin Approval ─────────────────────────────────────────
  /** Get pending uploads for Admin */
  getPendingForAdmin: () => apiFetch<Upload[]>("/admin/pending-uploads"),

  /** Admin approves upload */
  adminApprove: (id: string) =>
    apiFetch<{ message: string }>(`/admin/approve-upload/${id}`, { method: "POST" }),

  /** Admin bulk approve */
  adminBulkApprove: (uploadIds: string[]) =>
    apiFetch<{ message: string }>("/admin/bulk-approve", {
      method: "POST",
      body: JSON.stringify({ uploadIds }),
    }),

  /** Admin returns upload for revision */
  adminReturnForRevision: (id: string, reason: string) =>
    apiFetch<{ message: string; upload: Upload }>(`/admin/return-revision/${id}`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),

  /** Admin adds discussion comment */
  adminDiscussion: (id: string, comment: string) =>
    apiFetch<{ message: string; upload: Upload }>(`/admin/discussion/${id}`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    }),

  // ── Department / Reports ───────────────────────────────────
  /** Get department uploads (HOD sees own dept, Admin can filter) */
  getDepartmentUploads: (department?: string) => {
    const q = department ? `?department=${department}` : "";
    return apiFetch<Upload[]>(`/uploads/department${q}`);
  },

  /** Department rank for current HOD user */
  getDepartmentRank: () => apiFetch<{ rank: number; totalDepts: number; myDept: string }>("/uploads/department-rank"),

  // ── Downloads ──────────────────────────────────────────────
  /** Download achievement report as Excel */
  downloadReport: (filters: ReportFilters) => {
    const q = new URLSearchParams(filters as any).toString();
    return apiDownload(`/admin/reports/export?${q}`, `intellica-report-${Date.now()}.xlsx`);
  },
};
