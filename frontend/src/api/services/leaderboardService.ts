// ============================================================
// Leaderboard Service
// ============================================================
import { apiFetch } from "../client";
import type { LeaderboardEntry, DepartmentRankEntry } from "../../types";

export const leaderboardService = {
  /** Global leaderboard (all departments, all faculty) */
  getGlobal: (params?: { academicYear?: string; semester?: string; limit?: number }) => {
    const q = new URLSearchParams(params as any).toString();
    return apiFetch<LeaderboardEntry[]>(`/rankings/global${q ? `?${q}` : ""}`);
  },

  /** Department-level leaderboard (faculty within a department) */
  getDepartment: (department?: string) => {
    const q = department ? `?department=${department}` : "";
    return apiFetch<LeaderboardEntry[]>(`/rankings/department${q}`);
  },

  /** Department-vs-department rankings */
  getDepartmentRanks: () =>
    apiFetch<DepartmentRankEntry[]>("/rankings/departments"),

  /** Current user's rank + stats */
  getMyRank: () =>
    apiFetch<{ rank: number; totalFaculty: number; myCredits: number; departmentRank: number }>("/rankings/my-rank"),
};
