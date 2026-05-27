import { useMemo, useState, useRef, useEffect } from "react";
import { useResponsive } from "../../../hooks/useResponsive";
import "../../../styles/responsiveDashboard.css";
import { apiFetch } from "../../../api";
import { buildYearOptions } from "../../../constants/years";
import { showToast } from "../../../utils/toast";

function DepartmentDashboard({ uploads }) {

const responsive = useResponsive();
const [selectedCategory, setSelectedCategory] = useState(null);
const [deptRank, setDeptRank] = useState(null);

useEffect(() => {
  const userDept = localStorage.getItem("user_department");

  apiFetch("/ranking")
    .then(data => {
      if (!Array.isArray(data)) return;

      // ✅ All unique departments from ranking data
      const allDepts = [...new Set(
        data.map(f => (f.department || "").toUpperCase()).filter(Boolean)
      )];
      const totalDepts = 9; // Total departments in the college

      // ✅ Department total credits
      const deptCredits = {};
      data.forEach(f => {
        const dept = (f.department || "").toUpperCase();
        deptCredits[dept] = (deptCredits[dept] || 0) + (f.totalCredits || 0);
      });

      // ✅ Sort departments by credits
      const sortedDepts = Object.entries(deptCredits)
        .sort((a, b) => b[1] - a[1]);

      // ✅ Find current department rank
      const currentDept = (userDept || "").toUpperCase();
      const deptRankIndex = sortedDepts.findIndex(
        ([dept]) => dept === currentDept
      );

      const rank = deptRankIndex + 1;

      // ✅ Tier label
      const tierLabel = rank === 1 ? "Top"
        : rank <= Math.ceil(totalDepts / 3) ? "High"
        : rank <= Math.ceil(totalDepts * 2 / 3) ? "Mid"
        : "Low";

      setDeptRank({ rank, totalDepts, tierLabel });
    })
    .catch(err => showToast({ type: "error", message: err.message || "Failed to load department rank" }));
}, []);

const [searchName, setSearchName] = useState("");
const [searchEmpId, setSearchEmpId] = useState("");
const [yearFilter, setYearFilter] = useState("");
const [categoryFilter, setCategoryFilter] = useState("");

const tableRef = useRef(null);

const totalCredits = useMemo(() => {
  return uploads.reduce((sum, u) => sum + (u.credits || 0), 0);
}, [uploads]);

const byCategory = (category) => {
  return uploads
    .filter(u => (u.category || "").toLowerCase() === category.toLowerCase())
    .reduce((sum, u) => sum + (u.credits || 0), 0);
};

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
  researchprojects: byCategory("researchproject"),
  doctoralthesis: byCategory("doctoralthesis"),
  mous: byCategory("mou")
};

const years = useMemo(() => {
  const ys = uploads
    .map(u => new Date(u.createdAt).getFullYear())
    .filter(Boolean);
  return [...new Set(ys)];
}, [uploads]);

const openCategory = (category) => {
  setSelectedCategory(category);
  setTimeout(() => {
    tableRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 100);
};

const categoryUploads = uploads.filter(u => {
  if (!selectedCategory) return false;
  if (selectedCategory !== "all" && (u.category || "").toLowerCase() !== selectedCategory)
    return false;
  if (searchEmpId &&
    !(u.faculty?.employeeId || u.employeeId || "")
      .toLowerCase()
      .includes(searchEmpId.toLowerCase()))
    return false;
  if (searchName &&
    !(u.faculty?.name || u.name || "")
      .toLowerCase()
      .includes(searchName.toLowerCase()))
    return false;
  if (yearFilter) {
    const year = new Date(u.createdAt).getFullYear();
    if (year.toString() !== yearFilter) return false;
  }
  if (categoryFilter &&
    (u.category || "").toLowerCase() !== categoryFilter.toLowerCase())
    return false;
  return true;
});

const getTitle = (item) => {
  return (
    item.metadata?.courseName ||
    item.metadata?.policyName ||
    item.metadata?.awardName ||
    item.metadata?.paperTitle ||
    item.metadata?.conferenceTitle ||
    item.metadata?.conferenceName ||
    item.metadata?.title ||
    item.metadata?.bookTitle ||
    item.metadata?.startupName ||
    item.title ||
    "-"
  );
};

const downloadCSV = (data) => {
  if (!data.length) return;
  const rows = data.map(item => ({
    employeeId: item.faculty?.employeeId || item.employeeId || "",
    name: item.faculty?.name || item.name || "",
    category: item.category,
    title: getTitle(item),
    credits: item.credits,
    year: new Date(item.createdAt).getFullYear()
  }));
  const header = Object.keys(rows[0]).join(",");
  const csv = [
    header,
    ...rows.map(r => Object.values(r).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "department_activities.csv";
  a.click();
};

// ✅ Rank display
const rankDisplay = () => {
  if (!deptRank) return "—";
  if (!deptRank.rank) return "—";
  return `${deptRank.rank}`;
};

const rankSub = () => {
  if (!deptRank?.totalDepts) return "";
  const tier = deptRank.tierLabel || "";
  const total = deptRank.totalDepts;
  return `${tier} • out of ${total}`;
};

return (
  <div className="dashboard-container">

    <h2 className="dashboard-title">Department Academic Performance</h2>

    <div className="summary-row">
      <SummaryCard title="Total Department Credits" value={totalCredits} />
      <SummaryCard
        title="Total Activities"
        value={uploads.length}
        onClick={() => openCategory("all")}
      />
      <SummaryCard
        title="Department Rank"
        value={rankDisplay()}
        subValue={rankSub()}
      />
    </div>

    <div className="category-grid">
      <CategoryCard title="Publications" value={categoryCredits.publication} onClick={() => openCategory("publication")} />
      <CategoryCard title="Conferences" value={categoryCredits.conference} onClick={() => openCategory("conference")} />
      <CategoryCard title="Workshops" value={categoryCredits.workshop} onClick={() => openCategory("workshop")} />
      <CategoryCard title="FDP" value={categoryCredits.fdp} onClick={() => openCategory("fdp")} />
      <CategoryCard title="Books" value={categoryCredits.book} onClick={() => openCategory("book")} />
      <CategoryCard title="NPTEL" value={categoryCredits.nptel} onClick={() => openCategory("nptel")} />
      <CategoryCard title="Seminars" value={categoryCredits.seminar} onClick={() => openCategory("seminar")} />
      <CategoryCard title="Webinars" value={categoryCredits.webinar} onClick={() => openCategory("webinar")} />
      <CategoryCard title="Guest Lectures" value={categoryCredits.guestlecture} onClick={() => openCategory("guestlecture")} />
      <CategoryCard title="Awards" value={categoryCredits.honorsawards} onClick={() => openCategory("honorsawards")} />
      <CategoryCard title="Certifications" value={categoryCredits.certification} onClick={() => openCategory("certification")} />
      <CategoryCard title="Research Policy" value={categoryCredits.researchpolicy} onClick={() => openCategory("researchpolicy")} />
      <CategoryCard title="Memberships" value={categoryCredits.membership} onClick={() => openCategory("membership")} />
      <CategoryCard title="IPR" value={categoryCredits.ipr} onClick={() => openCategory("ipr")} />
      <CategoryCard title="Consultancy" value={categoryCredits.consultancy} onClick={() => openCategory("consultancy")} />
      <CategoryCard title="Incubation" value={categoryCredits.incubation} onClick={() => openCategory("incubation")} />
      <CategoryCard title="Projects" value={categoryCredits.researchprojects} onClick={() => openCategory("researchprojects")} />
      <CategoryCard title="Doctoral Thesis" value={categoryCredits.doctoralthesis} onClick={() => openCategory("doctoralthesis")} />
      <CategoryCard title="MOUs" value={categoryCredits.mous} onClick={() => openCategory("mous")} />
      <CategoryCard title="Others" value={categoryCredits.others} onClick={() => openCategory("others")} />
    </div>

    {selectedCategory && (
      <div ref={tableRef} className="table-section">
        <h3>{selectedCategory.toUpperCase()} Activities</h3>
        <div className="filter-bar">
          <input
            placeholder="Search Name"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="filter-input"
          />
          <input
            placeholder="Employee ID"
            value={searchEmpId}
            onChange={e => setSearchEmpId(e.target.value)}
            className="filter-input"
          />
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Years</option>
            {buildYearOptions(2000).filter((year) => years.includes(Number(year))).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {Object.keys(categoryCredits).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            className="download-btn"
            onClick={() => downloadCSV(categoryUploads)}
            disabled={categoryUploads.length === 0}
          >
            Download CSV
          </button>
        </div>

        {categoryUploads.length === 0 ? (
          <div className="no-data-message">No activities found</div>
        ) : responsive.isMobile ? (
          <div className="table-card-list">
            {categoryUploads.map(item => (
              <div key={item._id} className="table-card">
                <div className="table-card-row">
                  <span className="table-card-label">Emp ID</span>
                  <span className="table-card-value">{item.faculty?.employeeId || item.employeeId || "-"}</span>
                </div>
                <div className="table-card-row">
                  <span className="table-card-label">Name</span>
                  <span className="table-card-value">{item.faculty?.name || item.name || "-"}</span>
                </div>
                <div className="table-card-row">
                  <span className="table-card-label">Category</span>
                  <span className="table-card-value">{item.category}</span>
                </div>
                <div className="table-card-row">
                  <span className="table-card-label">Title</span>
                  <span className="table-card-value">{getTitle(item)}</span>
                </div>
                <div className="table-card-row">
                  <span className="table-card-label">Credits</span>
                  <span className="table-card-value" style={{ color: "#2563eb", fontWeight: "bold" }}>{item.credits}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {categoryUploads.map(item => (
                  <tr key={item._id}>
                    <td>{item.faculty?.employeeId || item.employeeId || "-"}</td>
                    <td>{item.faculty?.name || item.name || "-"}</td>
                    <td>{item.category}</td>
                    <td>{getTitle(item)}</td>
                    <td>{item.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}

  </div>
);

}

function SummaryCard({ title, value, subValue, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="summary-card"
      style={{ ...(hover ? { background: "#f0f9ff" } : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <h2>{value}</h2>
      {subValue && (
        <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0" }}>{subValue}</p>
      )}
      <p>{title}</p>
    </div>
  );
}

function CategoryCard({ title, value, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="category-card"
      style={{ ...(hover ? { background: "#f0f9ff" } : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <h3>{title}</h3>
      <p>Credits Earned</p>
      <h2>{value}</h2>
    </div>
  );
}

export default DepartmentDashboard;
