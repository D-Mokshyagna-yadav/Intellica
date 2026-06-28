// ============================================================
// HOD Service – HOD-specific operations
// ============================================================
import { apiFetch } from "../client";
import type { Faculty } from "../../types";

export const hodService = {
  // ── Faculty under this HOD ─────────────────────────────────
  getMyFaculty: () => apiFetch<Faculty[]>("/hod/faculty"),

  createFaculty: (data: {
    employeeId: string;
    name: string;
    email: string;
    designation: string;
    password?: string;
  }) =>
    apiFetch<{ message: string }>("/hod/create-faculty", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getFacultyProfile: (facultyId: string) =>
    apiFetch<Faculty>(`/auth/faculty/${facultyId}`),

  getFacultyUploads: (facultyId: string) =>
    apiFetch(`/hod/faculty-uploads/${facultyId}`),

  getDepartmentUploads: () => apiFetch(`/hod/department-uploads`),

  // ── Pending Faculty Registrations ─────────────────────────
  getPendingFaculty: () => apiFetch<Faculty[]>("/hod/pending-faculty"),

  approveFaculty: (id: string) =>
    apiFetch<{ message: string }>(`/hod/approve-faculty/${id}`, { method: "PUT" }),

  rejectFaculty: (id: string, reason?: string) =>
    apiFetch<{ message: string }>(`/hod/reject-faculty/${id}`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),
};
