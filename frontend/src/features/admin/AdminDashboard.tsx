import { useState } from "react";
import { useAdminStats } from "../../hooks/useAdmin";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

// Admin Sections (legacy — kept for backward compatibility)
import AdminHome from "../../pages/admin/sections/AdminHome";
import DepartmentManagement from "../../pages/admin/sections/DepartmentManagement";
import FacultyList from "../../pages/admin/sections/FacultyList";
import HodList from "../../pages/admin/sections/HodList";
import ManualUsers from "../../pages/admin/sections/ManualUsers";
import ApproveHodUploads from "../../pages/admin/sections/ApproveHodUploads";
import DepartmentAnalytics from "../../pages/admin/sections/DepartmentAnalytics";
import CreditConfig from "../../pages/admin/sections/credit-config/CreditConfig";
import AnnouncementCenter from "./AnnouncementCenter";

export default function AdminDashboard() {
  const [view, setView] = useState("home");

  // ── Data via hook (no raw fetch) ────────────────────────────
  const { data: stats } = useAdminStats();


  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="page-shell p-6 sm:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="stat-pill mb-3">
              <span className="material-symbols-outlined text-[16px] text-primary">shield_lock</span>
              Platform administration
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">Manage the Intellica platform from one polished workspace.</p>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: 'Total Faculty', value: stats.totalFaculty ?? '—', accent: 'from-blue-600 to-indigo-600', text: 'text-white' },
            { title: 'Departments', value: stats.totalDepartments ?? '—', accent: 'from-slate-900 to-slate-700', text: 'text-white' },
            { title: 'Pending Approvals', value: stats.pendingApprovals ?? '—', accent: 'from-amber-500 to-orange-500', text: 'text-white' },
            { title: 'Total Credits Awarded', value: stats.totalCredits ?? '—', accent: 'from-emerald-500 to-teal-500', text: 'text-white' },
          ].map((card) => (
            <Card key={card.title} className={`border-0 bg-gradient-to-br ${card.accent} shadow-[0_16px_40px_rgba(15,23,42,0.12)]`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${card.text}/80`}>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-semibold ${card.text}`}>{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs value={view} onValueChange={setView} className="w-full">
        <TabsList className="mb-6 flex-wrap justify-start gap-2 rounded-[999px] border border-slate-200/70 bg-white/70 p-2 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl">
          <TabsTrigger value="home" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Dashboard</TabsTrigger>
          <TabsTrigger value="departments" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Departments</TabsTrigger>
          <TabsTrigger value="users" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Add Users</TabsTrigger>
          <TabsTrigger value="faculty" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Faculty Profiles</TabsTrigger>
          <TabsTrigger value="hod" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">HOD Accounts</TabsTrigger>
          <TabsTrigger value="approve" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">HOD Uploads</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Analytics</TabsTrigger>
          <TabsTrigger value="credit" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Credit Config</TabsTrigger>
          <TabsTrigger value="announcements" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <AdminHome setView={setView} />
        </TabsContent>
        <TabsContent value="departments">
          <DepartmentManagement />
        </TabsContent>
        <TabsContent value="users">
          <ManualUsers />
        </TabsContent>
        <TabsContent value="faculty">
          <FacultyList />
        </TabsContent>
        <TabsContent value="hod">
          <HodList />
        </TabsContent>
        <TabsContent value="approve">
          <ApproveHodUploads />
        </TabsContent>
        <TabsContent value="analytics">
          <DepartmentAnalytics />
        </TabsContent>
        <TabsContent value="credit">
          <CreditConfig />
        </TabsContent>
        <TabsContent value="announcements">
          <AnnouncementCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
