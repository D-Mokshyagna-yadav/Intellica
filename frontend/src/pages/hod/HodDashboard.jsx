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
import API_BASE from "../../api";

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
      console.error(err);
    }

  };

  fetchProfile();

}, [token, readOnly, hodUser]);
useEffect(() => {
  console.log("HOD USER:", user);
  console.log("PROFILE IMAGE:", user?.profileImage);
}, [user]);

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
      console.error(err);
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
      console.error(err);
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

  if (loading) return <div className="hod-loading">Loading...</div>;


  return (

    <div className="hod-wrapper">

      {/* FIXED HERE */}
      <div style={{ display: "flex", alignItems: "center" }}>
 <button
  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
  style={{
    marginLeft: 20,
    marginRight: 10,
    fontSize: 20,
    cursor: "pointer",

    background: "transparent",   // 🔥 important
    border: "none",
    outline: "none",             // 🔥 removes focus box
    boxShadow: "none",           // 🔥 removes shadow
    padding: 0                  // 🔥 removes button spacing
  }}
>
  ☰
</button>

  <HodHeader user={user} />
</div>

      <div className="hod-layout">

        {/* ================= SIDEBAR ================= */}

      {isSidebarOpen && (
  <div className="hod-sidebar">

    {/* TOP SECTION */}

    <div>

      <div style={profileSection} className="hod-profile-section">

       <img
  key={profileImage || user?.profileImage || "default"}
  src={
    profileImage
      ? `/uploads/${profileImage}`
      : user?.profileImage
      ? `/uploads/${user.profileImage}`
      : "https://via.placeholder.com/240x200"
  }
  alt="Profile"
  style={profileImageStyle}
  onClick={handleImageClick}
/>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageChange}
        />

        <div style={changeText} onClick={handleImageClick}>
          Click to change image
        </div>

        <ProfileInfo user={user} readOnly={readOnly} />

      </div>

      <div style={sidebarTitle}>Intellica</div>

    {/* ===== TOP MENU ===== */}
{topMenuItems.map(item => (
  <div
    key={item.key}
    onClick={() => setView(item.key)}
    style={{
      ...menuItem,

      // ✅ UNIQUE COLOR ALWAYS
      background: "#e0f2fe",
      color: "#0369a1",
      fontWeight: 700,

      // ✅ EXTRA highlight when active
      ...(view === item.key
        ? {
            background: "#0ea5e9",
            color: "white"
          }
        : {})
    }}
  >
    {isSidebarOpen && item.label}
  </div>
))}
{/* ===== EXTRA MENU ===== */}
{extraMenuItems.map(item => (
  <div
    key={item.key}
    onClick={() => setView(item.key)}
    style={{
      ...menuItem,
      ...(view === item.key ? activeItem : {})
    }}
  >
    {isSidebarOpen && item.label}
  </div>
))}

<hr style={{ margin: "15px 0" }} />

{/* ===== BOTTOM MENU ===== */}
{bottomMenuItems.map(item => (
  <div
    key={item.key}
    onClick={() => setView(item.key)}
    style={{
      ...menuItem,
      ...(view === item.key ? activeItem : {})
    }}
  >
    {isSidebarOpen && item.label}
  </div>
))}

   </div>

    {/* BOTTOM SECTION */}
    <div>
      {!readOnly && (
  <button style={logoutBtn} onClick={handleLogout}>
    Logout
  </button>
)}
    </div>

  </div>
)}


        {/* ================= CONTENT ================= */}

        <div className="hod-content">

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
            <ProfessionalDevelopment onSelectCategory={setView} />
          }

          {view === "rnd" &&
            <RnD onSelectCategory={setView} role="HOD" />
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

    </div>

  );

}

export default HodDashboard;


/* ================= STYLES ================= */

const wrapper = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#c7d2fe 0%,#e9d5ff 100%)"
};

const layout = {
  display: "flex"
};

const sidebar = {
  width: 240,
  padding: "30px 20px",
  borderRight: "1px solid rgba(0,0,0,0.08)"
};

const profileSection = {
  marginBottom: 25,
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const profileImageStyle = {
  width: "100%",
  height: 200,
  borderRadius: 18,
  objectFit: "cover",
  cursor: "pointer",
  border: "3px solid #4f46e5"
};

const changeText = {
  fontSize: 13,
  marginTop: 10,
  cursor: "pointer"
};

const logoutBtn = {
  marginTop: 12,
  padding: "8px 18px",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  width: "70%"
};

const sidebarTitle = {
  fontSize: 18,
  fontWeight: 700,
  marginBottom: 20
};

const content = {
  flex: 1,
  padding: "60px 40px",
  overflowX: "auto"
};

const menuItem = {
  marginBottom: 10,
  padding: "10px 12px",
  cursor: "pointer",
  borderRadius: 6,
  transition: "all 0.2s ease"
};

const activeItem = {
  background: "#e0e7ff",
  borderLeft: "4px solid #4f46e5",
  fontWeight: 700,
  color: "#1e293b",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
};
