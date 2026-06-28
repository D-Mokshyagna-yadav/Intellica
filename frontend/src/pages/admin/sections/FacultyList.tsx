import { useEffect, useState } from "react";
import API_BASE from "../../../api";
import { showToast } from "../../../utils/toast";
import { useDepartments } from "../../../hooks/useDepartments";
import ConfirmModal from "../../../components/ConfirmModal";
import FacultyDashboard from "../../faculty/FacultyDashboard";
import HodDashboard from "../../hod/HodDashboard";
import { Search, Trash2, ArrowLeftRight, ExternalLink, Users, Building2 } from "lucide-react";

export default function FacultyList() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptUserId, setDeptUserId] = useState(null);
  const [deptUserCurrent, setDeptUserCurrent] = useState("");
  const { departments } = useDepartments();
  const [analytics, setAnalytics] = useState(null);

  const departmentUsers = users.filter(
    (u) => u.department?.toUpperCase() === selectedDept
  );
  const departmentNameByCode = Object.fromEntries(
    departments.map((d) => [d.code, d.name])
  );

  const totalFaculty = departmentUsers.filter(
    (u) => u.role === "FACULTY" || u.role === "HOD"
  ).length;

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      const res = await fetch(`${API_BASE}/admin/all-users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showToast({ type: "error", message: err.message || "Failed to fetch users" });
    }
  }

  useEffect(() => {
    if (!selectedDept) return;
    fetch(`${API_BASE}/admin/department-analytics/${selectedDept}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => showToast({ type: "error", message: err.message || "Failed to load analytics" }));
  }, [selectedDept]);

  const openDeleteModal = (userId) => {
    if (selectedUser) { showToast({ type: "error", message: "Go back to user list before deleting" }); return; }
    setDeleteUserId(userId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    setDeleteModalOpen(false);
    const userId = deleteUserId;
    setDeleteUserId(null);
    try {
      const res = await fetch(`${API_BASE}/admin/delete-user/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (res.ok) { showToast({ type: "success", message: "User removed successfully" }); fetchUsers(); }
      else showToast({ type: "error", message: data.message || "Delete failed" });
    } catch (err) {
      showToast({ type: "error", message: err.message || "Server error while deleting user" });
    }
  };

  const openDeptModal = (userId, currentDept) => {
    setDeptUserId(userId); setDeptUserCurrent(currentDept || ""); setDeptModalOpen(true);
  };

  const confirmChangeDepartment = async (newDept) => {
    setDeptModalOpen(false);
    const userId = deptUserId;
    setDeptUserId(null); setDeptUserCurrent("");
    if (!newDept) return;
    try {
      const res = await fetch(`${API_BASE}/admin/change-department/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ department: newDept }),
      });
      const data = await res.json();
      if (res.ok) { showToast({ type: "success", message: "Department updated" }); fetchUsers(); }
      else showToast({ type: "error", message: data.message || "Update failed" });
    } catch (err) {
      showToast({ type: "error", message: err.message || "Failed to update department" });
    }
  };

  /* ================= OPEN DASHBOARD ================= */
  if (selectedUser) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSelectedUser(null)}
            className="text-on-surface-variant hover:text-on-surface flex items-center gap-2 font-medium transition-colors"
          >
            ← Back to Profiles
          </button>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-error/15 text-error border border-error/20">
            🔒 ADMIN READ-ONLY MODE
          </span>
        </div>
        {selectedUser.role === "FACULTY" && (
          <FacultyDashboard readOnly={true} facultyId={selectedUser._id} />
        )}
        {selectedUser.role === "HOD" && (
          <HodDashboard readOnly={true} hodUser={selectedUser} />
        )}
      </div>
    );
  }

  /* ================= FILTER ================= */
  const filteredUsers = (selectedDept ? departmentUsers : users)
    .filter((u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const roleA = (a.role || "").toUpperCase();
      const roleB = (b.role || "").toUpperCase();
      if (roleA === "HOD" && roleB !== "HOD") return -1;
      if (roleB === "HOD" && roleA !== "HOD") return 1;
      return 0;
    });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-2">Faculty & HOD Profiles</h1>
          <p className="text-on-surface-variant font-body-md">Admin view — All Departments</p>
        </div>
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-on-surface-variant/70" />
          </div>
          <input
            type="text"
            placeholder="Search Name, ID, Department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border border-subtle text-on-surface rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Department Filter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <button
          onClick={() => setSelectedDept(null)}
          className={`p-3 rounded-xl border text-sm font-semibold text-center transition-all ${
            !selectedDept
              ? "bg-primary text-on-primary border-primary shadow-md"
              : "bg-glass-card text-on-surface border-subtle hover:border-primary/50"
          }`}
        >
          All
        </button>
        {departments.map((dep) => (
          <button
            key={dep.code}
            onClick={() => setSelectedDept(dep.code)}
            className={`p-3 rounded-xl border text-sm font-semibold text-center transition-all truncate ${
              selectedDept === dep.code
                ? "bg-primary text-on-primary border-primary shadow-md"
                : "bg-glass-card text-on-surface border-subtle hover:border-primary/50"
            }`}
            title={dep.name}
          >
            {dep.name}
          </button>
        ))}
      </div>

      {/* Department Analytics (when dept selected) */}
      {selectedDept && (
        <div className="bg-glass-card rounded-2xl p-6 border border-subtle mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-on-surface">
              {departmentNameByCode[selectedDept] || selectedDept} Department
            </h2>
            <button
              onClick={() => setSelectedDept(null)}
              className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors"
            >
              ← All Departments
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Faculty", value: totalFaculty },
              { label: "Total Credits", value: analytics?.totalCredits ?? 0 },
              { label: "Total Activities", value: analytics?.totalActivities ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-bright/20 p-4 rounded-xl border border-subtle/50 text-center">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-2">{label}</p>
                <p className="text-2xl font-display font-bold text-primary">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Table / Cards */}
      {filteredUsers.length === 0 ? (
        <div className="bg-glass-card rounded-2xl p-12 border border-subtle flex flex-col items-center justify-center text-center">
          <Users className="w-12 h-12 text-on-surface-variant mb-4" />
          <h3 className="text-xl font-bold text-on-surface mb-2">No Users Found</h3>
          <p className="text-on-surface-variant">Try adjusting your search or department filter.</p>
        </div>
      ) : (
        <div className="bg-glass-card rounded-2xl border border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-subtle bg-surface-bright/10">
                <tr>
                  {["Employee ID", "Name", "Department", "Role", "Dashboard", "Change Dept", "Remove"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/50">
                {filteredUsers.map((user) => {
                  const isHod = (user.role || "").toUpperCase() === "HOD";
                  return (
                    <tr
                      key={user._id}
                      className={`hover:bg-surface-bright/10 transition-colors ${isHod ? "border-l-2 border-amber-400" : ""}`}
                    >
                      <td className="px-5 py-4 text-sm text-on-surface font-mono">{user.employeeId}</td>
                      <td className="px-5 py-4 text-sm font-medium text-on-surface">{user.name}</td>
                      <td className="px-5 py-4 text-sm text-on-surface-variant">
                        {departmentNameByCode[user.department] || user.department}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          isHod
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                            : "bg-surface-bright text-on-surface-variant border-subtle"
                        }`}>
                          {isHod ? "HOD ⭐" : user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 hover:bg-primary/25 text-primary rounded-lg text-xs font-semibold transition-all border border-primary/20"
                        >
                          <ExternalLink size={12} />
                          View
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openDeptModal(user._id, user.department)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 rounded-lg text-xs font-semibold transition-all border border-sky-500/20"
                        >
                          <ArrowLeftRight size={12} />
                          Change
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openDeleteModal(user._id)}
                          disabled={user.role === "ADMIN"}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-error/15 hover:bg-error/25 text-error rounded-lg text-xs font-semibold transition-all border border-error/20 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Remove User"
        message="Are you sure you want to remove this user? This action cannot be undone."
        type="prompt"
        placeholder="Type DELETE to confirm"
        confirmationPhrase="DELETE"
        onConfirm={confirmDeleteUser}
        onCancel={() => { setDeleteModalOpen(false); setDeleteUserId(null); }}
      />
      <ConfirmModal
        isOpen={deptModalOpen}
        title="Change Department"
        message={`Select new department (Current: ${departmentNameByCode[deptUserCurrent] || deptUserCurrent})`}
        type="select"
        options={departments.map((d) => d.code)}
        defaultValue={deptUserCurrent}
        onConfirm={confirmChangeDepartment}
        onCancel={() => { setDeptModalOpen(false); setDeptUserId(null); setDeptUserCurrent(""); }}
      />
    </div>
  );
}
