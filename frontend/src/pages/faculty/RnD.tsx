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
  paddingTop: 4,
};

const headerSection = {
  marginBottom: 24,
};

const title = {
  fontSize: 28,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 6,
};

const subtitle = {
  fontSize: 15,
  color: "#64748b",
};

const grid = {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
};

const card = {
  width: 260,
  minHeight: 124,
  background: "#fff",
  borderRadius: 24,
  border: "1px solid #E2E8F0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
};

const hoverCard = {
  transform: "translateY(-4px)",
  border: "1px solid #bfdbfe",
  boxShadow: "0 14px 28px rgba(37,99,235,0.12)",
};

const cardText = {
  fontSize: 15,
  fontWeight: 600,
  color: "#0f172a",
  textAlign: "center",
  padding: "0 16px",
};