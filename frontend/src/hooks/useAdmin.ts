// ============================================================
// Admin Hooks – TanStack Query wrappers for admin operations
// ============================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import { adminService } from "../api/services/adminService";
import { showToast } from "../utils/toast";
import type { Faculty, HOD, Announcement, AppSettings } from "../types";
import type { UserListParams } from "../api/services/adminService";

export const ADMIN_KEYS = {
  allUsers: (params?: object) => ["admin", "users", params] as const,
  pendingFaculty: ["admin", "pending-faculty"] as const,
  pendingHods: ["admin", "pending-hods"] as const,
  announcements: ["admin", "announcements"] as const,
  settings: ["admin", "settings"] as const,
};

// ── Users ────────────────────────────────────────────────────
export function useAllUsers(params?: UserListParams) {
  return useQuery<(Faculty | HOD)[]>({
    queryKey: ADMIN_KEYS.allUsers(params),
    queryFn: () => adminService.getAllUsers(params),
    staleTime: 60_000,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      showToast({ type: "success", message: "User created successfully!" });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

export function useImportUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => adminService.importUsers(formData),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      showToast({
        type: "success",
        message: `Imported ${data.created} users (${data.skipped} skipped)`,
      });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

export function useExportUsers() {
  return useMutation({
    mutationFn: adminService.exportUsers,
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

// ── Faculty Approval ─────────────────────────────────────────
export function usePendingFaculty() {
  return useQuery<Faculty[]>({
    queryKey: ADMIN_KEYS.pendingFaculty,
    queryFn: adminService.getPendingFaculty,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useApproveFaculty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.approveFaculty(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.pendingFaculty });
      showToast({ type: "success", message: "Faculty approved!" });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

export function useRejectFaculty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminService.rejectFaculty(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.pendingFaculty });
      showToast({ type: "success", message: "Faculty rejected." });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

// ── HOD Approval ─────────────────────────────────────────────
export function usePendingHods() {
  return useQuery<HOD[]>({
    queryKey: ADMIN_KEYS.pendingHods,
    queryFn: adminService.getPendingHods,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useApproveHod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.approveHod(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.pendingHods });
      showToast({ type: "success", message: "HOD approved!" });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

export function useRejectHod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminService.rejectHod(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.pendingHods });
      showToast({ type: "success", message: "HOD rejected." });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

// ── Department Ops ───────────────────────────────────────────
export function useMergeDepartments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ source, target }: { source: string; target: string }) =>
      adminService.mergeDepartments(source, target),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ref", "departments"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      showToast({ type: "success", message: "Departments merged successfully!" });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

export function usePromoteToHod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (facultyId: string) => adminService.promoteToHod(facultyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      showToast({ type: "success", message: "Faculty promoted to HOD!" });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

export function useDemoteToFaculty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hodId: string) => adminService.demoteToFaculty(hodId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      showToast({ type: "success", message: "HOD demoted to Faculty." });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

// ── Announcements ────────────────────────────────────────────
export function useAnnouncements() {
  return useQuery<Announcement[]>({
    queryKey: ADMIN_KEYS.announcements,
    queryFn: adminService.getAnnouncements,
    staleTime: 5 * 60_000,
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminService.createAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.announcements });
      showToast({ type: "success", message: "Announcement published!" });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteAnnouncement(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ADMIN_KEYS.announcements });
      const previous = qc.getQueryData<Announcement[]>(ADMIN_KEYS.announcements);
      qc.setQueryData<Announcement[]>(ADMIN_KEYS.announcements, (old = []) =>
        old.filter((a) => a._id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(ADMIN_KEYS.announcements, ctx.previous);
      showToast({ type: "error", message: "Failed to delete announcement" });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.announcements }),
  });
}

// ── Settings ─────────────────────────────────────────────────
export function useSettings() {
  return useQuery<AppSettings[]>({
    queryKey: ADMIN_KEYS.settings,
    queryFn: adminService.getSettings,
    staleTime: 10 * 60_000,
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      adminService.updateSetting(key, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.settings });
      showToast({ type: "success", message: "Setting updated!" });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

// ── Reports ──────────────────────────────────────────────────
export function useDownloadAdminReport() {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: Parameters<typeof adminService.downloadReport>[0];
      format?: "xlsx" | "csv";
    }) => adminService.downloadReport(filters, format),
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

// ── Stats (dashboard summary) ────────────────────────────────
export function useAdminStats() {
  return useQuery<{
    totalFaculty?: number;
    totalDepartments?: number;
    pendingApprovals?: number;
    totalCredits?: number;
  } | null>({
    queryKey: ["admin", "stats"],
    queryFn: () => apiFetch("/admin/stats").catch(() => null),
    staleTime: 2 * 60_000,
  });
}
