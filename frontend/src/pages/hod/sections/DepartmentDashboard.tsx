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
const [leaderboardData, setLeaderboardData] = useState([]);

useEffect(() => {
  const userDept = localStorage.getItem("user_department");

  apiFetch("/ranking")
    .then(data => {
      if (!Array.isArray(data)) return;

      // ✅ Department total credits
      const deptCredits = {};
      const facultyCredits = {};

      data.forEach(f => {
        const dept = (f.department || "").toUpperCase();
        deptCredits[dept] = (deptCredits[dept] || 0) + (f.totalCredits || 0);

        if (dept === (userDept || "").toUpperCase()) {
           facultyCredits[f.name] = (facultyCredits[f.name] || 0) + (f.totalCredits || 0);
        }
      });

      // ✅ Leaderboard for current department
      const sortedFaculty = Object.entries(facultyCredits)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, credits]) => ({ name, credits }));
      
      setLeaderboardData(sortedFaculty);

      // ✅ Find current department rank
      const sortedDepts = Object.entries(deptCredits)
        .sort((a, b) => b[1] - a[1]);
        
      const totalDepts = sortedDepts.length || 9; // Fallback to 9
      const currentDept = (userDept || "").toUpperCase();
      const deptRankIndex = sortedDepts.findIndex(
        ([dept]) => dept === currentDept
      );

      const rank = deptRankIndex >= 0 ? deptRankIndex + 1 : "-";

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

// Colors for leaderboard ranks
const rankColors = [
  "text-accent-green bg-accent-green/20 border-accent-green/30",
  "text-primary-container bg-primary-container/20 border-primary-container/30",
  "text-tertiary-container bg-tertiary-container/20 border-tertiary-container/30",
  "text-on-surface-variant bg-surface-container-high border-subtle",
  "text-on-surface-variant bg-surface-container-high border-subtle"
];

const rankBarColors = [
  "bg-accent-green",
  "bg-primary-container",
  "bg-tertiary-container",
  "bg-on-surface-variant/50",
  "bg-on-surface-variant/50"
];

return (
  <div className="w-full relative">
    <div className="mb-8">
      <h2 className="font-hero-title text-hero-title text-on-surface">Department Academic Performance</h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Monitor department progress and faculty achievements.</p>
    </div>

    <div className="flex flex-col xl:flex-row gap-8">
      {/* Left Column: Metrics & Grid (70%) */}
      <div className="flex-1 flex flex-col space-y-8">
        
        {/* Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard title="Total Department Credits" value={totalCredits} icon="stars" color="text-accent-green" />
          <SummaryCard
            title="Total Activities"
            value={uploads.length}
            icon="description"
            color="text-primary-container"
            onClick={() => openCategory("all")}
          />
          <SummaryCard
            title="Department Rank"
            value={rankDisplay()}
            subValue={rankSub()}
            icon="leaderboard"
            color="text-tertiary-container"
          />
        </div>

        {/* Category Grid */}
        <div>
           <h3 className="font-headline-md text-headline-md text-on-surface flex items-center mb-4">
            <span className="material-symbols-outlined mr-2 text-primary-container">category</span>
            Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(categoryCredits).map(([key, value]) => (
              <CategoryCard 
                 key={key} 
                 title={key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())} 
                 value={value} 
                 onClick={() => openCategory(key)} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Leaderboard (30%) */}
      <div className="xl:w-[380px] shrink-0">
        <div className="bg-glass-modal rounded-xl border border-subtle flex flex-col h-full overflow-hidden relative shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-subtle bg-surface-container-low/50 relative z-10">
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center">
              <span className="material-symbols-outlined mr-2 text-accent-green">leaderboard</span>
              Department Leaderboard
            </h3>
            <p className="font-body-md text-label-md text-on-surface-variant mt-1">Current Academic Year (Credits)</p>
          </div>
          
          {/* List */}
          <div className="p-2 space-y-1 z-10">
            {leaderboardData.length === 0 ? (
               <div className="p-6 text-center text-on-surface-variant text-sm">No data available</div>
            ) : (
               leaderboardData.map((faculty, index) => {
                 const maxCredits = leaderboardData[0].credits || 1;
                 const percentage = Math.max(5, (faculty.credits / maxCredits) * 100);
                 
                 return (
                  <div key={faculty.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-bright/5 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${rankColors[index] || rankColors[4]}`}>
                        <span className="font-label-md text-label-md font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className={`font-body-md text-body-md font-medium transition-colors ${index < 3 ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                          {faculty.name}
                        </h4>
                        <div className="w-32 h-1.5 bg-surface-container-highest rounded-full mt-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${rankBarColors[index] || rankBarColors[4]}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <span className={`font-headline-sm text-body-lg ${index < 3 ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant'}`}>
                      {faculty.credits}
                    </span>
                  </div>
                 );
               })
            )}
          </div>
          
          <div className="mt-auto p-4 border-t border-subtle z-10">
            <button className="w-full text-primary-container font-label-md text-label-md py-2 hover:bg-primary-container/10 rounded-lg transition-colors flex items-center justify-center">
              View Full Rankings <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </button>
          </div>
          {/* Subtle card background flare */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent-green/5 blur-[40px] pointer-events-none"></div>
        </div>
      </div>
    </div>

    {/* Table Section */}
    {selectedCategory && (
      <div ref={tableRef} className="mt-12 bg-glass-card border border-subtle rounded-xl p-6 relative overflow-hidden">
        {/* Subtle flare behind table */}
        <div className="absolute top-0 right-1/4 w-1/3 h-32 bg-primary-container/5 blur-[80px] pointer-events-none -z-10"></div>
        
        <h3 className="font-headline-md text-headline-md text-on-surface mb-6 capitalize flex items-center">
          <span className="material-symbols-outlined mr-2 text-primary-container">list_alt</span>
          {selectedCategory === 'all' ? 'All Activities' : `${selectedCategory} Activities`}
        </h3>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            placeholder="Search Name..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="bg-surface-container-low border border-subtle rounded-lg px-4 py-2 font-body-md text-on-surface focus:outline-none focus:border-primary-container min-w-[200px]"
          />
          <input
            placeholder="Employee ID..."
            value={searchEmpId}
            onChange={e => setSearchEmpId(e.target.value)}
            className="bg-surface-container-low border border-subtle rounded-lg px-4 py-2 font-body-md text-on-surface focus:outline-none focus:border-primary-container min-w-[150px]"
          />
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="bg-surface-container-low border border-subtle rounded-lg px-4 py-2 font-body-md text-on-surface focus:outline-none focus:border-primary-container"
          >
            <option value="">All Years</option>
            {buildYearOptions(2000).filter((year) => years.includes(Number(year))).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-surface-container-low border border-subtle rounded-lg px-4 py-2 font-body-md text-on-surface focus:outline-none focus:border-primary-container"
          >
            <option value="">All Categories</option>
            {Object.keys(categoryCredits).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            className="btn-ghost font-label-md text-label-md px-4 py-2 rounded-lg text-on-surface flex items-center ml-auto"
            onClick={() => downloadCSV(categoryUploads)}
            disabled={categoryUploads.length === 0}
          >
            <span className="material-symbols-outlined mr-2 text-sm">download</span>
            CSV
          </button>
        </div>

        {categoryUploads.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant font-body-lg bg-surface-container-low/30 rounded-xl border border-subtle">
             No activities found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-subtle text-on-surface-variant font-label-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Emp ID</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {categoryUploads.map(item => (
                  <tr key={item._id} className="hover:bg-surface-bright/5 transition-colors group">
                    <td className="p-4 text-on-surface font-body-md">{item.faculty?.employeeId || item.employeeId || "-"}</td>
                    <td className="p-4 text-on-surface font-body-md">{item.faculty?.name || item.name || "-"}</td>
                    <td className="p-4 text-on-surface-variant font-body-md uppercase text-xs">{item.category}</td>
                    <td className="p-4 text-on-surface font-body-md line-clamp-1 max-w-xs">{getTitle(item)}</td>
                    <td className="p-4 text-primary-container font-headline-md font-bold">{item.credits}</td>
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

function SummaryCard({ title, value, subValue, icon, color, onClick }) {
  return (
    <div
      className={`bg-glass-card rounded-xl p-6 border border-subtle hover:border-${color.split('-')[1]}/30 transition-all duration-300 relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start z-10 relative">
         <div>
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">{title}</h3>
            <div className="flex items-end gap-3">
               <span className="font-hero-title-mobile text-hero-title-mobile text-on-surface font-bold leading-none">{value}</span>
               {subValue && (
                 <span className="font-label-md text-label-md text-on-surface-variant mb-1">{subValue}</span>
               )}
            </div>
         </div>
         <div className={`w-10 h-10 rounded-lg bg-surface-container-high border border-subtle flex items-center justify-center shrink-0 ${color}`}>
            <span className="material-symbols-outlined">{icon}</span>
         </div>
      </div>
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${color.replace('text-', 'bg-')}/5 blur-[30px] group-hover:blur-[40px] transition-all pointer-events-none rounded-full`}></div>
    </div>
  );
}

function CategoryCard({ title, value, onClick }) {
  return (
    <div
      className="bg-glass-card rounded-xl p-4 border border-subtle hover:border-primary-container/40 hover:bg-surface-bright/10 cursor-pointer transition-all duration-300 group flex flex-col justify-between h-full"
      onClick={onClick}
    >
      <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4 group-hover:text-primary-container transition-colors line-clamp-1" title={title}>{title}</h3>
      <div className="flex items-end justify-between mt-auto">
         <span className="font-label-sm text-on-surface-variant/70 uppercase">Credits</span>
         <span className="font-headline-lg text-headline-lg font-bold text-on-surface">{value}</span>
      </div>
    </div>
  );
}

export default DepartmentDashboard;
