import { useState } from "react";
import { useEffect } from "react";
import { Building2, Users, ClipboardCheck, BarChart3, Settings, CreditCard, UserCheck } from "lucide-react";

import AdminHome from "./sections/AdminHome";
import DepartmentManagement from "./sections/DepartmentManagement";
import FacultyList from "./sections/FacultyList";
import HodList from "./sections/HodList";
import ManualUsers from "./sections/ManualUsers";
import ApproveHodUploads from "./sections/ApproveHodUploads";
import DepartmentAnalytics from "./sections/DepartmentAnalytics";
import CreditConfig from "./sections/credit-config/CreditConfig";

const NAV_ITEMS = [
  { key: "home",        label: "Dashboard",    icon: BarChart3 },
  { key: "departments", label: "Departments",  icon: Building2 },
  { key: "users",       label: "Add Users",    icon: Users },
  { key: "faculty",     label: "Profiles",     icon: UserCheck },
  { key: "hod",         label: "HOD Accounts", icon: UserCheck },
  { key: "approve",     label: "HOD Uploads",  icon: ClipboardCheck },
  { key: "analytics",   label: "Analytics",    icon: BarChart3 },
  { key: "credit",      label: "Credit Config",icon: CreditCard },
];

function AdminDashboard() {
  const [view, setView] = useState("home");

  return (
    <div className="w-full">
      {/* Tab Nav */}
      <div className="flex gap-2 flex-wrap mb-8 bg-surface-container-low/30 p-2 rounded-xl border border-subtle">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === key
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-on-surface hover:bg-surface-bright/20"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="w-full">
        {view === "home"        && <AdminHome setView={setView} />}
        {view === "departments" && <DepartmentManagement />}
        {view === "users"       && <ManualUsers />}
        {view === "faculty"     && <FacultyList />}
        {view === "hod"         && <HodList />}
        {view === "approve"     && <ApproveHodUploads />}
        {view === "analytics"   && <DepartmentAnalytics />}
        {view === "credit"      && <CreditConfig />}
      </div>
    </div>
  );
}

export default AdminDashboard;
