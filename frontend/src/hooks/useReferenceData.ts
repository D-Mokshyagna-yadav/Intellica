// ============================================================
// Reference Data Hooks – departments, categories, academic years
// Aggressively cached – these rarely change
// ============================================================
import { useQuery } from "@tanstack/react-query";
import { referenceService } from "../api/services/referenceService";
import type { Department, AchievementCategory, AcademicYear, Semester } from "../types";

export const REF_KEYS = {
  departments: ["ref", "departments"] as const,
  categories: ["ref", "categories"] as const,
  academicYears: ["ref", "academic-years"] as const,
  semesters: (yearId?: string) => ["ref", "semesters", yearId] as const,
  currentYear: ["ref", "academic-years", "current"] as const,
  currentSemester: ["ref", "semesters", "current"] as const,
};

export function useDepartments() {
  return useQuery<Department[]>({
    queryKey: REF_KEYS.departments,
    queryFn: referenceService.getDepartments,
    staleTime: Infinity, // departments almost never change
    gcTime: 24 * 60 * 60_000,
  });
}

export function useCategories() {
  return useQuery<AchievementCategory[]>({
    queryKey: REF_KEYS.categories,
    queryFn: referenceService.getCategories,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60_000,
  });
}

export function useAcademicYears() {
  return useQuery<AcademicYear[]>({
    queryKey: REF_KEYS.academicYears,
    queryFn: referenceService.getAcademicYears,
    staleTime: 30 * 60_000,
  });
}

export function useSemesters(academicYearId?: string) {
  return useQuery<Semester[]>({
    queryKey: REF_KEYS.semesters(academicYearId),
    queryFn: () => referenceService.getSemesters(academicYearId),
    staleTime: 30 * 60_000,
  });
}

export function useCurrentAcademicYear() {
  return useQuery<AcademicYear>({
    queryKey: REF_KEYS.currentYear,
    queryFn: referenceService.getCurrentAcademicYear,
    staleTime: 60 * 60_000,
  });
}

export function useCurrentSemester() {
  return useQuery<Semester>({
    queryKey: REF_KEYS.currentSemester,
    queryFn: referenceService.getCurrentSemester,
    staleTime: 60 * 60_000,
  });
}
