import React, { useState, useEffect } from "react";
import API_BASE from "../../api";

function ProfileInfo({ user }) {

  const [showEdit, setShowEdit] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    designation: "",
    googleScholar: "",
    scopusId: "",
    vidwanId: ""
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || "",
        email: user.email || "",
        designation: user.designation || "",
        googleScholar: user.googleScholar || "",
        scopusId: user.scopusId || "",
        vidwanId: user.vidwanId || ""
      });
    }
  }, [user]);

  if (!user) return null;

  const links = [];

  if (user.googleScholar?.trim()) links.push(user.googleScholar.trim());
if (user.scopusId?.trim()) links.push(user.scopusId.trim());
if (user.vidwanId?.trim()) links.push(user.vidwanId.trim());
  const handleUpdate = async () => {
    try {
      const role = localStorage.getItem("user_role");

const endpoint =
  role === "HOD"
    ? `${API_BASE}/hod/update-profile`
    : `${API_BASE}/faculty/update-profile`;

const res = await fetch(endpoint,  {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ update UI without reload
        Object.assign(user, editData);
        setShowEdit(false);
      } else {
        alert(data.message || "Update failed");
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={container}>

      {/* EMPLOYEE ID */}
      <p style={idStyle}>ID: {user.employeeId}</p>

      {/* NAME */}
      <h3 style={nameStyle}>{user.name}</h3>

      {/* DESIGNATION */}
      <p style={designationStyle}>{user.designation}</p>

      {/* LINKS */}
      <div style={{ marginTop: 12 }}>
        {links.map((link, index) => (
          <a
            key={index}
            href={link.startsWith("http") ? link : `https://${link}`}
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            {link}
          </a>
        ))}
      </div>

      {/* EDIT BUTTON */}
      <button style={editBtn} onClick={() => setShowEdit(true)}>
        Edit Profile
      </button>

      {/* MODAL */}
      {showEdit && (
        <div style={overlay}>
          <div style={modal}>

            <h3>Edit Profile</h3>

            <input
              style={input}
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              placeholder="Name"
            />

            <input
              style={input}
              value={editData.email}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
              placeholder="Email"
            />

            <input
              style={input}
              value={editData.designation}
              onChange={(e) =>
                setEditData({ ...editData, designation: e.target.value })
              }
              placeholder="Designation"
            />

            <input
              style={input}
              value={editData.googleScholar}
              onChange={(e) =>
                setEditData({ ...editData, googleScholar: e.target.value })
              }
              placeholder="Google Scholar Link"
            />

            <input
              style={input}
              value={editData.scopusId}
              onChange={(e) =>
                setEditData({ ...editData, scopusId: e.target.value })
              }
              placeholder="Scopus ID"
            />

            <input
              style={input}
              value={editData.vidwanId}
              onChange={(e) =>
                setEditData({ ...editData, vidwanId: e.target.value })
              }
              placeholder="Vidwan ID"
            />

            {/* EMPLOYEE ID (LOCKED) */}
            <input
              style={{ ...input, background: "#eee" }}
              value={user.employeeId}
              disabled
            />

            <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
              <button style={saveBtn} onClick={handleUpdate}>
                Save
              </button>

              <button style={cancelBtn} onClick={() => setShowEdit(false)}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ProfileInfo;

/* ===== Styles ===== */

const container = {
  marginTop: 18,
  textAlign: "center",
};

const idStyle = {
  fontSize: 13,
  color: "#666",
  marginBottom: 4
};

const nameStyle = {
  margin: 0,
  fontWeight: 800,
  fontSize: 20,
};

const designationStyle = {
  margin: "6px 0",
  fontSize: 15,
  fontWeight: 500,
  opacity: 0.85,
};

const linkStyle = {
  display: "block",
  background: "black",
  color: "white",
  padding: "8px 12px",
  borderRadius: 8,
  marginTop: 8,
  textDecoration: "none",
  fontSize: 14,
};

const editBtn = {
  marginTop: 12,
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  background: "#4f46e5",
  color: "white",
  cursor: "pointer"
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 99999,                // 🔥 CRITICAL FIX
};

const modal = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  width: 320,
  maxWidth: "90%",
  boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
  animation: "scaleIn 0.2s ease"
};

const input = {
  width: "100%",
  padding: 8,
  marginTop: 10,
  borderRadius: 6,
  border: "1px solid #ccc"
};

const saveBtn = {
  flex: 1,
  padding: 8,
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

const cancelBtn = {
  flex: 1,
  padding: 8,
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};