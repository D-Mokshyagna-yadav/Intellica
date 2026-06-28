// ============================================================
// Leaderboard Hooks
// ============================================================
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import { leaderboardService } from "../api/services/leaderboardService";
import type { LeaderboardEntry, DepartmentRankEntry } from "../types";

export const LEADERBOARD_KEYS = {
  global: (params?: object) => ["leaderboard", "global", params] as const,
  department: (dept?: string) => ["leaderboard", "department", dept] as const,
  departmentRanks: ["leaderboard", "department-ranks"] as const,
  myRank: ["leaderboard", "my-rank"] as const,
};

export function useGlobalLeaderboard(params?: {
  academicYear?: string;
  semester?: string;
  limit?: number;
}) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: LEADERBOARD_KEYS.global(params),
    queryFn: () => leaderboardService.getGlobal(params),
    staleTime: 2 * 60_000,
  });
}

export function useDepartmentLeaderboard(department?: string) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: LEADERBOARD_KEYS.department(department),
    queryFn: () => leaderboardService.getDepartment(department),
    staleTime: 2 * 60_000,
  });
}

export function useDepartmentRanks() {
  return useQuery<DepartmentRankEntry[]>({
    queryKey: LEADERBOARD_KEYS.departmentRanks,
    queryFn: leaderboardService.getDepartmentRanks,
    staleTime: 5 * 60_000,
  });
}

export function useMyRank() {
  return useQuery<{
    rank: number;
    totalFaculty: number;
    myCredits: number;
    departmentRank: number;
  }>({
    queryKey: LEADERBOARD_KEYS.myRank,
    queryFn: leaderboardService.getMyRank,
    staleTime: 2 * 60_000,
  });
}

// Faculty-level leaderboard (HOD / Admin only)
// Filters by department if provided
export function useFacultyLeaderboard(department?: string) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", "faculty", department] as const,
    queryFn: async () => {
      const q = department ? `?department=${encodeURIComponent(department)}` : "";
      return apiFetch(`/rankings/faculty${q}`);
    },
    staleTime: 2 * 60_000,
  });
}
