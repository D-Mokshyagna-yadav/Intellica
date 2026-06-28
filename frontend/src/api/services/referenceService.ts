// ============================================================
// Reference Data Service – departments, categories, academic years
// These are cached aggressively (staleTime: Infinity in queries)
// ============================================================
import { apiFetch } from "../client";
import type { Department, AchievementCategory, AcademicYear, Semester } from "../../types";

export const referenceService = {
  getDepartments: () => apiFetch<Department[]>("/departments"),

  getCategories: () => apiFetch<AchievementCategory[]>("/categories"),

  getAcademicYears: () => apiFetch<AcademicYear[]>("/academic-years"),

  getSemesters: (academicYearId?: string) => {
    const q = academicYearId ? `?academicYear=${academicYearId}` : "";
    return apiFetch<Semester[]>(`/semesters${q}`);
  },

  getCurrentAcademicYear: () => apiFetch<AcademicYear>("/academic-years/current"),

  getCurrentSemester: () => apiFetch<Semester>("/semesters/current"),
};
