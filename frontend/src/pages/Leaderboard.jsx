import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import { DEPARTMENTS } from "../constants/departments";
import LoadingState from "../components/LoadingState";
import { showToast } from "../utils/toast";

export default function Leaderboard({ setPage }) {
  const [entries, setEntries] = useState([]);
  const [department, setDepartment] = useState(new URLSearchParams(window.location.search).get("department") || "All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const query = department !== "All" ? `?department=${encodeURIComponent(department)}` : "";
        const data = await apiFetch(`/ranking${query}`, { headers: {} });
        if (isMounted) {
          setEntries(Array.isArray(data) ? data : []);
          const search = department !== "All" ? `?department=${encodeURIComponent(department)}` : "";
          window.history.replaceState({}, "", `/leaderboard${search}`);
        }
      } catch (error) {
        if (isMounted) {
          showToast({ type: "error", message: error.message || "Failed to load leaderboard" });
          setEntries([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [department]);

  const rows = useMemo(() => entries.slice().sort((a, b) => a.collegeRank - b.collegeRank), [entries]);

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, color: "#0f172a" }}>Leaderboard</h1>
          <p style={{ color: "#475569", marginTop: 8 }}>Shareable rankings across faculty and HOD contributors.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <select value={department} onChange={(event) => setDepartment(event.target.value)} style={selectStyle}>
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setPage("login")} style={buttonStyle}>
            Back
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading leaderboard..." />
      ) : (
        <div style={tableCardStyle}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>College Rank</th>
                <th style={thStyle}>Department Rank</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Credits</th>
                <th style={thStyle}>Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.facultyId}>
                  <td style={tdStyle}>#{row.collegeRank}</td>
                  <td style={tdStyle}>#{row.rank}</td>
                  <td style={tdStyle}>{row.name}</td>
                  <td style={tdStyle}>{row.createdByRole}</td>
                  <td style={tdStyle}>{row.department}</td>
                  <td style={tdStyle}>{row.totalCredits}</td>
                  <td style={tdStyle}>{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: 32,
  background: "linear-gradient(180deg, #f8fafc 0%, #dbeafe 100%)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
  marginBottom: 24,
  flexWrap: "wrap",
};

const tableCardStyle = {
  background: "#fff",
  borderRadius: 20,
  overflow: "hidden",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
};

const buttonStyle = {
  border: "none",
  borderRadius: 999,
  background: "#1d4ed8",
  color: "#fff",
  padding: "10px 18px",
  cursor: "pointer",
};

const selectStyle = {
  borderRadius: 999,
  border: "1px solid #bfdbfe",
  padding: "10px 16px",
};

const thStyle = {
  textAlign: "left",
  padding: "16px 20px",
  background: "#eff6ff",
  color: "#1e3a8a",
};

const tdStyle = {
  padding: "14px 20px",
  borderTop: "1px solid #e2e8f0",
  color: "#0f172a",
};
