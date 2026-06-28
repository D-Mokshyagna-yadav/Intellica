import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../api";
import ConfirmModal from "../../../components/ConfirmModal";
import { showToast } from "../../../utils/toast";
import { Building2, Plus, Edit2, Archive, ArchiveRestore, CheckCircle, XCircle } from "lucide-react";

const initialForm = {
  name: "",
  code: "",
  description: "",
  sortOrder: "0",
  isActive: true,
};

const inputClass = "w-full bg-surface-container-low border border-subtle text-on-surface rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50 text-sm";
const labelClass = "text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5 block";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [confirmState, setConfirmState] = useState({
    open: false,
    department: null,
    mode: "delete",
  });

  const activeDepartments = useMemo(
    () => departments.filter((d) => !d.isArchived),
    [departments]
  );
  const archivedDepartments = useMemo(
    () => departments.filter((d) => d.isArchived),
    [departments]
  );

  useEffect(() => { loadDepartments(); }, []);

  async function loadDepartments() {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/departments/manage");
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast({ type: "error", message: error.message || "Failed to load departments" });
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setForm(initialForm);
    setEditingDepartment(null);
  };

  const openEdit = (department) => {
    setEditingDepartment(department);
    setForm({
      name: department.name || "",
      code: department.code || "",
      description: department.description || "",
      sortOrder: String(department.sortOrder ?? 0),
      isActive: Boolean(department.isActive),
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((cur) => ({
      ...cur,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast({ type: "error", message: "Department name is required" });
      return;
    }
    try {
      setSaving(true);
      const payload = { ...form, sortOrder: Number(form.sortOrder || 0) };
      await apiFetch(
        editingDepartment ? `/admin/departments/${editingDepartment._id}` : "/admin/departments",
        {
          method: editingDepartment ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );
      showToast({
        type: "success",
        message: editingDepartment ? "Department updated successfully" : "Department created successfully",
      });
      resetForm();
      await loadDepartments();
    } catch (error) {
      showToast({ type: "error", message: error.message || "Failed to save department" });
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = (department) => setConfirmState({ open: true, department, mode: "delete" });

  const handleRestore = async (department) => {
    try {
      await apiFetch(`/admin/departments/${department._id}/restore`, { method: "POST" });
      showToast({ type: "success", message: "Department restored successfully" });
      await loadDepartments();
    } catch (error) {
      showToast({ type: "error", message: error.message || "Failed to restore department" });
    }
  };

  const confirmArchive = async () => {
    const department = confirmState.department;
    setConfirmState({ open: false, department: null, mode: "delete" });
    if (!department) return;
    try {
      await apiFetch(`/admin/departments/${department._id}`, { method: "DELETE" });
      showToast({ type: "success", message: "Department archived successfully" });
      await loadDepartments();
      if (editingDepartment?._id === department._id) resetForm();
    } catch (error) {
      showToast({ type: "error", message: error.message || "Failed to archive department" });
    }
  };

  if (loading) {
    return <div className="text-on-surface-variant font-body-lg flex justify-center py-12">Loading departments...</div>;
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-glass-card rounded-2xl p-6 border border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-1">Department Management</h1>
          <p className="text-on-surface-variant font-body-md">Create, edit, archive, and restore departments.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Active</p>
            <p className="text-xl font-bold text-emerald-400 leading-none">{activeDepartments.length}</p>
          </div>
          <div className="bg-error/10 border border-error/20 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] font-bold text-error uppercase tracking-wider mb-1">Archived</p>
            <p className="text-xl font-bold text-error leading-none">{archivedDepartments.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Form */}
        <div className="xl:col-span-1">
          <form onSubmit={handleSubmit} className="bg-glass-card rounded-2xl p-6 border border-subtle space-y-4 sticky top-24">
            <h3 className="text-lg font-bold text-on-surface mb-4 border-b border-subtle pb-3">
              {editingDepartment ? "Edit Department" : "Create Department"}
            </h3>
            
            <div>
              <label className={labelClass}>Department Name <span className="text-error">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. Computer Science" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Code</label>
                <input name="code" value={form.code} onChange={handleChange} className={inputClass} placeholder="Optional" />
              </div>
              <div>
                <label className={labelClass}>Sort Order</label>
                <input name="sortOrder" type="number" value={form.sortOrder} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className={`${inputClass} min-h-[100px] resize-y`} placeholder="Department overview..." />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-subtle bg-surface-container-low cursor-pointer hover:border-primary/50 transition-colors">
                <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} className="w-4 h-4 rounded text-primary bg-surface-bright border-subtle focus:ring-primary focus:ring-2" />
                <span className="text-sm font-medium text-on-surface">{form.isActive ? "Enabled" : "Disabled"}</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-subtle">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl border border-subtle text-on-surface hover:bg-surface-bright transition-colors font-medium text-sm">
                Clear
              </button>
              <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 flex items-center gap-2">
                {saving ? "Saving..." : editingDepartment ? <><Edit2 size={16}/> Update</> : <><Plus size={16}/> Create</>}
              </button>
            </div>
          </form>
        </div>

        {/* Lists */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-glass-card rounded-2xl p-6 border border-subtle">
            <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <CheckCircle className="text-emerald-400" size={20} /> Active Departments
            </h3>
            <DepartmentTable
              departments={activeDepartments}
              onEdit={openEdit}
              onDelete={handleArchive}
              onRestore={handleRestore}
            />
          </div>

          <div className="bg-glass-card rounded-2xl p-6 border border-subtle opacity-90">
            <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <Archive className="text-error" size={20} /> Archived Departments
            </h3>
            <DepartmentTable
              departments={archivedDepartments}
              onEdit={openEdit}
              onDelete={handleArchive}
              onRestore={handleRestore}
              archived
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.open}
        title="Archive Department"
        message={`Archive ${confirmState.department?.name || "this department"}? It will be hidden from selection lists but can be restored later.`}
        type="prompt"
        placeholder="Type ARCHIVE to confirm"
        confirmationPhrase="ARCHIVE"
        onConfirm={confirmArchive}
        onCancel={() => setConfirmState({ open: false, department: null, mode: "delete" })}
      />
    </div>
  );
}

function DepartmentTable({ departments, onEdit, onDelete, onRestore, archived = false }) {
  if (!departments.length) {
    return (
      <div className="text-center py-8 text-on-surface-variant bg-surface-bright/20 rounded-xl border border-subtle/50 border-dashed">
        No departments found in this category.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-subtle">
      <table className="w-full text-left">
        <thead className="bg-surface-bright/30 border-b border-subtle text-xs uppercase tracking-wider text-on-surface-variant">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Code</th>
            <th className="px-4 py-3 font-semibold">Faculty</th>
            <th className="px-4 py-3 font-semibold">Credits</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-subtle/50">
          {departments.map((d) => (
            <tr key={d._id} className="hover:bg-surface-bright/10 transition-colors">
              <td className="px-4 py-3 text-sm font-bold text-on-surface">{d.name}</td>
              <td className="px-4 py-3 text-sm text-on-surface-variant font-mono">{d.code}</td>
              <td className="px-4 py-3 text-sm text-on-surface">{d.facultyCount ?? 0}</td>
              <td className="px-4 py-3 text-sm font-bold text-primary">{d.totalCredits ?? 0}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  d.isArchived ? "bg-error/15 text-error border border-error/20" : 
                  d.isActive ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : 
                  "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                }`}>
                  {d.isArchived ? "Archived" : d.isActive ? "Active" : "Disabled"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onEdit(d)} className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg transition-colors border border-sky-500/20" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  {archived ? (
                    <button onClick={() => onRestore(d)} className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20" title="Restore">
                      <ArchiveRestore size={16} />
                    </button>
                  ) : (
                    <button onClick={() => onDelete(d)} className="p-1.5 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-colors border border-error/20" title="Archive">
                      <Archive size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
