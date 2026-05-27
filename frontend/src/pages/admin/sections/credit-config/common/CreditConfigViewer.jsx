import { useEffect, useState } from "react";
import API_BASE from "/src/api";

function CreditConfigViewer() {

  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/credit-config/all`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <p>Loading credit rules...</p>;

  return (
    <div style={{ marginTop: 30 }}>
        <input
  type="text"
  placeholder="Search category..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    marginTop: 10,
    marginBottom: 20,
    padding: "8px 12px",
    width: "300px",
    borderRadius: 6,
    border: "1px solid #cbd5e1"
  }}
/>
      <h3>Credit Rules</h3>

      {Object.entries(data).map(([type, categories]) => (
        <div key={type} style={{ marginTop: 20 }}>
          <h4>{type.toUpperCase()}</h4>

          {Object.entries(categories)
  .filter(([cat]) =>
    toTitle(cat).toLowerCase().includes(search.toLowerCase())
  )
  .map(([cat, rules]) => (
            <div
              key={cat}
              style={{
                padding: 15,
                background: "white",
                marginTop: 12,
                borderRadius: 10,
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
              }}
            >
              <b style={{ fontSize: 15 }}>{toTitle(cat)}</b>

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