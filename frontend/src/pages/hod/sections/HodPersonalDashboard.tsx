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
        const myData = await apiFetch(`/ranking/me`);
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
    <div className="page-shell p-6 sm:p-8">
      {view === "dashboard" && (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-on-surface">Personal Academic Summary</h2>
              <p className="mt-2 text-sm text-on-surface-variant max-w-2xl">
                Review your approved credits, ranking, and activity details as HOD.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary-custom rounded-2xl px-4 py-2 text-sm font-semibold"
                onClick={handleDownload}
              >
                Download All
              </button>
              <select
                className="rounded-2xl border border-subtle bg-surface p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 min-w-[140px]"
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
                className="rounded-2xl border border-subtle bg-surface p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 min-w-[140px]"
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

          <div className="grid gap-4 mt-6 sm:grid-cols-2 xl:grid-cols-3">
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

          <div className="grid gap-4 mt-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
    <div className="bg-glass-card rounded-2xl p-6 border border-subtle flex flex-col items-center justify-center text-center shadow-sm">
      <p className="text-3xl font-semibold text-on-surface">{value}</p>
      <p className="mt-3 text-sm text-on-surface-variant">{title}</p>
    </div>
  );
}

function CategoryCard({ title, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-glass-card rounded-2xl p-5 border border-subtle flex flex-col justify-between min-h-[130px] text-left transition duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1"
    >
      <div>
        <p className="text-sm font-medium text-on-surface-variant">{title}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-on-surface-variant">Credits earned</p>
      </div>
      <p className="text-3xl font-semibold text-on-surface">{value || 0}</p>
    </button>
  );
}

