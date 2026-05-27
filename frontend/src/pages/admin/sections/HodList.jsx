import { useEffect, useState } from "react";
import API_BASE from "../../../api";

export default function HodList() {
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHods();
  }, []);

  const fetchHods = async () => {
    try {

      const res = await fetch(`${API_BASE}/admin/pending-hods`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      console.log("PENDING HODS:", data);

      if (Array.isArray(data)) {
        setHods(data);
      } else {
        setHods([]);
      }

      setLoading(false);

    } catch (err) {
      console.error("Error fetching HODs", err);
      setLoading(false);
    }
  };

  const approveHod = async (id) => {

    await fetch(`${API_BASE}/admin/approve-hod/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    fetchHods();
  };

  const callDiscussion = async (id) => {

  try {

    const res = await fetch(`${API_BASE}/admin/hod-discussion/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    });

    if (res.ok) {

      // Remove HOD from UI immediately
      setHods(prev => prev.filter(hod => hod._id !== id));

    }

  } catch (err) {

    console.error("Discussion request failed", err);

  }

};

  if (loading) return <p>Loading HODs...</p>;

  return (
    <div>
      <h2>Pending HOD Approvals</h2>

      <div style={card}>
        {hods.length === 0 ? (
          <p style={{ color: "#6b7280" }}>
            No HOD registrations awaiting approval.
          </p>
        ) : (
          <table style={table}>
            <thead style={thead}>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Department</th>
                <th style={th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {hods.map((hod) => (
                <tr key={hod._id} style={row}>
                  <td style={td}>{hod.name}</td>
                  <td style={td}>{hod.email}</td>
                  <td style={td}>{hod.department}</td>

                  <td style={td}>
                    <button
                      style={approveBtn}
                      onClick={() => approveHod(hod._id)}
                    >
                      Approve
                    </button>

                    <button
                      style={discussionBtn}
                      onClick={() => callDiscussion(hod._id)}
                    >
                      Call for Discussion
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const card = {
  background: "white",
  borderRadius: 16,
  padding: 20,
  marginTop: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const thead = {
  backgroundColor: "#f3f4f6",
};

const th = {
  padding: "14px",
  textAlign: "left",
  fontWeight: 600,
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
};

const row = {
  height: 60,
};

const approveBtn = {
  backgroundColor: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "6px 14px",
  cursor: "pointer",
  marginRight: 8,
};

const discussionBtn = {
  backgroundColor: "#f59e0b",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "6px 14px",
  cursor: "pointer",
};