import { useState } from "react";

function RnD({ onSelectCategory, role }) {
  const [hovered, setHovered] = useState(null);

  const categories = [
    { label: "Paper Publications", key: "rnd-publications" },
    { label: "Research Policy & RND Committee", key: "rnd-policy" },
    { label: "Faculty Development Programs", key: "fdp" },
    { label: "Doctoral Thesis Guided/Guiding", key: "rnd-doctoral-thesis" },
    { label: "Research Projects", key: "rnd-projects" },
    { label: "Professional Memberships", key: "rnd-memberships" },
    { label: "IPRs", key: "rnd-iprs" },
    { label: "Incubation Centre", key: "rnd-incubation" },
    { label: "Consultancy", key: "rnd-consultancy" },

    // ✅ ONLY FOR HOD
    ...(role === "HOD"
      ? [{ key: "rnd-mous", label: "MOUs (Memorandum of Understanding)" }]
      : [])
  ];

  return (
    <div style={wrapper}>
      <div style={headerSection}>
        <h2 style={title}>Research & Development</h2>
        <p style={subtitle}>
          Manage and monitor institutional research activities
        </p>
      </div>

      <div style={grid}>
        {categories.map((c) => (
          <div
            key={c.key}
            onClick={() => onSelectCategory(c.key)}
            onMouseEnter={() => setHovered(c.key)}
            onMouseLeave={() => setHovered(null)}
            style={{
              ...card,
              ...(hovered === c.key ? hoverCard : {}),
            }}
          >
            <div style={cardText}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RnD;

/* ================= STYLES ================= */

const wrapper = {
  paddingTop: 10,
};

const headerSection = {
  marginBottom: 35,
};

const title = {
  fontSize: 24,
  fontWeight: 700,
  color: "#1E293B",
  marginBottom: 6,
};

const subtitle = {
  fontSize: 14,
  color: "#475569",
};

const grid = {
  display: "flex",
  flexWrap: "wrap",
  gap: 24,
};

const card = {
  width: 260,
  height: 120,
  background: "white",
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.25s ease",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

const hoverCard = {
  transform: "translateY(-6px)",
  border: "1px solid #6366F1",
  boxShadow: "0 10px 24px rgba(99,102,241,0.25)",
};

const cardText = {
  fontSize: 15,
  fontWeight: 600,
  color: "#1E293B",
  textAlign: "center",
  padding: "0 14px",
};