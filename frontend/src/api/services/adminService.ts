// ============================================================
// Admin Service – admin-only operations
// ============================================================
import { apiFetch, apiDownload } from "../client";
import type { Faculty, HOD, Department, Announcement, AppSettings, PaginationParams, ReportFilters } from "../../types";

export interface UserListParams extends PaginationParams {
  department?: string;
  status?: string;
  role?: string;
}

export const adminService = {
  // ── Users ──────────────────────────────────────────────────
  getAllUsers: (params?: UserListParams) => {
    const q = new URLSearchParams(params as any).toString();
    return apiFetch<(Faculty | HOD)[]>(`/admin/all-users${q ? `?${q}` : ""}`);
  },

  createUser: (data: {
    employeeId: string;
    name: string;
    email: string;
    department: string;
    designation: string;
    role: "FACULTY" | "HOD";
    password?: string;
  }) =>
    apiFetch<{ message: string }>("/admin/create-user", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  exportUsers: (params?: { department?: string; role?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return apiDownload(`/admin/export-users${q ? `?${q}` : ""}`, `intellica-users-${Date.now()}.xlsx`);
  },

  importUsers: (formData: FormData) =>
    apiFetch<{ message: string; created: number; skipped: number }>("/admin/import-users", {
      method: "POST",
      body: formData,
    }),

  // ── Faculty Approval ───────────────────────────────────────
  getPendingFaculty: () => apiFetch<Faculty[]>("/admin/pending-faculty"),

  approveFaculty: (id: string) =>
    apiFetch<{ message: string }>(`/admin/approve-faculty/${id}`, { method: "PUT" }),

  rejectFaculty: (id: string, reason?: string) =>
    apiFetch<{ message: string }>(`/admin/reject-faculty/${id}`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),

  // ── HOD Approval ───────────────────────────────────────────
  getPendingHods: () => apiFetch<HOD[]>("/admin/pending-hods"),

  approveHod: (id: string) =>
    apiFetch<{ message: string }>(`/admin/approve-hod/${id}`, { method: "PUT" }),

  rejectHod: (id: string, reason?: string) =>
    apiFetch<{ message: string }>(`/admin/reject-hod/${id}`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),

  // ── Department Management ──────────────────────────────────
  getDepartments: () => apiFetch<Department[]>("/admin/departments"),

  mergeDepartments: (sourceCode: string, targetCode: string) =>
    apiFetch<{ message: string }>("/admin/merge-departments", {
      method: "POST",
      body: JSON.stringify({ sourceDepartment: sourceCode, targetDepartment: targetCode }),
    }),

  promoteToHod: (facultyId: string) =>
    apiFetch<{ message: string }>(`/admin/promote-hod/${facultyId}`, { method: "POST" }),

  demoteToFaculty: (hodId: string) =>
    apiFetch<{ message: string }>(`/admin/demote-faculty/${hodId}`, { method: "POST" }),

  // ── Announcements ──────────────────────────────────────────
  getAnnouncements: () => apiFetch<Announcement[]>("/announcements"),

  createAnnouncement: (data: {
    title: string;
    body: string;
    audienceRoles?: string[];
    audienceDepartment?: string;
    expiresAt?: string;
  }) =>
    apiFetch<{ message: string; announcement: Announcement }>("/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteAnnouncement: (id: string) =>
    apiFetch<{ message: string }>(`/announcements/${id}`, { method: "DELETE" }),

  // ── Settings ───────────────────────────────────────────────
  getSettings: () => apiFetch<AppSettings[]>("/settings"),

  updateSetting: (key: string, value: any) =>
    apiFetch<{ message: string }>(`/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    }),

  // ── Reports ────────────────────────────────────────────────
  getReport: (filters: ReportFilters) => {
    const q = new URLSearchParams(filters as any).toString();
    return apiFetch<{ data: any[]; summary: any }>(`/admin/reports?${q}`);
  },

  downloadReport: (filters: ReportFilters, format: "xlsx" | "csv" = "xlsx") => {
    const q = new URLSearchParams({ ...filters, format } as any).toString();
    return apiDownload(`/admin/reports/export?${q}`, `intellica-report-${Date.now()}.${format}`);
  },
};
