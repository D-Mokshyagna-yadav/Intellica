import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../api";
import ConfirmModal from "../../../components/ConfirmModal";
import { showToast } from "../../../utils/toast";

const initialForm = {
  name: "",
  code: "",
  description: "",
  sortOrder: "0",
  isActive: true,
};

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
    () => departments.filter((department) => !department.isArchived),
    [departments]
  );
  const archivedDepartments = useMemo(
    () => departments.filter((department) => department.isArchived),
    [departments]
  );

  useEffect(() => {
    loadDepartments();
  }, []);

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

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      showToast({ type: "error", message: "Department name is required" });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder || 0),
      };

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

  const handleArchive = (department) => {
    setConfirmState({ open: true, department, mode: "delete" });
  };

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

    if (!department) {
      return;
    }

    try {
      await apiFetch(`/admin/departments/${department._id}`, { method: "DELETE" });
      showToast({ type: "success", message: "Department archived successfully" });
      await loadDepartments();
      if (editingDepartment?._id === department._id) {
        resetForm();
      }
    } catch (error) {
      showToast({ type: "error", message: error.message || "Failed to archive department" });
    }
  };

  if (loading) {
    return <div style={pageShell}>Loading departments...</div>;
  }

  return (
    <div style={pageShell}>
      <div style={headerCard}>
        <div>
          <h2 style={title}>Department Management</h2>
          <p style={subtitle}>Create, edit, archive, and restore departments from MongoDB.</p>
        </div>
        <div style={statsRow}>
          <Stat label="Active" value={activeDepartments.length} tone="#dcfce7" color="#166534" />
          <Stat label="Archived" value={archivedDepartments.length} tone="#fee2e2" color="#991b1b" />
        </div>
      </div>

      <div style={grid}>
        <form onSubmit={handleSubmit} style={formCard}>
          <h3 style={sectionTitle}>{editingDepartment ? "Edit Department" : "Create Department"}</h3>
          <div style={fieldGrid}>
            <Field label="Department Name" required>
              <input name="name" value={form.name} onChange={handleChange} style={input} />
            </Field>
            <Field label="Department Code">
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                style={input}
                placeholder="Optional, auto-generated from name"
              />
            </Field>
            <Field label="Sort Order">
              <input name="sortOrder" type="number" value={form.sortOrder} onChange={handleChange} style={input} />
            </Field>
            <Field label="Active">
              <label style={toggleRow}>
                <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} />
                <span>{form.isActive ? "Enabled" : "Disabled"}</span>
              </label>
            </Field>
          </div>
          <Field label="Description">
            <textarea name="description" value={form.description} onChange={handleChange} style={{ ...input, minHeight: 110, resize: "vertical" }} />
          </Field>
          <div style={actionRow}>
            <button type="button" onClick={resetForm} style={secondaryButton}>
              Clear
            </button>
            <button type="submit" disabled={saving} style={primaryButton}>
              {saving ? "Saving..." : editingDepartment ? "Update Department" : "Create Department"}
            </button>
          </div>
        </form>

        <div style={listColumn}>
          <div style={listCard}>
            <h3 style={sectionTitle}>Active Departments</h3>
            <DepartmentTable
              departments={activeDepartments}
              onEdit={openEdit}
              onDelete={handleArchive}
              onRestore={handleRestore}
            />
          </div>

          <div style={listCard}>
            <h3 style={sectionTitle}>Archived Departments</h3>
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
    return <p style={emptyText}>No departments found.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={table}>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Code</Th>
            <Th>Faculty</Th>
            <Th>Credits</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => (
            <tr key={department._id}>
              <Td>{department.name}</Td>
              <Td>{department.code}</Td>
              <Td>{department.facultyCount ?? 0}</Td>
              <Td>{department.totalCredits ?? 0}</Td>
              <Td>{department.isArchived ? "Archived" : department.isActive ? "Active" : "Disabled"}</Td>
              <Td>
                <div style={actions}>
                  <button type="button" onClick={() => onEdit(department)} style={smallButton}>
                    Edit
                  </button>
                  {archived ? (
                    <button type="button" onClick={() => onRestore(department)} style={smallButtonAlt}>
                      Restore
                    </button>
                  ) : (
                    <button type="button" onClick={() => onDelete(department)} style={smallButtonDanger}>
                      Archive
                    </button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, required = false, children }) {
  return (
    <label style={field}>
      <span style={labelText}>
        {label} {required ? "*" : ""}
      </span>
      {children}
    </label>
  );
}

function Stat({ label, value, tone, color }) {
  return (
    <div style={{ ...statCard, background: tone, color }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{value}</div>
    </div>
  );
}

function Th({ children }) {
  return <th style={th}>{children}</th>;
}

function Td({ children }) {
  return <td style={td}>{children}</td>;
}

const pageShell = {
  display: "grid",
  gap: 20,
};

const headerCard = {
  background: "linear-gradient(135deg, #eff6ff, #fdf2f8)",
  borderRadius: 18,
  padding: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const title = {
  margin: 0,
  fontSize: 26,
  color: "#0f172a",
};

const subtitle = {
  margin: "8px 0 0",
  color: "#475569",
};

const statsRow = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
};

const statCard = {
  minWidth: 120,
  padding: "14px 16px",
  borderRadius: 14,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "minmax(300px, 380px) 1fr",
  gap: 20,
  alignItems: "start",
};

const formCard = {
  background: "#fff",
  borderRadius: 18,
  padding: 20,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const listColumn = {
  display: "grid",
  gap: 20,
};

const listCard = {
  background: "#fff",
  borderRadius: 18,
  padding: 20,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const sectionTitle = {
  margin: "0 0 16px",
  fontSize: 18,
  color: "#0f172a",
};

const fieldGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 14,
  marginBottom: 14,
};

const field = {
  display: "grid",
  gap: 8,
};

const labelText = {
  fontSize: 13,
  fontWeight: 700,
  color: "#334155",
};

const input = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  padding: "11px 14px",
  fontSize: 14,
  color: "#0f172a",
  background: "#fff",
};

const toggleRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "11px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#fff",
  minHeight: 44,
};

const actionRow = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 10,
  flexWrap: "wrap",
};

const primaryButton = {
  border: "none",
  borderRadius: 12,
  padding: "11px 16px",
  background: "#0f172a",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButton = {
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: "11px 16px",
  background: "#fff",
  color: "#334155",
  fontWeight: 700,
  cursor: "pointer",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 13,
  color: "#475569",
  borderBottom: "1px solid #e2e8f0",
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #e2e8f0",
  color: "#0f172a",
  verticalAlign: "top",
};

const actions = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const smallButton = {
  border: "none",
  borderRadius: 10,
  padding: "8px 12px",
  background: "#dbeafe",
  color: "#1d4ed8",
  fontWeight: 700,
  cursor: "pointer",
};

const smallButtonAlt = {
  border: "none",
  borderRadius: 10,
  padding: "8px 12px",
  background: "#dcfce7",
  color: "#166534",
  fontWeight: 700,
  cursor: "pointer",
};

const smallButtonDanger = {
  border: "none",
  borderRadius: 10,
  padding: "8px 12px",
  background: "#fee2e2",
  color: "#b91c1c",
  fontWeight: 700,
  cursor: "pointer",
};

const emptyText = {
  margin: 0,
  color: "#64748b",
};
