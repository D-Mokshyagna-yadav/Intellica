import { useMemo, useState } from "react";
import { apiFetch } from "../../../api";
import { useDepartments } from "../../../hooks/useDepartments";
import { showToast } from "../../../utils/toast";

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

export default function ManualUsers() {
  const [role, setRole] = useState("FACULTY");
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const { departments, loading: departmentsLoading } = useDepartments();

  const departmentOptions = useMemo(
    () => departments.map((department) => ({ value: department.code, label: department.name })),
    [departments]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
        body: JSON.stringify({
          role,
          ...form,
        }),
      });

      showToast({
        type: "success",
        message: `${role === "FACULTY" ? "Faculty" : "HOD"} created successfully`,
      });
      setForm(defaultForm);
      setRole("FACULTY");
    } catch (error) {
      showToast({ type: "error", message: error.message || "Failed to create user" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <h2 style={title}>Add Users</h2>
          <p style={subtitle}>Create approved faculty or HOD accounts directly from the admin panel.</p>
        </div>
        <div style={statusPill}>Accounts are active immediately</div>
      </div>

      <div style={tabRow}>
        <button type="button" onClick={() => setRole("FACULTY")} style={roleButton(role === "FACULTY")}>
          Faculty
        </button>
        <button type="button" onClick={() => setRole("HOD")} style={roleButton(role === "HOD")}>
          HOD
        </button>
      </div>

      <form onSubmit={handleSubmit} style={card}>
        <div style={grid}>
          <Field label="Employee ID" required>
            <input name="employeeId" value={form.employeeId} onChange={handleChange} style={input} />
          </Field>
          <Field label="Full Name" required>
            <input name="name" value={form.name} onChange={handleChange} style={input} />
          </Field>
          <Field label="Email" required>
            <input name="email" type="email" value={form.email} onChange={handleChange} style={input} />
          </Field>
          <Field label="Department" required>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              disabled={departmentsLoading}
              style={input}
            >
              <option value="">{departmentsLoading ? "Loading..." : "Select department"}</option>
              {departmentOptions.map((department) => (
                <option key={department.value} value={department.value}>
                  {department.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Designation" required>
            <input name="designation" value={form.designation} onChange={handleChange} style={input} />
          </Field>
          <Field label="Google Scholar">
            <input name="googleScholar" value={form.googleScholar} onChange={handleChange} style={input} />
          </Field>
          <Field label="Vidwan ID">
            <input name="vidwanId" value={form.vidwanId} onChange={handleChange} style={input} />
          </Field>
          <Field label="Scopus ID">
            <input name="scopusId" value={form.scopusId} onChange={handleChange} style={input} />
          </Field>
        </div>

        <div style={footer}>
          <p style={helperText}>
            {role === "FACULTY"
              ? "Faculty accounts are approved and can log in immediately."
              : "HOD accounts are approved and scoped to the selected department."}
          </p>
          <button type="submit" disabled={loading} style={submitButton}>
            {loading ? "Creating..." : `Create ${role === "FACULTY" ? "Faculty" : "HOD"}`}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required = false, children }) {
  return (
    <label style={field}>
      <span style={labelStyle}>
        {label} {required ? "*" : ""}
      </span>
      {children}
    </label>
  );
}

function roleButton(active) {
  return {
    border: "none",
    borderRadius: 999,
    padding: "10px 18px",
    fontWeight: 700,
    cursor: "pointer",
    background: active ? "#1d4ed8" : "#e2e8f0",
    color: active ? "#fff" : "#0f172a",
  };
}

const page = {
  display: "grid",
  gap: 20,
};

const hero = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  padding: 20,
  borderRadius: 18,
  background: "linear-gradient(135deg, #eff6ff, #f5f3ff)",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
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

const statusPill = {
  padding: "10px 14px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const tabRow = {
  display: "flex",
  gap: 12,
};

const card = {
  background: "#fff",
  borderRadius: 18,
  padding: 24,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const field = {
  display: "grid",
  gap: 8,
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#334155",
};

const input = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  padding: "12px 14px",
  fontSize: 14,
  color: "#0f172a",
  background: "#fff",
};

const footer = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginTop: 24,
  flexWrap: "wrap",
};

const helperText = {
  margin: 0,
  color: "#475569",
};

const submitButton = {
  border: "none",
  borderRadius: 12,
  padding: "12px 18px",
  background: "#0f172a",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};
