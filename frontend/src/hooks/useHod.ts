// ============================================================
// HOD Hooks – TanStack Query wrappers for HOD operations
// ============================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hodService } from "../api/services/hodService";
import { showToast } from "../utils/toast";
import type { Faculty } from "../types";

export const HOD_KEYS = {
  myFaculty: ["hod", "faculty"] as const,
  pendingFaculty: ["hod", "pending-faculty"] as const,
  facultyProfile: (id: string) => ["hod", "faculty", id] as const,
  facultyUploads: (id: string) => ["hod", "faculty-uploads", id] as const,
  departmentUploads: ["hod", "department-uploads"] as const,
};

export function useMyFaculty() {
  return useQuery<Faculty[]>({
    queryKey: HOD_KEYS.myFaculty,
    queryFn: hodService.getMyFaculty,
    staleTime: 60_000,
  });
}

export function useHodPendingFaculty() {
  return useQuery<Faculty[]>({
    queryKey: HOD_KEYS.pendingFaculty,
    queryFn: hodService.getPendingFaculty,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useFacultyProfile(facultyId: string) {
  return useQuery<Faculty>({
    queryKey: HOD_KEYS.facultyProfile(facultyId),
    queryFn: () => hodService.getFacultyProfile(facultyId),
    enabled: !!facultyId,
    staleTime: 5 * 60_000,
  });
}

export function useHodFacultyUploads(facultyId: string) {
  return useQuery({
    queryKey: HOD_KEYS.facultyUploads(facultyId),
    queryFn: () => hodService.getFacultyUploads(facultyId),
    enabled: !!facultyId,
    staleTime: 60_000,
  });
}

export function useHodDepartmentUploads() {
  return useQuery({
    queryKey: HOD_KEYS.departmentUploads,
    queryFn: hodService.getDepartmentUploads,
    staleTime: 60_000,
  });
}

export function useCreateFaculty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hodService.createFaculty,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOD_KEYS.myFaculty });
      showToast({ type: "success", message: "Faculty created successfully!" });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

export function useHodApproveFaculty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hodService.approveFaculty(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOD_KEYS.pendingFaculty });
      qc.invalidateQueries({ queryKey: HOD_KEYS.myFaculty });
      showToast({ type: "success", message: "Faculty approved!" });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}

export function useHodRejectFaculty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      hodService.rejectFaculty(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOD_KEYS.pendingFaculty });
      showToast({ type: "success", message: "Registration rejected." });
    },
    onError: (err: Error) => showToast({ type: "error", message: err.message }),
  });
}
