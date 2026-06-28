import React from "react";

function ReusableTable({ columns = [], data = [], onEdit, onResubmit, onView }) {

  if (!data.length) {
    return (
      <div style={emptyState}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#475569" }}>No records found</p>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#94a3b8" }}>Try changing the filters or come back after new entries are submitted.</p>
      </div>
    );
  }

  /* ================= FORMAT VALUES ================= */

  const formatValue = (key, value) => {

    if (!value) return "-";

    if (key.toLowerCase().includes("monthyear")) {

      const [year, month] = value.split("-");

      const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
      ];

      return `${months[parseInt(month) - 1]} ${year}`;
    }

    return value;
  };

  return (

    <div style={outerWrapper}>

      <div style={scrollWrapper}>

        <table style={table}>

          <thead>

            <tr>

              {columns.map((col) => (
                  <th key={col.key} style={th}>
                  {col.label}
                </th>
              ))}

              {(onEdit || onResubmit || onView) && (
                <th style={stickyHeader}>Actions</th>
              )}

            </tr>

          </thead>

          <tbody>

            {data.map((row, index) => (

              <tr key={row._id || row.id || index}>

                {columns.map((col) => {

                  let value;

                  if (col.render) {
                    value = col.render(row);
                  } else {
                    value = row[col.key];
                  }

                  return (
                    <td key={col.key} style={td}>
                      {formatValue(col.key, value)}
                    </td>
                  );

                })}

                {(onEdit || onResubmit || onView) && (

                  <td style={stickyCell}>

                    {onView && (
                      <button style={viewBtn} onClick={() => onView(row)}>
                        View
                      </button>
                    )}

                    {onEdit && (
                      row.status === "HOD_APPROVED" ||
                      row.status === "ADMIN_APPROVED" ||
                      row.status === "FACULTY_SUBMITTED" ||
                      row.status === "HOD_SUBMITTED" ||
                      row.status === "PENDING"
                    ) && (
                      <button style={editBtn} onClick={() => onEdit(row)}>
                        Edit
                      </button>
                    )}

                    {onResubmit && (row.status === "HOD_COMMENT" || row.status === "ADMIN_COMMENT") && (
  <button
    style={resubmitBtn}
    onClick={() => onResubmit(row)}
  >
    Resubmit
  </button>
)}
                  </td>

                )}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default ReusableTable;


/* ================= STYLES ================= */

const outerWrapper = {
  width: "100%",
  borderRadius: 24,
  border: "1px solid #e2e8f0",
  backgroundColor: "white",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
  overflow: "hidden"
};

const scrollWrapper = {
  width: "100%",
  overflowX: "auto"
};

const table = {
  minWidth: "960px",
  borderCollapse: "collapse",
  backgroundColor: "white"
};

const th = {
  padding: "14px 16px",
  backgroundColor: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left",
  whiteSpace: "nowrap",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.02em",
  color: "#475569"
};

const td = {
  padding: "14px 16px",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
  fontSize: 14,
  color: "#0f172a"
};

const stickyHeader = {
  padding: "14px 16px",
  backgroundColor: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "center",
  position: "sticky",
  right: 0,
  zIndex: 3
};

const stickyCell = {
  padding: "14px 16px",
  borderBottom: "1px solid #e5e7eb",
  position: "sticky",
  right: 0,
  backgroundColor: "white",
  zIndex: 2
};

const viewBtn = {
  padding: "7px 12px",
  backgroundColor: "#eff6ff",
  color: "#1d4ed8",
  border: "1px solid #bfdbfe",
  borderRadius: 999,
  cursor: "pointer",
  marginRight: 6,
  fontSize: 12,
  fontWeight: 700
};

const editBtn = {
  padding: "7px 12px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 999,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700
};

const resubmitBtn = {
  padding: "7px 12px",
  backgroundColor: "#fff7ed",
  color: "#c2410c",
  border: "1px solid #fdba74",
  borderRadius: 999,
  cursor: "pointer",
  marginLeft: 6,
  fontSize: 12,
  fontWeight: 700
};

const emptyState = {
  width: "100%",
  border: "1px dashed #cbd5e1",
  borderRadius: 24,
  background: "#fff",
  padding: 28,
  textAlign: "center"
};