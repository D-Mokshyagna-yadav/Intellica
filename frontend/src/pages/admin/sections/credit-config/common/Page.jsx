function Page({ title, onBack, children }) {
  return (
    <div style={{ padding: 20 }}>
      {/* BACK BUTTON */}
      <button onClick={onBack} style={backBtn}>
        ← Back
      </button>

      {/* PAGE TITLE */}
      <h3 style={{ marginBottom: 20 }}>{title}</h3>

      {/* PAGE CONTENT */}
      {children}
    </div>
  );
}

export default Page;

/* ================= STYLES ================= */

const backBtn = {
  background: "none",
  border: "none",
  color: "#2563eb",
  cursor: "pointer",
  fontSize: 14,
  marginBottom: 10,
};
