import { useEffect, useState } from "react";
import { apiFetch } from "../../../../../api";
import { showToast } from "../../../../../utils/toast";
import LoadingState from "../../../../../components/LoadingState";

function CreditConfigViewer() {

  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch("/credit-config/all")
      .then(setData)
      .catch((error) => showToast({ type: "error", message: error.message || "Failed to load credit rules" }));
  }, []);

  if (!data) return <LoadingState message="Loading credit rules..." />;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={headerRow}>
        <div>
          <p style={eyebrow}>Credit Rules</p>
          <h3 style={{ margin: "6px 0 0", fontSize: 28, lineHeight: 1.1, color: "#0f172a" }}>Credit Configuration</h3>
        </div>
        <input
          type="text"
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchStyle}
        />
      </div>

      {Object.entries(data).map(([type, categories]) => (
        <div key={type} style={{ marginTop: 20 }}>
          <h4 style={sectionTitle}>{type.toUpperCase()}</h4>

          {Object.entries(categories)
  .filter(([cat]) =>
    toTitle(cat).toLowerCase().includes(search.toLowerCase())
  )
  .map(([cat, rules]) => (
            <div
              key={cat}
              style={ruleCard}
            >
              <b style={ruleTitle}>{toTitle(cat)}</b>

              <div style={{ marginTop: 10 }}>
                {renderRules(rules)}
              </div>

            </div>
          ))}

        </div>
      ))}

    </div>
  );
}

export default CreditConfigViewer;

/* ================= RENDER RULES ================= */

function renderRules(obj, indent = 0) {

  if (!obj) return <p>No data</p>;

  return Object.entries(obj).map(([key, value]) => {

    // Nested object
    if (typeof value === "object" && value !== null) {
      return (
        <div key={key} style={{ marginLeft: indent * 15, marginTop: 6 }}>
          <div style={{ fontWeight: 600 }}>
            {toTitle(key)}
          </div>
          {renderRules(value, indent + 1)}
        </div>
      );
    }

    // Final value
    return (
      <div
  key={key}
  style={{
    marginLeft: indent * 15,
    display: "grid",
    gridTemplateColumns: "1fr 80px",
    alignItems: "center",
    gap: 10,
    marginTop: 4
  }}
>
  <span style={{ color: "#374151" }}>
    {toTitle(key)}
  </span>

  <span
    style={{
      textAlign: "right",
      fontWeight: 600,
      color: "#111827"
    }}
  >
    {value}
  </span>
</div>
    );
  });
}

/* ================= HELPER ================= */

function toTitle(str = "") {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/-/g, " ")
    .replace(/^./, s => s.toUpperCase());
}

const headerRow: React.CSSProperties = { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 };
const eyebrow: React.CSSProperties = { margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#64748b" };
const searchStyle: React.CSSProperties = { marginTop: 0, padding: "10px 14px", width: 320, maxWidth: "100%", borderRadius: 999, border: "1px solid #cbd5e1", background: "#fff", boxShadow: "0 8px 24px rgba(15,23,42,0.04)" };
const sectionTitle: React.CSSProperties = { margin: "0 0 12px", fontSize: 16, letterSpacing: "0.08em", color: "#334155" };
const ruleCard: React.CSSProperties = { padding: 18, background: "white", marginTop: 12, borderRadius: 20, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(15,23,42,0.04)" };
const ruleTitle: React.CSSProperties = { fontSize: 15, color: "#0f172a" };
