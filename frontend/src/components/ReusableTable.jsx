import React from "react";

function ReusableTable({ columns = [], data = [], onEdit, onResubmit, onView }) {

  if (!data.length) {
    return <p>No records found.</p>;
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
                      <button
                        style={viewBtn}
                        onClick={() => onView(row)}
                      >
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
                      <button
                        style={editBtn}
                        onClick={() => onEdit(row)}
                      >
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
  width: "100%"
};

const scrollWrapper = {
  width: "100%",
  overflowX: "auto"
};

const table = {
  minWidth: "1200px",
  borderCollapse: "collapse",
  backgroundColor: "white"
};

const th = {
  padding: 12,
  backgroundColor: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left",
  whiteSpace: "nowrap"
};

const td = {
  padding: 12,
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap"
};

const stickyHeader = {
  padding: 12,
  backgroundColor: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "center",
  position: "sticky",
  right: 0,
  zIndex: 3
};

const stickyCell = {
  padding: 12,
  borderBottom: "1px solid #e5e7eb",
  position: "sticky",
  right: 0,
  backgroundColor: "white",
  zIndex: 2
};

const viewBtn = {
  padding: "6px 10px",
  backgroundColor: "#6366f1",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  marginRight: 6
};

const editBtn = {
  padding: "6px 10px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

const resubmitBtn = {
  padding: "6px 10px",
  backgroundColor: "#f59e0b",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  marginLeft: 6
};