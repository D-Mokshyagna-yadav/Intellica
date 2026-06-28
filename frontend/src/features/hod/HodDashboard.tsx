import { useState, useMemo } from "react";
import { useDepartments } from "../../hooks/useReferenceData";
import { useMe } from "../../hooks/useAuth";
import { useHodDepartmentUploads } from "../../hooks/useHod";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

// Legacy HOD Sections
import ApproveUploads from "../../pages/hod/sections/ApproveUploads";
import ApproveFaculty from "../../pages/hod/sections/ApproveFaculty";
import FacultyProfiles from "../../pages/hod/sections/FacultyProfiles";
import DepartmentDashboard from "../../pages/hod/sections/DepartmentDashboard";
import HodPersonalDashboard from "../../pages/hod/sections/HodPersonalDashboard";
import DepartmentAnalytics from "../../pages/hod/sections/DepartmentAnalytics";
import CreditConfigViewer from "../../pages/admin/sections/credit-config/common/CreditConfigViewer";

// Legacy Subcomponents
import ProfessionalDevelopment from "../../pages/faculty/ProfessionalDevelopment";
import RnD from "../../pages/faculty/RnD";
import Conferences from "../../pages/faculty/categories/Conferences";
import Workshops from "../../pages/faculty/categories/Workshops";
import FDP from "../../pages/faculty/categories/FDP";
import Books from "../../pages/faculty/categories/Books";
import NPTEL from "../../pages/faculty/categories/NPTEL";
import Seminars from "../../pages/faculty/categories/Seminars";
import Webinars from "../../pages/faculty/categories/Webinars";
import GuestLectures from "../../pages/faculty/categories/GuestLectures";
import HonorsAwards from "../../pages/faculty/categories/HonorsAwards";
import Certifications from "../../pages/faculty/categories/Certifications";
import Others from "../../pages/faculty/categories/Others";

import Publications from "../../pages/faculty/categories/Publications";
import ResearchPolicy from "../../pages/faculty/categories/ResearchPolicy";
import DoctoralThesis from "../../pages/faculty/categories/DoctoralThesis";
import ResearchProjects from "../../pages/faculty/categories/ResearchProjects";
import ProfessionalMemberships from "../../pages/faculty/categories/ProfessionalMemberships";
import IPRs from "../../pages/faculty/categories/IPRs";
import Incubation from "../../pages/faculty/categories/Incubation";
import Consultancy from "../../pages/faculty/categories/Consultancy";
import MOUs from "../../pages/faculty/categories/MOUs";

export default function HodDashboard({ readOnly = false, hodUser = null }: { readOnly?: boolean, hodUser?: any }) {
  const { data: departments = [] } = useDepartments();
  const [view, setView] = useState("dept-dashboard");

  const department = readOnly && hodUser ? hodUser.department : localStorage.getItem("user_department");

  // ── Data via hooks (no raw fetch) ──────────────────────────
  const { data: me, isLoading: meLoading } = useMe();
  const user = (readOnly && hodUser) ? hodUser : me;

  const { data: uploads = [], isLoading: uploadsLoading } = useHodDepartmentUploads();

  const loading = meLoading || uploadsLoading;


  const currentDepartmentCode = user?.department || department;
  const currentDepartmentRecord = useMemo(
    () => departments.find((item) => item.code === currentDepartmentCode) || null,
    [departments, currentDepartmentCode]
  );
  const showDepartmentWarning = Boolean(user && currentDepartmentCode && !currentDepartmentRecord);

  const departmentApprovedUploads = (uploads || []).filter((u: any) => {
    const status = (u.status || "").toUpperCase();
    return status === "HOD_APPROVED" || status === "ADMIN_APPROVED";
  });

  const hodUploads = (uploads || []).filter((u: any) => {
    if (!user) return false;
    return u.faculty?.employeeId?.toString() === user.employeeId?.toString();
  });

  const hodId = hodUser?._id || user?._id;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-glass-entrance">
      <div className="page-shell p-6 sm:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="stat-pill mb-3">
              <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
              Department governance
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">HOD Dashboard</h2>
            <p className="mt-2 text-sm text-slate-600">
              Managing Department: <span className="font-semibold text-primary">{currentDepartmentRecord?.name || department}</span>
            </p>
          </div>
        </div>
      </div>

      {showDepartmentWarning && (
        <div className="rounded-[22px] border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-700 shadow-[0_12px_30px_rgba(245,158,11,0.12)]">
          <strong className="font-semibold">Department unavailable.</strong> Your department is no longer active. It may have been archived or replaced, so some HOD actions may be limited.
        </div>
      )}

      <Tabs value={view} onValueChange={setView} className="w-full">
        <TabsList className="mb-6 flex-wrap justify-start gap-2 rounded-[999px] border border-slate-200/70 bg-white/70 p-2 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl">
          <TabsTrigger value="dept-dashboard" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Department Report</TabsTrigger>
          {!readOnly && <TabsTrigger value="approve-uploads" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Approve Submissions</TabsTrigger>}
          {!readOnly && <TabsTrigger value="approve-faculty" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Approve Accounts</TabsTrigger>}
          {!readOnly && <TabsTrigger value="faculty-profiles" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Faculty Profiles</TabsTrigger>}
          <TabsTrigger value="dept-analytics" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Analytics</TabsTrigger>
          <TabsTrigger value="my-dashboard" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">My Academic Summary</TabsTrigger>
          <TabsTrigger value="pdc" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">My PDC</TabsTrigger>
          <TabsTrigger value="rnd" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">My R&D</TabsTrigger>
          <TabsTrigger value="credits" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Credit Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="dept-dashboard">
          <DepartmentDashboard uploads={departmentApprovedUploads} department={department} />
        </TabsContent>

        <TabsContent value="my-dashboard">
          <HodPersonalDashboard uploads={hodUploads} hodId={hodId} />
        </TabsContent>

        <TabsContent value="pdc">
          <ProfessionalDevelopment onSelectCategory={setView} />
        </TabsContent>

        <TabsContent value="rnd">
          <RnD onSelectCategory={setView} role="HOD" />
        </TabsContent>

        <TabsContent value="approve-uploads">
          <ApproveUploads />
        </TabsContent>

        <TabsContent value="approve-faculty">
          <ApproveFaculty />
        </TabsContent>

        <TabsContent value="faculty-profiles">
          <FacultyProfiles uploads={departmentApprovedUploads} />
        </TabsContent>

        <TabsContent value="dept-analytics">
          <DepartmentAnalytics uploads={departmentApprovedUploads} />
        </TabsContent>

        <TabsContent value="credits">
          <CreditConfigViewer />
        </TabsContent>

        {/* Dynamic Category Views */}
        {view === "conferences" && <Conferences mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />}
        {view === "workshops" && <Workshops mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />}
        {view === "fdp" && <FDP mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />}
        {view === "books" && <Books mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />}
        {view === "nptel" && <NPTEL mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />}
        {view === "seminars" && <Seminars mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />}
        {view === "webinars" && <Webinars mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />}
        {view === "guest-lectures" && <GuestLectures mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />}
        {view === "honors-awards" && <HonorsAwards mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />}
        {view === "certifications" && <Certifications mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />}
        {view === "others" && <Others mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />}

        {view === "rnd-publications" && <Publications mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />}
        {view === "rnd-policy" && <ResearchPolicy mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />}
        {view === "rnd-doctoral-thesis" && <DoctoralThesis mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />}
        {view === "rnd-projects" && <ResearchProjects mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />}
        {view === "rnd-memberships" && <ProfessionalMemberships mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />}
        {view === "rnd-iprs" && <IPRs mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />}
        {view === "rnd-incubation" && <Incubation mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />}
        {view === "rnd-consultancy" && <Consultancy mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />}
        {view === "rnd-mous" && <MOUs mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />}
      </Tabs>
    </div>
  );
}
