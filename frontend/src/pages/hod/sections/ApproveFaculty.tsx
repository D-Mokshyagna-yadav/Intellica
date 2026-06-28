import { useEffect, useState } from "react";
import API_BASE from "../../../api";
import { showToast } from "../../../utils/toast";
import { CheckCircle, MessageSquareWarning, User } from "lucide-react";

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
      const res = await fetch(`${API_BASE}/hod/approve-faculty/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Approval failed");
      }

      setFacultyList((prev) => prev.filter((f) => f._id !== id));
      showToast({ type: "success", message: "Faculty approved successfully" });
    } catch (err) {
      showToast({ type: "error", message: err.message });
    }
  };

  /* ================= CALL FOR DISCUSSION ================= */
  const discussionFaculty = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/hod/discussion-faculty/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Action failed");
      }

      setFacultyList((prev) => prev.filter((f) => f._id !== id));
      showToast({ type: "info", message: "Called for discussion" });
    } catch (err) {
      showToast({ type: "error", message: err.message });
    }
  };

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-on-surface-variant font-body-lg">
        Loading faculty approvals...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-error/10 text-error-container border border-error/20 rounded-xl mb-6">
        <strong className="font-semibold block mb-1">Error</strong>
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-on-surface mb-2">Approve Faculty Accounts</h1>
        <p className="text-on-surface-variant font-body-md">
          Review and approve new faculty registrations for your department.
        </p>
      </div>

      {facultyList.length === 0 ? (
        <div className="bg-glass-card rounded-2xl p-12 border border-subtle flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">All Caught Up!</h3>
          <p className="text-on-surface-variant max-w-md">
            There are no pending faculty registrations waiting for your approval right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {facultyList.map((faculty) => (
            <div key={faculty._id} className="bg-glass-card rounded-2xl p-6 border border-subtle flex flex-col">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {faculty.name?.charAt(0)?.toUpperCase() || <User size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-on-surface truncate" title={faculty.name}>
                    {faculty.name}
                  </h3>
                  <p className="text-on-surface-variant text-sm truncate" title={faculty.email}>
                    {faculty.email}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-bright/20 p-3 rounded-lg border border-subtle/50">
                  <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">Employee ID</p>
                  <p className="font-medium text-on-surface truncate" title={faculty.employeeId}>{faculty.employeeId}</p>
                </div>
                <div className="bg-surface-bright/20 p-3 rounded-lg border border-subtle/50">
                  <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">Department</p>
                  <p className="font-medium text-on-surface truncate" title={faculty.department}>{faculty.department}</p>
                </div>
              </div>
              
              <div className="mt-auto flex gap-3 pt-4 border-t border-subtle">
                <button
                  onClick={() => approveFaculty(faculty._id)}
                  className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => discussionFaculty(faculty._id)}
                  className="flex-1 bg-surface-bright/50 hover:bg-surface-bright text-on-surface font-medium rounded-xl py-2.5 transition-all border border-subtle flex items-center justify-center gap-2"
                >
                  <MessageSquareWarning size={16} />
                  <span>Discuss</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ApproveFaculty;
