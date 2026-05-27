import { useState, useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { buildYearOptions } from "../../../constants/years";

ChartJS.register(ArcElement, Tooltip, Legend);

// ✅ 1900 నుండి 3000 వరకు అన్ని years
const ALL_YEARS = buildYearOptions(2000);

function DepartmentAnalytics({ uploads = [] }) {

  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const DISPLAY_CATEGORIES = [
    "Conference", "Publication", "Workshops", "FDP",
    "Book", "NPTEL", "Seminar", "Webinar",
    "GuestLecture", "HonorsAwards", "Certification",
    "ResearchPolicy", "ProfessionalMembership", "IPR",
    "Consultancy", "Incubation", "ResearchProject",
    "DoctoralThesis", "MOU", "Others"
  ];

  // ✅ Actual uploads నుండి వచ్చే years — highlight కోసం
  const uploadYears = useMemo(() => {
    return Array.from(new Set(
      uploads.map((u) => {
        if (u.year) return u.year.toString();
        if (u.createdAt) return new Date(u.createdAt).getFullYear().toString();
        return null;
      }).filter(Boolean)
    )).sort();
  }, [uploads]);

  const filteredUploads = useMemo(() => {
    if (selectedYear === "All") return uploads;
    return uploads.filter((u) => {
      const year = u.year?.toString() ||
        (u.createdAt ? new Date(u.createdAt).getFullYear().toString() : null);
      return year === selectedYear;
    });
  }, [uploads, selectedYear]);

  const totalCredits = useMemo(() =>
    filteredUploads.reduce((sum, u) => sum + (u.credits || 0), 0),
  [filteredUploads]);

  const categoryTotals = useMemo(() => {
    const totals = {};
    DISPLAY_CATEGORIES.forEach((cat) => {
      totals[cat] = filteredUploads
        .filter((u) => (u.category || "").toLowerCase() === cat.toLowerCase())
        .reduce((sum, u) => sum + (u.credits || 0), 0);
    });
    return totals;
  }, [filteredUploads]);

  const activeCategories = DISPLAY_CATEGORIES.filter(
    cat => categoryTotals[cat] > 0
  );

  const colors = [
    "#4e46e57c","#04fa219d","#7815e2f5","#2b7290df","#185fdac4",
    "#db71afcb","#25eb7e86","#3e0b6eab","#ec489ab9","#0a99a3a3",
    "#43b48e","#ef44447d","#b88f14cd","#9d613679","#c9cc168a",
    "#2c737f","#346c6dd0","#d81dd2bf","#e11d8f70","#e11d8f00"
  ];

  const chartData = selectedCategory === "All"
    ? {
        labels: activeCategories.length > 0 ? activeCategories : ["No Data"],
        datasets: [{
          data: activeCategories.length > 0
            ? activeCategories.map(cat => categoryTotals[cat])
            : [1],
          backgroundColor: colors,
          borderWidth: 1,
        }],
      }
    : {
        labels: [selectedCategory, "Others"],
        datasets: [{
          data: [
            categoryTotals[selectedCategory] || 0,
            totalCredits - (categoryTotals[selectedCategory] || 0),
          ],
          backgroundColor: ["#4f46e5", "#e5e7eb"],
          borderWidth: 1,
        }],
      };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: { size: 12 }, boxWidth: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw || 0;
            const percent = totalCredits
              ? ((value / totalCredits) * 100).toFixed(1)
              : 0;
            return `${ctx.label}: ${value} credits (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "100%" }}>

      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f1728" }}>
          Department Analytics
        </h1>
        <p style={{ fontSize: 14, color: "#475569", marginTop: 6 }}>
          Academic contribution overview by year and category
        </p>
      </div>

      <div style={{
        background: "white", padding: 25, borderRadius: 14,
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        display: "flex", gap: 30, flexWrap: "wrap",
        alignItems: "flex-end", marginBottom: 40
      }}>

        {/* ✅ Academic Year Dropdown — 1900 to 3000 */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#334155" }}>
            Academic Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
          >
            <option value="All">All</option>
            {ALL_YEARS.map((y) => (
              <option
                key={y}
                value={y}
                style={{
                  fontWeight: uploadYears.includes(y) ? "700" : "400",
                  color: uploadYears.includes(y) ? "#2563eb" : "#94a3b8",
                }}
              >
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Category Dropdown */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#334155" }}>
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
          >
            <option value="All">All</option>
            {DISPLAY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "#475569" }}>Total Credits</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#4f46e5" }}>
            {totalCredits}
          </div>
        </div>
      </div>

      <div style={{
        background: "white", padding: 30, borderRadius: 14,
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)", maxWidth: 750
      }}>
        <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600, color: "#1e293b" }}>
          {selectedCategory === "All"
            ? `Category-wise Contribution (${selectedYear})`
            : `${selectedCategory} Contribution (${selectedYear})`}
        </h3>

        {totalCredits === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
            <p style={{ fontSize: 16 }}>No approved uploads found</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>
              Uploads need HOD or Admin approval to appear here
            </p>
          </div>
        ) : (
          <div style={{ width: 420, height: 420, margin: "0 auto" }}>
            <Doughnut data={chartData} options={options} />
          </div>
        )}
      </div>

    </div>
  );
}

export default DepartmentAnalytics;
