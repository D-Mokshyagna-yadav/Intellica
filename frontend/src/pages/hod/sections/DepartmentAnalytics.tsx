import { useState, useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { buildYearOptions } from "../../../constants/years";

ChartJS.register(ArcElement, Tooltip, Legend);

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
          backgroundColor: ["#6366f1", "rgba(255,255,255,0.08)"],
          borderWidth: 1,
        }],
      };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: { size: 12 },
          boxWidth: 12,
          color: "rgba(255,255,255,0.7)",
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw || 0;
            const percent = totalCredits
              ? ((value as number / totalCredits) * 100).toFixed(1)
              : 0;
            return `${ctx.label}: ${value} credits (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-on-surface mb-2">
          Department Analytics
        </h1>
        <p className="text-on-surface-variant font-body-md">
          Academic contribution overview by year and category
        </p>
      </div>

      {/* Filters Row */}
      <div className="bg-glass-card rounded-2xl p-6 border border-subtle mb-6 flex flex-wrap gap-6 items-end">
        {/* Academic Year Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Academic Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-surface-container-low border border-subtle text-on-surface rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all min-w-[160px]"
          >
            <option value="All">All Years</option>
            {ALL_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}{uploadYears.includes(y) ? " ★" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface-container-low border border-subtle text-on-surface rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-all min-w-[200px]"
          >
            <option value="All">All Categories</option>
            {DISPLAY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Total Credits */}
        <div className="ml-auto text-right bg-primary-container/20 px-6 py-3 rounded-xl border border-primary/20">
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Total Credits</div>
          <div className="text-3xl font-display font-bold text-primary">{totalCredits}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-glass-card rounded-2xl p-8 border border-subtle max-w-2xl">
        <h3 className="text-lg font-bold text-on-surface mb-6">
          {selectedCategory === "All"
            ? `Category-wise Contribution (${selectedYear})`
            : `${selectedCategory} Contribution (${selectedYear})`}
        </h3>

        {totalCredits === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <p className="text-lg font-medium mb-2">No approved uploads found</p>
            <p className="text-sm opacity-70">
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
