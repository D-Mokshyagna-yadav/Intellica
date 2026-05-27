import { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { apiFetch } from "../../../api";
import { buildYearOptions } from "../../../constants/years";
import { DEPARTMENTS } from "../../../constants/departments";
import LoadingState from "../../../components/LoadingState";
import { showToast } from "../../../utils/toast";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const COLORS = [
  "#bdeb257d", "#16a34a75", "#f974167e", "#a955f780",
  "#ef4444bc", "#0ea5e9", "#f59e0b", "#10b981a8"
];

const ALL_YEARS = buildYearOptions(2000);
const ALL_DEPARTMENTS = DEPARTMENTS.filter((department) => department !== "CHEM");

export default function DepartmentAnalytics() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  useEffect(() => {
    apiFetch("/uploads/department")
      .then(data => {
        setUploads(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        showToast({ type: "error", message: err.message || "Failed to load analytics" });
        setLoading(false);
      });
  }, []);

  const years = useMemo(() => {
    return Array.from(new Set(
      uploads.map(u =>
        u.year?.toString() ||
        (u.createdAt ? new Date(u.createdAt).getFullYear().toString() : null)
      ).filter(Boolean)
    )).sort();
  }, [uploads]);

  const allCategories = useMemo(() => {
    return Array.from(new Set(
      uploads.map(u => u.category).filter(Boolean)
    )).sort();
  }, [uploads]);

  // ✅ Filter by category + year only (NOT department)
  // Department filter only for bar/doughnut display
  const baseFilteredUploads = useMemo(() => {
    return uploads.filter(u => {
      const year = u.year?.toString() ||
        (u.createdAt ? new Date(u.createdAt).getFullYear().toString() : null);
      const yearMatch = selectedYear === "All" || year === selectedYear;
      const catMatch = selectedCategory === "All" ||
        (u.category || "").toLowerCase() === selectedCategory.toLowerCase();
      return yearMatch && catMatch;
    });
  }, [uploads, selectedCategory, selectedYear]);

  // ✅ Credits per ALL departments (for rank + share calculation)
  const allDeptTotals = useMemo(() => {
    const totals = {};
    ALL_DEPARTMENTS.forEach(dept => { totals[dept] = 0; });
    baseFilteredUploads.forEach(u => {
      const dept = (u.department || "").toUpperCase();
      if (totals[dept] !== undefined) {
        totals[dept] += (u.credits || 0);
      }
    });
    return totals;
  }, [baseFilteredUploads]);

  // ✅ Sort ALL departments by credits — for rank calculation
  const sortedAllDepts = useMemo(() => {
    return ALL_DEPARTMENTS
      .map((dept, i) => ({
        dept,
        total: Math.round((allDeptTotals[dept] || 0) * 100) / 100,
        color: COLORS[i % COLORS.length]
      }))
      .sort((a, b) => b.total - a.total);
  }, [allDeptTotals]);

  // ✅ Grand total from ALL departments
  const grandTotal = Math.round(
    sortedAllDepts.reduce((a, b) => a + b.total, 0) * 100
  ) / 100;

  // ✅ Display data — filtered by selected department for bar/doughnut
  const displayDepts = useMemo(() => {
    if (selectedDepartment === "All") return sortedAllDepts;
    return sortedAllDepts.filter(d =>
      d.dept.toUpperCase() === selectedDepartment.toUpperCase()
    );
  }, [sortedAllDepts, selectedDepartment]);

  // ✅ Categories within selected department
  const deptCategories = useMemo(() => {
    if (selectedDepartment === "All") return [];
    const filtered = baseFilteredUploads.filter(u =>
      (u.department || "").toUpperCase() === selectedDepartment.toUpperCase()
    );
    const catTotals = {};
    filtered.forEach(u => {
      const cat = u.category || "Other";
      catTotals[cat] = (catTotals[cat] || 0) + (u.credits || 0);
    });
    return Object.entries(catTotals)
      .map(([cat, total]) => ({ category: cat, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total);
  }, [baseFilteredUploads, selectedDepartment]);

  // ✅ Bar chart data
  const barData = selectedDepartment === "All" ? {
    labels: displayDepts.map(d => d.dept),
    datasets: [{
      label: "Total Credits",
      data: displayDepts.map(d => d.total),
      backgroundColor: displayDepts.map(d => d.color),
      borderRadius: 6,
      barPercentage: 0.6,
    }]
  } : {
    labels: deptCategories.map(c => c.category),
    datasets: [{
      label: "Credits by Activity",
      data: deptCategories.map(c => c.total),
      backgroundColor: COLORS.slice(0, deptCategories.length),
      borderRadius: 6,
      barPercentage: 0.6,
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.raw} credits`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 13 } } },
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: { font: { size: 12 } },
        title: { display: true, text: "Total Credits", font: { size: 13 } }
      }
    }
  };

  // ✅ Doughnut data
  const doughnutData = {
    labels: displayDepts.map(d => d.dept),
    datasets: [{
      data: displayDepts.map(d => d.total > 0 ? d.total : 0),
      backgroundColor: displayDepts.map(d => d.color),
      borderWidth: 1,
    }]
  };

  const doughnutOptions = {
    responsive: true,
    cutout: "70%",
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.raw || 0;
            // ✅ Share % always from grand total (all depts)
            const pct = grandTotal ? ((val / grandTotal) * 100).toFixed(1) : 0;
            return `${ctx.label}: ${val} credits (${pct}%)`;
          }
        }
      }
    }
  };

  const downloadExcel = () => {
    const rows = sortedAllDepts.map((d, i) => ({
      Rank: i + 1,
      Department: d.dept,
      "Total Credits": d.total.toFixed(2),
      "Share %": grandTotal > 0
        ? ((d.total / grandTotal) * 100).toFixed(1) + "%"
        : "0%",
      Year: selectedYear,
      Category: selectedCategory
    }));
    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map((row) => Object.values(row).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Department_Analytics_${selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState message="Loading analytics..." />;

  return (
    <div style={{ padding: "0 10px" }}>

      {/* HEADER */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, color: "#0f172a" }}>
            Department Contribution Analytics
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 15, color: "#64748b" }}>
            Departments ranked by total credits
          </p>
        </div>
        <button style={styles.downloadBtn} onClick={downloadExcel}>
          Download Report
        </button>
      </div>

      {/* FILTERS */}
      <div style={styles.filters}>
        <div>
          <label style={styles.label}>Category</label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={styles.select}
          >
            <option value="All">All</option>
            {allCategories.map(cat => <option key={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label style={styles.label}>Year</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            style={styles.select}
          >
            <option value="All">All</option>
            {ALL_YEARS.map(y => (
              <option
                key={y}
                value={y}
                style={{
                  fontWeight: years.includes(y) ? "700" : "400",
                  color: years.includes(y) ? "#2563eb" : "#94a3b8",
                }}
              >
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={styles.label}>Department</label>
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            style={styles.select}
          >
            <option value="All">All</option>
            {ALL_DEPARTMENTS.map(dept => <option key={dept}>{dept}</option>)}
          </select>
        </div>

        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 14, color: "#475569" }}>
            {selectedDepartment === "All" ? "Total Credits" : `${selectedDepartment} Credits`}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#2563eb" }}>
            {selectedDepartment === "All"
              ? grandTotal.toFixed(2)
              : (allDeptTotals[selectedDepartment] || 0).toFixed(2)
            }
          </div>
        </div>
      </div>

      {grandTotal === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
          <p style={{ fontSize: 17 }}>No uploads found for selected filters</p>
        </div>
      ) : (
        <>
          {/* BAR CHART */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              {selectedDepartment === "All"
                ? "All Departments — Ranked by Credits"
                : `${selectedDepartment} — Activities Breakdown`}
            </h3>
            <div style={{ height: 380 }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* DOUGHNUT + TABLE */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 24 }}>

            <div style={{ ...styles.card, flex: "1 1 300px", maxWidth: 380 }}>
              <h3 style={styles.cardTitle}>Overall Department Share</h3>
              <div style={{ width: 280, height: 280, margin: "0 auto" }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>

            <div style={{ ...styles.card, flex: "2 1 400px" }}>
              <h3 style={styles.cardTitle}>Department-wise Summary</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={styles.th}>Rank</th>
                    <th style={styles.th}>Department</th>
                    <th style={styles.th}>Total Credits</th>
                    <th style={styles.th}>Share %</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ✅ Table: show only selected dept but rank & share from ALL */}
                  {sortedAllDepts
                    .filter(row =>
                      selectedDepartment === "All" ||
                      row.dept.toUpperCase() === selectedDepartment.toUpperCase()
                    )
                    .map((row) => {
                      // ✅ Actual rank from ALL departments
                      const actualRank = sortedAllDepts.findIndex(
                        d => d.dept === row.dept
                      ) + 1;

                      // ✅ Actual share from ALL departments grand total
                      const actualShare = grandTotal > 0
                        ? ((row.total / grandTotal) * 100).toFixed(1)
                        : 0;

                      return (
                        <tr
                          key={row.dept}
                          style={{
                            background: selectedDepartment !== "All"
                              ? "#eff6ff"
                              : "transparent"
                          }}
                        >
                          <td style={styles.td}>
                            <span style={{
                              fontWeight: 700,
                              color: actualRank === 1 ? "#f59e0b"
                                : actualRank === 2 ? "#94a3b8"
                                : actualRank === 3 ? "#b45309"
                                : "#64748b"
                            }}>
                              #{actualRank}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              display: "inline-block",
                              width: 10, height: 10,
                              borderRadius: "50%",
                              background: row.color,
                              marginRight: 8
                            }} />
                            {row.dept}
                          </td>
                          <td style={{ ...styles.td, fontWeight: 700, color: "#2563eb" }}>
                            {row.total.toFixed(2)}
                          </td>
                          <td style={styles.td}>
                            {actualShare}%
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  downloadBtn: { padding: "10px 16px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15 },
  filters: { display: "flex", gap: 20, marginBottom: 24, background: "white", padding: "16px 20px", borderRadius: 12, flexWrap: "wrap", alignItems: "flex-end", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  label: { fontSize: 14, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 },
  select: { padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 15 },
  card: { background: "white", padding: 24, borderRadius: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 20, marginTop: 0 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 15 },
  th: { padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569", borderBottom: "2px solid #e2e8f0" },
  td: { padding: "10px 14px", borderBottom: "1px solid #f1f5f9", color: "#334155" }
};
