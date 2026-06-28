// ============================================================
// Upload Hooks – TanStack Query for achievement uploads
// ============================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadService } from "../api/services/uploadService";
import { showToast } from "../utils/toast";
import type { Upload } from "../types";

export const UPLOAD_KEYS = {
  mine: ["uploads", "mine"] as const,
  pendingHod: ["uploads", "pending-hod"] as const,
  pendingAdmin: ["uploads", "pending-admin"] as const,
  department: (dept?: string) => ["uploads", "department", dept] as const,
  faculty: (id: string) => ["uploads", "faculty", id] as const,
};

// ── My Uploads ──────────────────────────────────────────────
export function useMyUploads() {
  return useQuery<Upload[]>({
    queryKey: UPLOAD_KEYS.mine,
    queryFn: () => uploadService.getMyUploads(),
    staleTime: 60_000,
  });
}

// ── Faculty Uploads (HOD/Admin view) ────────────────────────
export function useFacultyUploads(facultyId: string) {
  return useQuery<Upload[]>({
    queryKey: UPLOAD_KEYS.faculty(facultyId),
    queryFn: () => uploadService.getFacultyUploads(facultyId),
    enabled: !!facultyId,
    staleTime: 60_000,
  });
}

// ── Pending for HOD ─────────────────────────────────────────
export function usePendingUploadsForHod() {
  return useQuery<Upload[]>({
    queryKey: UPLOAD_KEYS.pendingHod,
    queryFn: uploadService.getPendingForHod,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ── Pending for Admin ───────────────────────────────────────
export function usePendingUploadsForAdmin() {
  return useQuery<Upload[]>({
    queryKey: UPLOAD_KEYS.pendingAdmin,
    queryFn: uploadService.getPendingForAdmin,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ── Department Uploads ──────────────────────────────────────
export function useDepartmentUploads(department?: string) {
  return useQuery<Upload[]>({
    queryKey: UPLOAD_KEYS.department(department),
    queryFn: () => uploadService.getDepartmentUploads(department),
    staleTime: 60_000,
  });
}

// ── Create Upload ───────────────────────────────────────────
export function useCreateUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      formData,
      onProgress,
    }: {
      formData: FormData;
      onProgress?: (pct: number) => void;
    }) => uploadService.create(formData, onProgress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: UPLOAD_KEYS.mine });
      showToast({ type: "success", message: "Achievement submitted successfully!" });
    },
    onError: (err: Error) => {
      showToast({ type: "error", message: err.message || "Upload failed" });
    },
  });
}

// ── HOD Approve ─────────────────────────────────────────────
export function useHodApprove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => uploadService.hodApprove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: UPLOAD_KEYS.pendingHod });
      showToast({ type: "success", message: "Upload approved!" });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

// ── HOD Bulk Approve ────────────────────────────────────────
export function useHodBulkApprove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => uploadService.hodBulkApprove(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: UPLOAD_KEYS.pendingHod });
      showToast({ type: "success", message: "Uploads approved in bulk!" });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

// ── HOD Return for Revision ─────────────────────────────────
export function useHodReturnForRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      uploadService.hodReturnForRevision(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: UPLOAD_KEYS.pendingHod });
      showToast({ type: "success", message: "Upload returned for revision." });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

// ── HOD Discussion ──────────────────────────────────────────
export function useHodDiscussion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      uploadService.hodDiscussion(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: UPLOAD_KEYS.pendingHod });
      showToast({ type: "success", message: "Comment added." });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

// ── Admin Approve ───────────────────────────────────────────
export function useAdminApprove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => uploadService.adminApprove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: UPLOAD_KEYS.pendingAdmin });
      showToast({ type: "success", message: "Upload approved!" });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

// ── Admin Bulk Approve ──────────────────────────────────────
export function useAdminBulkApprove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => uploadService.adminBulkApprove(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: UPLOAD_KEYS.pendingAdmin });
      showToast({ type: "success", message: "Uploads approved in bulk!" });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

// ── Admin Return for Revision ───────────────────────────────
export function useAdminReturnForRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      uploadService.adminReturnForRevision(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: UPLOAD_KEYS.pendingAdmin });
      showToast({ type: "success", message: "Upload returned for revision." });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

// ── Download Report ─────────────────────────────────────────
export function useDownloadReport() {
  return useMutation({
    mutationFn: (filters: Parameters<typeof uploadService.downloadReport>[0]) =>
      uploadService.downloadReport(filters),
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}
