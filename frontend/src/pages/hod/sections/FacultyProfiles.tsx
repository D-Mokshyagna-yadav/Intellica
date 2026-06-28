// src/pages/hod/sections/FacultyProfiles.jsx

import { useState, useEffect } from "react";
import { apiFetch } from "../../../api";
import FacultyDashboard from "../../faculty/FacultyDashboard";
import { showToast } from "../../../utils/toast";
import { Search, User, ExternalLink, Users } from "lucide-react";

function FacultyProfiles() {
  const [viewFacultyId, setViewFacultyId] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ GET REAL DEPARTMENT (FIX)
  const userDept = localStorage.getItem("user_department");

  /* ================= FETCH APPROVED FACULTY ================= */
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const data = await apiFetch("/hod/faculty-list");
        setFacultyList(data);
      } catch (error) {
        showToast({ type: "error", message: error.message || "Failed to fetch faculty" });
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  /* ================= VIEW FACULTY DASHBOARD ================= */
  if (viewFacultyId) {
    return (
      <div className="w-full">
        <button 
          onClick={() => setViewFacultyId(null)}
          className="mb-4 text-on-surface-variant hover:text-on-surface flex items-center gap-2 font-medium transition-colors"
        >
          ← Back to Faculty List
        </button>
        <FacultyDashboard
          readOnly={true}
          facultyId={viewFacultyId}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-on-surface-variant font-body-lg">
        Loading faculty profiles...
      </div>
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
    <div className="w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-2">Faculty Profiles</h1>
          <p className="text-on-surface-variant font-body-md">
            Academic contribution summary — {userDept} Department
          </p>
        </div>

        {/* ================= SEARCH BAR ================= */}
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-on-surface-variant/70" />
          </div>
          <input
            type="text"
            placeholder="Search Name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border border-subtle text-on-surface rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {filteredFaculty.length === 0 ? (
        <div className="bg-glass-card rounded-2xl p-12 border border-subtle flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-surface-bright flex items-center justify-center mb-4 text-on-surface-variant">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">No Profiles Found</h3>
          <p className="text-on-surface-variant max-w-md">
            {search ? "No faculty members match your search criteria." : "No faculty profiles are available in your department yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFaculty.map((f) => (
            <div key={f._id} className="bg-glass-card rounded-2xl p-5 border border-subtle flex flex-col transition-all hover:border-primary/50 hover:shadow-lg group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {f.name?.charAt(0)?.toUpperCase() || <User size={24} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-on-surface truncate" title={f.name}>
                    {f.name}
                  </h3>
                  <p className="text-on-surface-variant text-sm truncate uppercase tracking-wider font-semibold" title={f.employeeId}>
                    ID: {f.employeeId}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-subtle">
                <button
                  onClick={() => setViewFacultyId(f._id)}
                  className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} />
                  <span>View Dashboard</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FacultyProfiles;
