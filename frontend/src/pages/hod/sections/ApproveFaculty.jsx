import { useEffect, useState } from "react";
import API_BASE from "../../../api";
import ReusableTable from "../../../components/ReusableTable";

function ApproveFaculty() {

  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  /* ================= FETCH PENDING FACULTY ================= */

  useEffect(() => {

    if (!token) {
      setError("No authentication token found. Please login again.");
      setLoading(false);
      return;
    }

    const fetchFaculty = async () => {

      try {

        const res = await fetch(`${API_BASE}/hod/pending-faculty`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch faculty");
        }

        setFacultyList(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

    };

    fetchFaculty();

  }, [token]);


  /* ================= APPROVE ================= */

  const approveFaculty = async (id) => {

    try {

      const res = await fetch(
        `${API_BASE}/hod/approve-faculty/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Approval failed");
      }

      setFacultyList((prev) =>
        prev.filter((f) => f._id !== id)
      );

    } catch (err) {
      alert(err.message);
    }

  };


  /* ================= CALL FOR DISCUSSION ================= */

  const discussionFaculty = async (id) => {

    try {

      const res = await fetch(
        `${API_BASE}/hod/discussion-faculty/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Action failed");
      }

      setFacultyList((prev) =>
        prev.filter((f) => f._id !== id)
      );

    } catch (err) {
      alert(err.message);
    }

  };


  /* ================= TABLE COLUMNS ================= */

  const columns = [

    {
      key: "employeeId",
      label: "Employee ID"
    },

    {
      key: "name",
      label: "Name"
    },

    {
      key: "email",
      label: "Email"
    },

    {
      key: "department",
      label: "Department"
    },

    {
      key: "actions",
      label: "Action",
      render: (row) => (

        <div style={actionWrapper}>

          <button
            style={approveBtn}
            onClick={() => approveFaculty(row._id)}
          >
            Approve
          </button>

          <button
            style={discussionBtn}
            onClick={() => discussionFaculty(row._id)}
          >
            Call for Discussion
          </button>

        </div>

      )
    }

  ];


  /* ================= STATES ================= */

  if (loading) {
    return <div style={centerMessage}>Loading faculty approvals...</div>;
  }

  if (error) {
    return (
      <div style={errorBox}>
        <strong>Error:</strong> {error}
      </div>
    );
  }


  return (

    <div style={pageContainer}>

      <div style={headerSection}>
        <h1 style={title}>Approve Faculty Accounts</h1>
        <p style={subtitle}>
          Review and approve new faculty registrations
        </p>
      </div>

      {facultyList.length === 0 ? (
        <div style={emptyBox}>
          No pending faculty approvals.
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          data={facultyList}
        />
      )}

    </div>

  );

}

export default ApproveFaculty;


/* ================= STYLES ================= */

const pageContainer = {
  width: "100%",
  paddingTop: 20,
};

const headerSection = {
  marginBottom: 35,
};

const title = {
  fontSize: 26,
  fontWeight: 700,
  color: "#0F172A",
  marginBottom: 8,
};

const subtitle = {
  fontSize: 14,
  color: "#334155",
};

const actionWrapper = {
  display: "flex",
  gap: 10
};

const approveBtn = {
  padding: "7px 18px",
  backgroundColor: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
};

const discussionBtn = {
  padding: "7px 18px",
  backgroundColor: "#f59e0b",
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

const centerMessage = {
  padding: 40,
  color: "#334155",
};

const errorBox = {
  padding: 20,
  background: "#fee2e2",
  color: "#991b1b",
  borderRadius: 10,
  border: "1px solid #fecaca",
};