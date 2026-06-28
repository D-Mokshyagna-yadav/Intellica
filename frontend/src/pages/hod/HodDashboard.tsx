/* ================= PDC CATEGORIES ================= */

import { useState, useEffect, useMemo, useRef } from "react";
import { useResponsive } from "../../hooks/useResponsive";
import "../../styles/responsiveDashboard.css";

import Conferences from "../faculty/categories/Conferences";
import Workshops from "../faculty/categories/Workshops";
import FDP from "../faculty/categories/FDP";
import Books from "../faculty/categories/Books";
import NPTEL from "../faculty/categories/NPTEL";
import Seminars from "../faculty/categories/Seminars";
import Webinars from "../faculty/categories/Webinars";
import GuestLectures from "../faculty/categories/GuestLectures";
import HonorsAwards from "../faculty/categories/HonorsAwards";
import Certifications from "../faculty/categories/Certifications";
import Others from "../faculty/categories/Others";

/* ================= RND CATEGORIES ================= */

import Publications from "../faculty/categories/Publications";
import ResearchPolicy from "../faculty/categories/ResearchPolicy";
import DoctoralThesis from "../faculty/categories/DoctoralThesis";
import ResearchProjects from "../faculty/categories/ResearchProjects";
import ProfessionalMemberships from "../faculty/categories/ProfessionalMemberships";
import IPRs from "../faculty/categories/IPRs";
import Incubation from "../faculty/categories/Incubation";
import Consultancy from "../faculty/categories/Consultancy";
import MOUs from "../faculty/categories/MOUs";

import HodHeader from "./HodHeader";
import API_BASE, { getFileUrl } from "../../api";
import { showToast } from "../../utils/toast";
import { useDepartments } from "../../hooks/useDepartments";

/* ================= PROFILE INFO ================= */

import ProfileInfo from "../common/ProfileInfo";

/* ================= MODULES ================= */

import ProfessionalDevelopment from "../faculty/ProfessionalDevelopment";
import RnD from "../faculty/RnD";

/* ================= HOD SECTIONS ================= */

import ApproveUploads from "./sections/ApproveUploads";
import ApproveFaculty from "./sections/ApproveFaculty";
import FacultyProfiles from "./sections/FacultyProfiles";
import DepartmentDashboard from "./sections/DepartmentDashboard";
import HodPersonalDashboard from "./sections/HodPersonalDashboard";
import DepartmentAnalytics from "./sections/DepartmentAnalytics";
import CreditConfigViewer from "../admin/sections/credit-config/common/CreditConfigViewer";

function HodDashboard({ setPage = () => {}, readOnly = false, hodUser = null }){

  const responsive = useResponsive();
  const { departments } = useDepartments();
  const [view, setView] = useState("dept-dashboard");
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState("");
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const fileInputRef = useRef(null);
  const topMenuItems = [
  { key: "dept-dashboard", label: "Department Academic Report" }
];

const bottomMenuItems = [
  { key: "my-dashboard", label: "Personal Academic Summary" },
  { key: "pdc", label: "Faculty Professional Activities" },
  { key: "rnd", label: "Research & Development" },
  { key: "credits", label: "Credit Rules" }
];

const extraMenuItems = readOnly
  ? [
      { key: "dept-analytics", label: "Department Analytics" }
    ]
  : [
      { key: "approve-uploads", label: "Approve Faculty Submissions" },
      { key: "approve-faculty", label: "Approve Faculty Accounts" },
      { key: "faculty-profiles", label: "Faculty Profiles" },
      { key: "dept-analytics", label: "Department Analytics" }
    ];

  const department = readOnly && hodUser
  ? hodUser.department
  : localStorage.getItem("user_department");
  const token = localStorage.getItem("token");
  const currentDepartmentCode = user?.department || department;
  const currentDepartmentRecord = useMemo(
    () => departments.find((item) => item.code === currentDepartmentCode) || null,
    [departments, currentDepartmentCode]
  );
  const showDepartmentWarning = Boolean(user && currentDepartmentCode && !currentDepartmentRecord);

 const handleLogout = () => {
  localStorage.clear();
  window.location.href = "/";
};

  /* ================= PROFILE ================= */

  useEffect(() => {

  const fetchProfile = async () => {

    try {

      if (readOnly && hodUser) {
        setUser(hodUser);
        return;
      }

      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setUser(data);

    } catch (err) {
      showToast({ type: "error", message: err.message || "Failed to load profile" });
    }

  };

  fetchProfile();

}, [token, readOnly, hodUser]);
useEffect(() => {
  if (view === "faculty-profiles") {
    setIsSidebarOpen(false); // collapse
  } else {
    setIsSidebarOpen(true);  // expand
  }
}, [view]);

  /* ================= CHANGE IMAGE ================= */

  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {

      const res = await fetch(`${API_BASE}/auth/update-profile-image`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setProfileImage(data.profileImage);
      }

    } catch (err) {
      showToast({ type: "error", message: err.message || "Failed to update profile image" });
    }

  };


  /* ================= FETCH UPLOADS ================= */

  useEffect(() => {

  const fetchUploads = async () => {

    try {

      const res = await fetch(
        `${API_BASE}/hod/department-uploads?department=${department}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json();

      if (res.ok) setUploads(data);

    } catch (err) {
      showToast({ type: "error", message: err.message || "Failed to load department uploads" });
    }

    setLoading(false);

  };

  fetchUploads();

}, [token, department]);


  /* ================= APPROVED FILTER ================= */

const departmentApprovedUploads = (uploads || []).filter((u) => {
  const status = (u.status || "").toUpperCase();

  return (
    status === "HOD_APPROVED" ||
    status === "ADMIN_APPROVED"
  );
});

const hodUploads = (uploads || []).filter((u) => {
  if (!user) return false;

  return u.faculty?.employeeId?.toString() === user.employeeId?.toString();
});
const hodId = hodUser?._id || user?._id;

  if (loading) return <div className="flex justify-center items-center h-full text-on-surface-variant font-body-lg">Loading Dashboard...</div>;


  return (
    <div className="w-full">
      <div className="flex gap-3 flex-wrap mb-8 bg-surface-container-low/30 p-2 rounded-xl border border-subtle inline-flex">
        {[...topMenuItems, ...extraMenuItems, ...bottomMenuItems].map(item => (
          <button 
            key={item.key} 
            onClick={() => setView(item.key)} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === item.key 
                ? "bg-primary-container text-on-primary-container shadow-sm" 
                : "text-on-surface hover:bg-surface-bright/20"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      
      <div className="w-full relative">
          {showDepartmentWarning && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error-container font-body-md shadow-sm">
              <strong className="font-semibold block mb-1">Department unavailable.</strong>
              <span>
                Your department is no longer active. It may have been archived or replaced, so some HOD actions may be limited.
                Please contact the admin team to confirm your department setup.
              </span>
            </div>
          )}

          {view === "dept-dashboard" &&
            <DepartmentDashboard
              uploads={departmentApprovedUploads}
              department={department}
            />
          }

         {view === "my-dashboard" &&
        <HodPersonalDashboard
          uploads={hodUploads}
          hodId={hodUser?._id || user?._id}
        />
      }
          {view === "pdc" &&
            <div className="bg-glass-card rounded-xl p-6 border border-subtle">
               <ProfessionalDevelopment onSelectCategory={setView} />
            </div>
          }

          {view === "rnd" &&
            <div className="bg-glass-card rounded-xl p-6 border border-subtle">
               <RnD onSelectCategory={setView} role="HOD" />
            </div>
          }

          {view === "approve-uploads" &&
            <ApproveUploads />
          }

          {view === "approve-faculty" &&
            <ApproveFaculty />
          }

          {view === "faculty-profiles" &&
            <FacultyProfiles uploads={departmentApprovedUploads} />
          }

          {view === "dept-analytics" &&
            <DepartmentAnalytics uploads={departmentApprovedUploads} />
          }
          {view === "credits" && <CreditConfigViewer />}

{/* ================= PDC CATEGORY VIEWS ================= */}

{view === "conferences" &&
  <Conferences mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />
}

{view === "workshops" &&
  <Workshops mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />
}

{view === "fdp" &&
  <FDP mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />
}

{view === "books" &&
  <Books mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />
}

{view === "nptel" &&
  <NPTEL mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />
}

{view === "seminars" &&
  <Seminars mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />
}

{view === "webinars" &&
  <Webinars mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />
}

{view === "guest-lectures" &&
  <GuestLectures mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />
}

{view === "honors-awards" &&
  <HonorsAwards mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />
}

{view === "certifications" &&
  <Certifications mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />
}
{view === "others" &&
  <Others mode="approved" facultyId={hodId} onBack={() => setView("pdc")} />
}

{/* ================= RND CATEGORY VIEWS ================= */}

{view === "rnd-publications" &&
  <Publications mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />
}

{view === "rnd-policy" &&
  <ResearchPolicy mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />
}

{view === "rnd-doctoral-thesis" &&
  <DoctoralThesis mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />
}

{view === "rnd-projects" &&
  <ResearchProjects mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />
}

{view === "rnd-memberships" &&
  <ProfessionalMemberships mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />
}

{view === "rnd-iprs" &&
  <IPRs mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />
}

{view === "rnd-incubation" &&
  <Incubation mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />
}

{view === "rnd-consultancy" &&
  <Consultancy mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />
}

{view === "rnd-mous" &&
  <MOUs mode="approved" facultyId={hodId} onBack={() => setView("rnd")} />
}
      </div>
    </div>
  );
}

export default HodDashboard;
