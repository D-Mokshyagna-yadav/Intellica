function StatCard({ title, count }) {
  return (
    <div
      style={{
        minWidth: 0,
        borderRadius: 24,
        border: "1px solid #e2e8f0",
        background: "white",
        padding: 20,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b" }}>{title}</p>
      <div style={{ marginTop: 10, fontSize: 32, fontWeight: 700, lineHeight: 1, color: "#0f172a" }}>{count}</div>
    </div>
  );
}

export default StatCard;
