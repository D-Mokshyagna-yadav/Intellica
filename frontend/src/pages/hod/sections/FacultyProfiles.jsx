// src/pages/hod/sections/FacultyProfiles.jsx

import { useState, useEffect } from "react";
import API_BASE from "../../../api";
import FacultyDashboard from "../../faculty/FacultyDashboard";

function FacultyProfiles() {
  const [viewFacultyId, setViewFacultyId] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  // ✅ GET REAL DEPARTMENT (FIX)
  const userDept = localStorage.getItem("user_department");

  /* ================= FETCH APPROVED FACULTY ================= */

  useEffect(() => {

    const fetchFaculty = async () => {

      try {

        const res = await fetch(
          `${API_BASE}/hod/faculty-list`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch faculty");
        }

        setFacultyList(data);

      } catch (error) {

        console.error("FETCH FACULTY LIST ERROR:", error);

      }

    };

    fetchFaculty();

  }, [token]);

  /* ================= VIEW FACULTY DASHBOARD ================= */

  if (viewFacultyId) {
    return (
      <>
        <button onClick={() => setViewFacultyId(null)}>
          ← Back
        </button>

        <FacultyDashboard
          readOnly={true}
          facultyId={viewFacultyId}
        />
      </>
    );
  }

  /* ================= FILTER BY DEPARTMENT ================= */

  const filteredFaculty = facultyList
    .filter((f) =>
      (f.department || "").toLowerCase().trim() ===
      (userDept || "").toLowerCase().trim()
    )
    .filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div style={pageContainer}>

      <div style={headerSection}>
        <h1 style={title}>Faculty Profiles</h1>

        {/* ✅ FIXED TEXT */}
        <p style={subtitle}>
          Academic contribution summary — {userDept} Department
        </p>

        {/* ================= SEARCH BAR ================= */}

        <input
          type="text"
          placeholder="Search by Name or Employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInput}
        />

      </div>

      {filteredFaculty.length === 0 ? (

        <div style={emptyBox}>
          No faculty profiles available.
        </div>

      ) : (

        <div style={{ overflowX: "auto" }}>

          <table style={table}>

            <thead>
              <tr>
                <th style={th}>Employee ID</th>
                <th style={th}>Name</th>
                <th style={th}>Department</th>
                <th style={{ ...th, textAlign: "center" }}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {filteredFaculty.map((f) => (

                <HoverRow key={f._id}>

                  <td style={td}>{f.employeeId}</td>
                  <td style={td}>{f.name}</td>
                  <td style={td}>{f.department}</td>

                  <td style={{ ...td, textAlign: "center" }}>

                    <HoverButton
                      style={viewBtn}
                      onClick={() => setViewFacultyId(f._id)}
                    >
                      View Dashboard
                    </HoverButton>

                  </td>

                </HoverRow>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default FacultyProfiles;


/* ================= COMPONENTS ================= */

function HoverRow({ children }) {

  const [hover, setHover] = useState(false);

  return (
    <tr
      style={{
        backgroundColor: hover ? "#f1f5f9" : "white",
        transition: "background 0.2s ease",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </tr>
  );
}


function HoverButton({ children, style, ...props }) {

  const [hover, setHover] = useState(false);

  return (
    <button
      {...props}
      style={{
        ...style,
        transform: hover ? "translateY(-2px)" : "none",
        boxShadow: hover
          ? "0 6px 14px rgba(0,0,0,0.15)"
          : "none",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
}


/* ================= STYLES ================= */

const pageContainer = {
  width: "100%",
};

const headerSection = {
  marginBottom: 35,
};

const title = {
  fontSize: 26,
  fontWeight: 700,
  color: "#0F172A",
};

const subtitle = {
  fontSize: 14,
  color: "#334155",
  marginTop: 6,
};

const searchInput = {
  marginTop: 18,
  padding: "10px 14px",
  width: "300px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  outline: "none",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "white",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

const th = {
  padding: "16px 18px",
  backgroundColor: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  fontWeight: 600,
  fontSize: 14,
  color: "#1e293b",
  textAlign: "left",
};

const td = {
  padding: "16px 18px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: 14,
  color: "#1e293b",
};

const viewBtn = {
  padding: "7px 16px",
  backgroundColor: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
};

const emptyBox = {
  padding: 30,
  background: "#ffffff",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  color: "#475569",
};