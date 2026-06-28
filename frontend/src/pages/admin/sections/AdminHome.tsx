import { useState } from "react";
import {
  Building2, Users, ClipboardCheck, BarChart3, Settings, Plus, ChevronRight
} from "lucide-react";
import { useEffect } from "react";
import { useResponsive } from "../../../hooks/useResponsive";
import { showToast } from "../../../utils/toast";

export default function AdminHome({ setView }) {
  const responsive = useResponsive();

  const [stats, setStats] = useState({
    departments: 0,
    faculties: 0,
    pendingUploads: 0
  });

  const [topDepartments, setTopDepartments] = useState([]);
  const [activityStats, setActivityStats] = useState([]);

  const token = localStorage.getItem("token");

  /* ================= FETCH DASHBOARD DATA ================= */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const depRes = await fetch("/api/admin/departments", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const depData = await depRes.json();
        const departmentCount = Array.isArray(depData) ? depData.length : 0;

        const depRankRes = await fetch("/api/admin/top-departments", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const depRankData = await depRankRes.json();
        setTopDepartments(depRankData);

        const actRes = await fetch("/api/admin/activity-stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const actData = await actRes.json();
        setActivityStats(actData);

        const uploadRes = await fetch("/api/admin/pending-uploads", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const uploadData = await uploadRes.json();

        const userRes = await fetch("/api/admin/all-users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userRes.json();

        const totalFacultyAndHOD = Array.isArray(userData)
          ? userData.filter(u => ["FACULTY", "HOD"].includes((u.role || "").toUpperCase())).length
          : 0;

        const pendingCount = Array.isArray(uploadData)
          ? uploadData.filter(u => u.status !== "ADMIN_APPROVED").length
          : 0;

        setStats({
          departments: departmentCount,
          faculties: totalFacultyAndHOD,
          pendingUploads: pendingCount
        });
      } catch (err) {
        showToast({ type: "error", message: err.message || "Failed to load admin dashboard" });
      }
    };

    fetchStats();
  }, [token]);

  /* ================= STAT CARDS CONFIG ================= */
  const statCards = [
    {
      title: "Departments",
      value: stats.departments,
      icon: Building2,
      view: "analytics",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Faculty & HOD",
      value: stats.faculties,
      icon: Users,
      view: "faculty",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingUploads,
      icon: ClipboardCheck,
      view: "approve",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  /* ================= QUICK ACTIONS ================= */
  const quickActions = [
    { label: "Add Users", view: "users", icon: Plus },
    { label: "Manage Departments", view: "departments", icon: Building2 },
    { label: "Credit Config", view: "credit", icon: Settings },
    { label: "Analytics", view: "analytics", icon: BarChart3 },
  ];

  const medals = ["🥇", "🥈", "🥉"];
  const maxActivity = Math.max(...activityStats.map((x) => x.count), 1);

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-on-surface mb-1">
          Welcome, Admin 👋
        </h1>
        <p className="text-on-surface-variant font-body-md">
          System overview and management controls at a glance.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map(({ label, view, icon: Icon }) => (
          <button
            key={view}
            onClick={() => setView(view)}
            className="flex items-center gap-2 px-5 py-2.5 bg-glass-card border border-subtle rounded-xl text-on-surface font-medium hover:border-primary/50 hover:bg-surface-bright/30 transition-all"
          >
            <Icon size={16} className="text-primary" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map(({ title, value, icon: Icon, view, color, bg }) => (
          <button
            key={view}
            onClick={() => setView(view)}
            className="bg-glass-card rounded-2xl p-6 border border-subtle text-left hover:border-primary/50 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${bg}`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <ChevronRight size={18} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-on-surface-variant text-sm font-medium mb-1">{title}</p>
            <h2 className="text-4xl font-display font-bold text-on-surface">{value}</h2>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Departments */}
        <div className="bg-glass-card rounded-2xl p-6 border border-subtle">
          <h3 className="text-lg font-bold text-on-surface mb-5">Top Departments by Credits</h3>
          {topDepartments.length === 0 ? (
            <p className="text-on-surface-variant py-6 text-center">No department data available yet.</p>
          ) : (
            <div className="space-y-3">
              {topDepartments.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-bright/20 border border-subtle/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center">
                      {i < 3 ? medals[i] : <span className="text-on-surface-variant font-bold">{i + 1}.</span>}
                    </span>
                    <span className="font-medium text-on-surface">
                      {d.departmentName || d.department}
                    </span>
                  </div>
                  <span className="font-bold text-primary">{d.credits} Credits</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Popular Activities */}
        <div className="bg-glass-card rounded-2xl p-6 border border-subtle">
          <h3 className="text-lg font-bold text-on-surface mb-5">Most Popular Activities</h3>
          {activityStats.length === 0 ? (
            <p className="text-on-surface-variant py-6 text-center">No activity data available yet.</p>
          ) : (
            <div className="space-y-3">
              {activityStats.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-on-surface-variant text-sm w-32 capitalize truncate">
                    {a.category}
                  </span>
                  <div className="flex-1 h-2 bg-surface-bright/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(a.count / maxActivity) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant w-6 text-right">
                    {a.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
