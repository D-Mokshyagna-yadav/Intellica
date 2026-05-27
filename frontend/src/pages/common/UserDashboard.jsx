import { useMemo } from "react";
import { useResponsive } from "../../hooks/useResponsive";
import "../../styles/responsiveDashboard.css";
import { mockUploads } from "../../data/mockUploads";

function UserDashboard({ userId, role }) {
  const responsive = useResponsive();
  // Only approved uploads of THIS user
  const myUploads = useMemo(
    () =>
      mockUploads.filter(
        (u) => u.userId === userId && u.status === "approved"
      ),
    [userId]
  );

  const totalCredits = myUploads.reduce(
    (sum, u) => sum + u.credits,
    0
  );

  const byCategory = (category) =>
    myUploads
      .filter((u) => u.category === category)
      .reduce((sum, u) => sum + u.credits, 0);

  return (
    <>
      <h2>Dashboard</h2>
      <p style={{ color: "gray" }}>
        {role} credits and ranking overview
      </p>

      {/* SUMMARY */}
      <div style={{ display: "flex", gap: 20, marginTop: 25 }}>
        <SummaryCard title="Total Credits" value={totalCredits} />
        <SummaryCard title="Your Rank" value="—" />
      </div>

      {/* CATEGORY CARDS */}
      <div style={grid}>
        <CategoryCard title="Publications" value={byCategory("Publications")} />
        <CategoryCard title="Conferences" value={byCategory("Conferences")} />
        <CategoryCard title="FDPs" value={byCategory("FDPs")} />
        <CategoryCard title="Workshops" value={byCategory("Workshops")} />
      </div>
    </>
  );
}

export default UserDashboard;

/* ---------- UI Components ---------- */

function SummaryCard({ title, value }) {
  return (
    <div style={summaryCard}>
      <h2>{value}</h2>
      <p style={{ color: "gray" }}>{title}</p>
    </div>
  );
}

function CategoryCard({ title, value }) {
  return (
    <div style={categoryCard}>
      <h3>{title}</h3>
      <p style={{ color: "gray" }}>Total Credits</p>
      <h2>{value}</h2>
    </div>
  );
}

/* ---------- Styles ---------- */

const summaryCard = {
  width: 240,
  height: 120,
  backgroundColor: "white",
  borderRadius: 14,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const categoryCard = {
  width: 260,
  height: 130,
  backgroundColor: "white",
  borderRadius: 14,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  padding: 20,
};

const grid = {
  display: "flex",
  gap: 20,
  flexWrap: "wrap",
  marginTop: 30,
};
