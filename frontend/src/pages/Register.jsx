import { useState } from "react";
import { useResponsive } from "../hooks/useResponsive";
import "../styles/responsiveDashboard.css";
import collegeImg from "../assets/college_logo.png";
import { apiFetch } from "../api";
import { DEPARTMENTS } from "../constants/departments";
import { showToast } from "../utils/toast";

function Register({ setPage }) {
  const responsive = useResponsive();
  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    email: "",
    role: "",
    department: "",
    designation: "",
    googleScholar: "",
    vidwanId: "",
    scopusId: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleRegister = async () => {
    if (!form.employeeId || !form.name || !form.email || !form.role || !form.department || !form.designation) {
      showToast({ type: "error", message: "All fields are required" });
      return;
    }

    if (!profileImage) {
      showToast({ type: "error", message: "Profile photo is required" });
      return;
    }

    if (!form.googleScholar && !form.vidwanId && !form.scopusId) {
      showToast({ type: "error", message: "At least one research ID is required" });
      return;
    }

    try {
      setLoading(true);
      const endpoint = form.role === "Faculty" ? "/auth/faculty/register" : "/auth/hod/register";
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("profileImage", profileImage);

      const data = await apiFetch(endpoint, {
        method: "POST",
        body: formData,
      });

      showToast({ type: "success", message: data.message || "Registration completed" });
      setPage("login");
    } catch (error) {
      showToast({ type: "error", message: error.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <img
        src={collegeImg}
        alt="College"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top center",
          zIndex: -1,
        }}
      />

      <div className="top-left-actions" style={{ display: "flex", gap: 12 }}>
        <HoverButton onClick={() => setPage("leaderboard")}>Leaderboard</HoverButton>
        <HoverButton onClick={() => setPage("login")}>Back to Login</HoverButton>
      </div>

      <div className="responsive-center">
        <div className="glass-card responsive-card">
          <h2 style={{ textAlign: "center", marginBottom: 25, color: "#0f2333" }}>Faculty / HOD Registration</h2>

          <StyledInput name="employeeId" value={form.employeeId} onChange={handleChange} placeholder="Employee ID" />
          <StyledInput name="name" value={form.name} onChange={handleChange} placeholder="Name" />
          <StyledInput name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email Address" />

          <StyledSelect name="role" value={form.role} onChange={handleChange}>
            <option value="">Select Role</option>
            <option value="Faculty">Faculty</option>
            <option value="HOD">HOD</option>
          </StyledSelect>

          <StyledSelect name="department" value={form.department} onChange={handleChange}>
            <option value="">Select Department</option>
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </StyledSelect>

          <StyledSelect name="designation" value={form.designation} onChange={handleChange}>
            <option value="">Select Designation</option>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Professor">Professor</option>
          </StyledSelect>

          <StyledInput name="googleScholar" value={form.googleScholar} onChange={handleChange} placeholder="Google Scholar Link" />
          <StyledInput name="vidwanId" value={form.vidwanId} onChange={handleChange} placeholder="Vidwan ID" />
          <StyledInput name="scopusId" value={form.scopusId} onChange={handleChange} placeholder="Scopus ID" />

          <h4 style={{ color: "#0f2333", marginBottom: 8, fontWeight: 500 }}>Choose Profile Photo</h4>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setProfileImage(event.target.files?.[0] || null)}
            style={{ width: "100%", marginBottom: 18, color: "white" }}
          />

          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <HoverButton onClick={handleRegister}>{loading ? "Submitting..." : "Register"}</HoverButton>
          </div>

          <p style={{ marginTop: 20, textAlign: "center", color: "#0f2333", fontSize: 14 }}>
            Already have an account?{" "}
            <span style={{ color: "#8b5cf6", cursor: "pointer" }} onClick={() => setPage("login")}>
              Login
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

function StyledInput(props) {
  const [focus, setFocus] = useState(false);

  return (
    <input
      {...props}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: "100%",
        padding: "12px 14px",
        marginBottom: "18px",
        borderRadius: "12px",
        border: focus ? "2px solid #8b5cf6" : "1px solid rgba(255,255,255,0.4)",
        outline: "none",
        background: "rgba(255,255,255,0.9)",
        boxShadow: focus ? "0 0 12px rgba(139,92,246,0.6)" : "none",
        transition: "all 0.3s ease",
        fontSize: 14,
        color: "black",
      }}
    />
  );
}

function StyledSelect({ children, value, ...props }) {
  const [focus, setFocus] = useState(false);

  return (
    <select
      {...props}
      value={value}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: "100%",
        padding: "12px 14px",
        marginBottom: "18px",
        borderRadius: "12px",
        border: focus ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.4)",
        outline: "none",
        background: "rgba(255,255,255,0.9)",
        boxShadow: focus ? "0 0 12px rgba(99,102,241,0.6)" : "none",
        transition: "all 0.3s ease",
        fontSize: 14,
        fontWeight: 500,
        color: "black",
      }}
    >
      {children}
    </select>
  );
}

function HoverButton({ children, ...props }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      {...props}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "12px 30px",
        background: hover ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
        color: hover ? "white" : "#0f172a",
        border: "2px solid #8b5cf6",
        borderRadius: "16px",
        cursor: "pointer",
        fontWeight: 500,
        transition: "all 0.3s ease",
        boxShadow: hover ? "0 10px 25px rgba(139,92,246,0.4)" : "0 0 10px rgba(139,92,246,0.3)",
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      {children}
    </button>
  );
}

export default Register;
