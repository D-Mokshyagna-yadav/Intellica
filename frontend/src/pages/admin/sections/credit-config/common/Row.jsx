function Row({ label, value, onChange }) {
  return (
    <div style={row}>
      <div style={labelStyle}>{label}</div>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={input}
        min={0}
      />
    </div>
  );
}

export default Row;

/* ================= STYLES ================= */

const row = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 10,
};

const labelStyle = {
  flex: 1,
  fontSize: 14,
  color: "#111827",
};

const input = {
  width: 80,
  padding: "4px 6px",
  borderRadius: 4,
  border: "1px solid #d1d5db",
};
