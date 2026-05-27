import { useState, useMemo, useEffect } from "react";
import { apiFetch } from "../../../api";
import { buildYearOptions } from "../../../constants/years";
import { CATEGORY_FILTER_OPTIONS } from "../../../constants/categories";
import LoadingState from "../../../components/LoadingState";
import { showToast } from "../../../utils/toast";

import Conferences from "../../faculty/categories/Conferences";
import Workshops from "../../faculty/categories/Workshops";
import FDP from "../../faculty/categories/FDP";
import Books from "../../faculty/categories/Books";
import NPTEL from "../../faculty/categories/NPTEL";
import Seminars from "../../faculty/categories/Seminars";
import Webinars from "../../faculty/categories/Webinars";
import GuestLectures from "../../faculty/categories/GuestLectures";
import HonorsAwards from "../../faculty/categories/HonorsAwards";
import Certifications from "../../faculty/categories/Certifications";
import Others from "../../faculty/categories/Others";
import Publications from "../../faculty/categories/Publications";
import ResearchPolicy from "../../faculty/categories/ResearchPolicy";
import DoctoralThesis from "../../faculty/categories/DoctoralThesis";
import ResearchProjects from "../../faculty/categories/ResearchProjects";
import ProfessionalMemberships from "../../faculty/categories/ProfessionalMemberships";
import IPRs from "../../faculty/categories/IPRs";
import Incubation from "../../faculty/categories/Incubation";
import Consultancy from "../../faculty/categories/Consultancy";
import MOUs from "../../faculty/categories/MOUs";

const categoryComponents = {
  conferences: Conferences, workshops: Workshops, fdp: FDP,
  books: Books, nptel: NPTEL, seminars: Seminars, webinars: Webinars,
  "guest-lectures": GuestLectures, "honors-awards": HonorsAwards,
  certifications: Certifications, others: Others,
  "rnd-publications": Publications, "rnd-policy": ResearchPolicy,
  "rnd-doctoral-thesis": DoctoralThesis, "rnd-projects": ResearchProjects,
  "rnd-memberships": ProfessionalMemberships, "rnd-iprs": IPRs,
  "rnd-incubation": Incubation, "rnd-consultancy": Consultancy, "rnd-mous": MOUs
};

function HodPersonalDashboard({ uploads = null, hodId = null }) {

  const [view, setView] = useState("dashboard");
  const [localUploads, setLocalUploads] = useState([]);
  const [categoryMode, setCategoryMode] = useState("upload");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(!uploads);

  useEffect(() => {
    if (uploads && uploads.length > 0) {
      setLocalUploads(uploads);
      setLoading(false);
      return;
    }
    const loadUploads = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(hodId ? `/hod/faculty-uploads/${hodId}` : "/uploads/department");
        setLocalUploads(Array.isArray(data) ? data : []);
      } catch (error) {
        setLocalUploads([]);
        showToast({ type: "error", message: error.message || "Failed to load uploads" });
      } finally {
        setLoading(false);
      }
    };

    loadUploads();
  }, [uploads, hodId]);

  useEffect(() => {
    const fetchRank = async () => {
      try {
        const targetId = hodId || localStorage.getItem("userId");
        const myData = await apiFetch(`/ranking/${targetId}`);
        if (myData) {
          setRankData({
            departmentRank: myData.departmentRank,
            departmentTotal: myData.departmentTotal,
            collegeRank: myData.collegeRank,
            collegeTotal: myData.collegeTotal,
            score: myData.score
          });
        }
      } catch (err) {
        showToast({ type: "error", message: err.message || "Failed to load rank" });
      }
    };
    fetchRank();
  }, [hodId]);

  const approvedUploads = useMemo(() =>
    localUploads.filter(u =>
      u.status === "HOD_APPROVED" || u.status === "ADMIN_APPROVED"
    ), [localUploads]);

  const pendingUploads = useMemo(() =>
    localUploads.filter(u =>
      u.status === "FACULTY_SUBMITTED" || u.status === "HOD_SUBMITTED"
    ), [localUploads]);

  const discussionUploads = useMemo(() =>
    localUploads.filter(u =>
      u.status === "HOD_COMMENT" || u.status === "ADMIN_COMMENT"
    ), [localUploads]);

  // ✅ Fixed — only once defined
  const filteredApprovedUploads = useMemo(() => {
    return approvedUploads.filter(u => {
      const categoryMatch = selectedCategory === "All" ||
        (u.category || "").toLowerCase() === selectedCategory.toLowerCase();

      const uYear = u.year
        ? u.year.toString()
        : new Date(u.createdAt).getFullYear().toString();

      const yearMatch = selectedYear === "All" ||
        uYear === selectedYear.toString();

      return categoryMatch && yearMatch;
    });
  }, [approvedUploads, selectedCategory, selectedYear]);

  const availableCategories = CATEGORY_FILTER_OPTIONS;

  const availableYears = useMemo(() => buildYearOptions(2000), []);

  const totalCredits = filteredApprovedUploads.reduce((sum, u) => sum + (u.credits || 0), 0);
  const approvedCount = approvedUploads.length;
  const pendingCount = pendingUploads.length;
  const discussionCount = discussionUploads.length;

  const byCategory = (category) =>
    filteredApprovedUploads
      .filter(u => (u.category || "").toLowerCase() === category.toLowerCase())
      .reduce((sum, u) => sum + (u.credits || 0), 0);

  const categoryCredits = {
    publication: byCategory("publication"),
    conference: byCategory("conference"),
    workshop: byCategory("workshop"),
    fdp: byCategory("fdp"),
    book: byCategory("book"),
    nptel: byCategory("nptel"),
    seminar: byCategory("seminar"),
    webinar: byCategory("webinar"),
    guestlecture: byCategory("guestlecture"),
    honorsawards: byCategory("honorsawards"),
    certification: byCategory("certification"),
    others: byCategory("others"),
    researchpolicy: byCategory("researchpolicy"),
    membership: byCategory("professionalmembership"),
    ipr: byCategory("ipr"),
    consultancy: byCategory("consultancy"),
    incubation: byCategory("incubation"),
    doctoralThesis: byCategory("doctoralthesis"),
    researchProjects: byCategory("researchproject"),
    mou: byCategory("mou")
  };

  const openCategory = (key) => {
    setCategoryMode("approved");
    setView(key);
  };

  const handleDownload = async () => {
    try {
      let url = "/api/reports/faculty-excel";
      const params = new URLSearchParams();
      const loggedInUserId = localStorage.getItem("userId");
      if (hodId && hodId !== loggedInUserId) {
        params.append("facultyId", hodId);
      }
      if (selectedCategory && selectedCategory !== "All") {
        params.append("category", selectedCategory);
      }
      if (selectedYear && selectedYear !== "All") {
        params.append("year", selectedYear);
      }
      if ([...params].length > 0) {
        url += `?${params.toString()}`;
      }
      const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (!res.ok) {
        showToast({ type: "error", message: "Download failed" });
        return;
      }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "hod_activities.xlsx";
      link.click();
    } catch (err) {
      showToast({ type: "error", message: err.message || "Download failed" });
    }
  };

  if (loading) {
    return <LoadingState message="Loading personal dashboard..." />;
  }

  const ActiveCategory = categoryComponents[view];

  return (
    <div style={wrapper}>

      {view === "dashboard" && (
        <>
          <div style={dashboardHeader}>
            <h2>Personal Academic Summary</h2>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={downloadBtn} onClick={handleDownload}>
                Download All
              </button>
              <select
                style={downloadSelect}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">Category</option>
                <option value="All">ALL</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <select
                style={downloadSelect}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="All">Year</option>
                <option value="All">ALL</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
            <SummaryCard title="Total Credits" value={totalCredits} />
            <SummaryCard
              title="Dept Rank"
              value={rankData ? `${rankData.departmentRank} / ${rankData.departmentTotal}` : "—"}
            />
            <SummaryCard
              title="College Rank"
              value={rankData ? `${rankData.collegeRank} / ${rankData.collegeTotal}` : "—"}
            />
          </div>

          <div style={cardGrid}>
            <CategoryCard title="Publications" value={categoryCredits.publication} onClick={() => openCategory("rnd-publications")} />
            <CategoryCard title="Conferences" value={categoryCredits.conference} onClick={() => openCategory("conferences")} />
            <CategoryCard title="Workshops" value={categoryCredits.workshop} onClick={() => openCategory("workshops")} />
            <CategoryCard title="FDP" value={categoryCredits.fdp} onClick={() => openCategory("fdp")} />
            <CategoryCard title="Books" value={categoryCredits.book} onClick={() => openCategory("books")} />
            <CategoryCard title="NPTEL" value={categoryCredits.nptel} onClick={() => openCategory("nptel")} />
            <CategoryCard title="Seminars" value={categoryCredits.seminar} onClick={() => openCategory("seminars")} />
            <CategoryCard title="Webinars" value={categoryCredits.webinar} onClick={() => openCategory("webinars")} />
            <CategoryCard title="Guest Lectures" value={categoryCredits.guestlecture} onClick={() => openCategory("guest-lectures")} />
            <CategoryCard title="Awards" value={categoryCredits.honorsawards} onClick={() => openCategory("honors-awards")} />
            <CategoryCard title="Certifications" value={categoryCredits.certification} onClick={() => openCategory("certifications")} />
            <CategoryCard title="Research Policy" value={categoryCredits.researchpolicy} onClick={() => openCategory("rnd-policy")} />
            <CategoryCard title="Memberships" value={categoryCredits.membership} onClick={() => openCategory("rnd-memberships")} />
            <CategoryCard title="IPR" value={categoryCredits.ipr} onClick={() => openCategory("rnd-iprs")} />
            <CategoryCard title="Consultancy" value={categoryCredits.consultancy} onClick={() => openCategory("rnd-consultancy")} />
            <CategoryCard title="Incubation" value={categoryCredits.incubation} onClick={() => openCategory("rnd-incubation")} />
            <CategoryCard title="Projects" value={categoryCredits.researchProjects} onClick={() => openCategory("rnd-projects")} />
            <CategoryCard title="Doctoral Thesis" value={categoryCredits.doctoralThesis} onClick={() => openCategory("rnd-doctoral-thesis")} />
            <CategoryCard title="MOUs" value={categoryCredits.mou} onClick={() => openCategory("rnd-mous")} />
            <CategoryCard title="Others" value={categoryCredits.others || 0} onClick={() => openCategory("others")} />
          </div>
        </>
      )}

      {ActiveCategory && (
        <ActiveCategory
          mode={categoryMode}
          facultyId={hodId}
          onBack={() => setView("dashboard")}
        />
      )}

    </div>
  );
}

export default HodPersonalDashboard;

function SummaryCard({ title, value }) {
  return (
    <div style={summaryCard}>
      <h2>{value}</h2>
      <p>{title}</p>
    </div>
  );
}

function CategoryCard({ title, value, onClick }) {
  return (
    <div
      style={categoryCard}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <h3>{title}</h3>
      <p>Credits Earned</p>
      <h2>{value}</h2>
    </div>
  );
}

const wrapper = { width: "100%" };
const cardGrid = { display: "flex", gap: 20, flexWrap: "wrap" };
const summaryCard = { width: 200, height: 100, background: "white", borderRadius: 12, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" };
const categoryCard = { width: 220, height: 120, background: "white", borderRadius: 12, padding: 20, marginTop: 20, cursor: "pointer", transition: "0.25s", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" };
const dashboardHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 };
const downloadBtn = { padding: "8px 14px", background: "#2563eb", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500 };
const downloadSelect = { padding: "8px 14px", borderRadius: 6, border: "1px solid #cbd5e1", cursor: "pointer", fontSize: 13, fontWeight: 500, backgroundColor: "white", minWidth: "120px" };
