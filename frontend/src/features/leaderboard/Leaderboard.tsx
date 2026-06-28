import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Service hooks – no raw apiFetch in UI components
import { useMe } from "../../hooks/useAuth";
import { useGlobalLeaderboard, useFacultyLeaderboard, useMyRank } from "../../hooks/useLeaderboard";

interface RankEntry {
  department: string;
  rank: number;
  monthlyScore: number;
  semesterScore: number;
  yearlyScore: number;
  overallScore: number;
  score?: number;
  facultyCount: number;
  progress?: number;
  trend?: number;
  medal?: string;
  topCategories?: { name: string; score: number }[];
  // Faculty-level fields (HOD/Admin view only)
  name?: string;
  employeeId?: string;
  departmentRank?: number;
  collegeRank?: number;
  collegeTotal?: number;
  departmentTotal?: number;
}

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-slate-400 text-sm font-mono">#{rank}</span>;
}

function TrendIcon({ trend }: { trend?: number }) {
  if (trend === undefined || trend === 0) return <Minus className="w-4 h-4 text-slate-400" />;
  if (trend > 0) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  return <TrendingDown className="w-4 h-4 text-red-400" />;
}

export default function Leaderboard() {
  const { data: me } = useMe();
  const role = me?.role ?? localStorage.getItem("user_role");
  const isFaculty = role === "FACULTY";

  const [department, setDepartment] = useState("All");
  const [scope, setScope] = useState<"department" | "college">("department");

  // ── Data via hooks (no raw fetch) ──────────────────────────
  const { data: deptData = [], isLoading: deptLoading } = useGlobalLeaderboard();
  const { data: facultyData = [], isLoading: facultyLoading } = useFacultyLeaderboard(
    department !== "All" ? department : undefined,
  );
  const { data: myRank } = useMyRank();

  const loading = deptLoading || (!isFaculty && facultyLoading);


  const departmentOptions = useMemo(
    () => Array.from(new Set(deptData.map((r) => r.department).filter(Boolean))).sort(),
    [deptData]
  );

  const sortedDept = useMemo(
    () =>
      deptData
        .filter((r) => department === "All" || r.department === department)
        .slice()
        .sort((a, b) => a.rank - b.rank),
    [deptData, department]
  );

  // For faculty: mask all names — show only rank numbers and own row highlighted
  const sortedFaculty = useMemo(() => {
    if (isFaculty) return []; // Never shown
    return facultyData
      .filter((r) => department === "All" || r.department === department)
      .slice()
      .sort((a, b) => (a.departmentRank ?? 0) - (b.departmentRank ?? 0));
  }, [facultyData, isFaculty, department]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isFaculty
              ? "Your ranking within your department and college."
              : "Rankings across departments and faculty contributors."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Departments</option>
            {departmentOptions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {!isFaculty && (
            <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setScope("department")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  scope === "department"
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                Departments
              </button>
              <button
                onClick={() => setScope("college")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  scope === "college"
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                Faculty
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Faculty Self-View */}
      {isFaculty && myRank && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Your Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{myRank.score ?? "—"}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Department Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myRank.departmentRank} <span className="text-base text-slate-400">/ {myRank.departmentTotal}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">College Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myRank.collegeRank} <span className="text-base text-slate-400">/ {myRank.collegeTotal}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Privacy notice for faculty */}
      {isFaculty && (
        <Card className="border border-indigo-100 bg-indigo-50 dark:bg-indigo-950 dark:border-indigo-800">
          <CardContent className="pt-4 text-sm text-indigo-700 dark:text-indigo-300">
            🔒 Individual faculty names and scores are private. You can only see department-level rankings and your own position.
          </CardContent>
        </Card>
      )}

      {/* Department Rankings Table */}
      {(isFaculty || scope === "department") && (
        <Card className="shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle>Department Rankings</CardTitle>
            <CardDescription>Ranked by overall score across all academic activities.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : sortedDept.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">No ranking data available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                      <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Rank</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Department</th>
                      <th className="text-right px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Overall</th>
                      <th className="text-right px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Monthly</th>
                      <th className="text-right px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Semester</th>
                      <th className="text-right px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Faculty</th>
                      <th className="text-center px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedDept.map((row, i) => (
                      <tr
                        key={row.department}
                        className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          i < 3 ? "font-medium" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <MedalIcon rank={row.rank ?? i + 1} />
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{row.department}</td>
                        <td className="px-6 py-4 text-right tabular-nums font-semibold text-primary">{row.overallScore ?? row.score ?? "—"}</td>
                        <td className="px-6 py-4 text-right tabular-nums text-slate-600 dark:text-slate-400">{row.monthlyScore ?? "—"}</td>
                        <td className="px-6 py-4 text-right tabular-nums text-slate-600 dark:text-slate-400">{row.semesterScore ?? "—"}</td>
                        <td className="px-6 py-4 text-right tabular-nums text-slate-500">{row.facultyCount ?? "—"}</td>
                        <td className="px-6 py-4 flex justify-center">
                          <TrendIcon trend={row.trend} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Faculty Rankings (HOD / Admin only) */}
      {!isFaculty && scope === "college" && (
        <Card className="shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle>Faculty Rankings</CardTitle>
            <CardDescription>Individual faculty performance across departments.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : sortedFaculty.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">No faculty ranking data available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                      <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Dept Rank</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Name</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Department</th>
                      <th className="text-right px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Score</th>
                      <th className="text-right px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">College Rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedFaculty.map((row) => (
                      <tr
                        key={row.employeeId ?? row.name}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <MedalIcon rank={row.departmentRank ?? 0} />
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{row.name}</td>
                        <td className="px-6 py-4 text-slate-500">{row.department}</td>
                        <td className="px-6 py-4 text-right tabular-nums font-semibold text-primary">{row.score ?? "—"}</td>
                        <td className="px-6 py-4 text-right tabular-nums text-slate-500">
                          {row.collegeRank} <span className="text-slate-400">/ {row.collegeTotal}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
