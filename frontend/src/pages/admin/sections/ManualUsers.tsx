import { useMemo, useState } from "react";
import { apiFetch } from "../../../api";
import { useDepartments } from "../../../hooks/useDepartments";
import { showToast } from "../../../utils/toast";
import { UserPlus, CheckCircle } from "lucide-react";

const defaultForm = {
  employeeId: "",
  name: "",
  email: "",
  department: "",
  designation: "",
  googleScholar: "",
  vidwanId: "",
  scopusId: "",
};

const inputClass = "w-full bg-surface-container-low border border-subtle text-on-surface rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50";
const labelClass = "text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block";

export default function ManualUsers() {
  const [role, setRole] = useState("FACULTY");
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const { departments, loading: departmentsLoading } = useDepartments();

  const departmentOptions = useMemo(
    () => departments.map((d) => ({ value: d.code, label: d.name })),
    [departments]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((cur) => ({ ...cur, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.name || !form.email || !form.department || !form.designation) {
      showToast({ type: "error", message: "Please fill in all required fields" });
      return;
    }
    if (!form.googleScholar && !form.vidwanId && !form.scopusId) {
      showToast({ type: "error", message: "At least one research ID is required" });
      return;
    }
    try {
      setLoading(true);
      await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({ role, ...form }),
      });
      showToast({ type: "success", message: `${role === "FACULTY" ? "Faculty" : "HOD"} created successfully` });
      setForm(defaultForm);
      setRole("FACULTY");
    } catch (error) {
      showToast({ type: "error", message: error.message || "Failed to create user" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-glass-card rounded-2xl p-6 border border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-1">Add Users</h1>
          <p className="text-on-surface-variant font-body-md">
            Create approved faculty or HOD accounts directly from the admin panel.
          </p>
        </div>
        <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-sm font-semibold whitespace-nowrap">
          <CheckCircle size={14} />
          Accounts are active immediately
        </span>
      </div>

      {/* Role Toggle */}
      <div className="flex gap-3">
        {["FACULTY", "HOD"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
              role === r
                ? "bg-primary text-on-primary border-primary shadow-md"
                : "bg-glass-card text-on-surface border-subtle hover:border-primary/50"
            }`}
          >
            {r === "FACULTY" ? "Faculty" : "HOD"}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-glass-card rounded-2xl p-8 border border-subtle space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Required Fields */}
          <div>
            <label className={labelClass}>Employee ID <span className="text-error">*</span></label>
            <input name="employeeId" value={form.employeeId} onChange={handleChange} className={inputClass} placeholder="e.g. FAC001" />
          </div>
          <div>
            <label className={labelClass}>Full Name <span className="text-error">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Dr. John Smith" />
          </div>
          <div>
            <label className={labelClass}>Email <span className="text-error">*</span></label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="john@college.edu" />
          </div>
          <div>
            <label className={labelClass}>Department <span className="text-error">*</span></label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              disabled={departmentsLoading}
              className={inputClass}
            >
              <option value="">{departmentsLoading ? "Loading..." : "Select department"}</option>
              {departmentOptions.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Designation <span className="text-error">*</span></label>
            <input name="designation" value={form.designation} onChange={handleChange} className={inputClass} placeholder="Assistant Professor" />
          </div>

          {/* Research IDs */}
          <div>
            <label className={labelClass}>Google Scholar</label>
            <input name="googleScholar" value={form.googleScholar} onChange={handleChange} className={inputClass} placeholder="Scholar URL or ID" />
          </div>
          <div>
            <label className={labelClass}>Vidwan ID</label>
            <input name="vidwanId" value={form.vidwanId} onChange={handleChange} className={inputClass} placeholder="Vidwan ID" />
          </div>
          <div>
            <label className={labelClass}>Scopus ID</label>
            <input name="scopusId" value={form.scopusId} onChange={handleChange} className={inputClass} placeholder="Scopus ID" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-subtle">
          <p className="text-on-surface-variant text-sm">
            {role === "FACULTY"
              ? "Faculty accounts are approved and can log in immediately."
              : "HOD accounts are approved and scoped to the selected department."}
          </p>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-60"
          >
            <UserPlus size={16} />
            {loading ? "Creating..." : `Create ${role === "FACULTY" ? "Faculty" : "HOD"}`}
          </button>
        </div>
      </form>
    </div>
  );
}
