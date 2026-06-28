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