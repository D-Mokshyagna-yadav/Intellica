import { useState } from "react";

function ProfessionalDevelopment({ onSelectCategory }) {
  const [hovered, setHovered] = useState(null);

  const categories = [
    { label: "Conferences", key: "conferences" },
    { label: "Workshops", key: "workshops" },
    { label: "Guest Lectures", key: "guest-lectures" },
    { label: "Books", key: "books" },
    { label: "NPTEL Certifications", key: "nptel" },
    { label: "Seminars", key: "seminars" },
    { label: "Webinars", key: "webinars" },
    { label: "Honors & Awards", key: "honors-awards" },
    { label: "Certifications", key: "certifications" },
    { label: "Others", key: "others" },
  ];

  return (
    <div style={wrapper}>
      <div style={headerSection}>
        <h2 style={title}>Professional Development</h2>
        <p style={subtitle}>
          Manage and review faculty academic contributions
        </p>
      </div>

      <div style={grid}>
        {categories.map((cat) => (
          <div
            key={cat.key}
            onClick={() => onSelectCategory(cat.key)}
            onMouseEnter={() => setHovered(cat.key)}
            onMouseLeave={() => setHovered(null)}
            style={{
              ...card,
              ...(hovered === cat.key ? hoverCard : {}),
            }}
          >
            <div style={cardText}>{cat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProfessionalDevelopment;

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
  color: "#1E1B4B",
  marginBottom: 6,
};

const subtitle = {
  fontSize: 14,
  color: "#334155",
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
  borderRadius: 14,
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
  boxShadow: "0 10px 25px rgba(99,102,241,0.25)",
};

const cardText = {
  fontSize: 15,
  fontWeight: 600,
  color: "#1E293B",
  textAlign: "center",
  padding: "0 10px",
};