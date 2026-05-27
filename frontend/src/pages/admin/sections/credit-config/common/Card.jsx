function Card({ title, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      style={card}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
    >
      <div style={titleStyle}>{title}</div>

      {subtitle && (
        <div style={subtitleStyle}>{subtitle}</div>
      )}
    </div>
  );
}

export default Card;

/* ================= STYLES ================= */

const card = {
  padding: 20,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  cursor: "pointer",
  backgroundColor: "#f9fafb",
  transition: "all 0.2s ease",
};

const titleStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: "#111827",
};

const subtitleStyle = {
  marginTop: 6,
  fontSize: 13,
  color: "#6b7280",
};
