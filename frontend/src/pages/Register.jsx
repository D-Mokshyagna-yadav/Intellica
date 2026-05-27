import { useState } from "react";
import { useResponsive } from "../hooks/useResponsive";
import "../styles/responsiveDashboard.css";
import collegeImg from "../assets/college_logo.png";
import API_BASE from "../api";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (
      !form.employeeId ||
      !form.name ||
      !form.email ||
      !form.role ||
      !form.department ||
      !form.designation
    ) {
      alert("All fields are required");
      return;
    }

    if (!profileImage) {
      alert("Profile photo is required");
      return;
    }

    if (!form.googleScholar && !form.vidwanId && !form.scopusId) {
      alert("At least ONE of Google Scholar, Vidwan ID, or Scopus ID must be entered");
      return;
    }

    try {
      const endpoint =
        form.role === "Faculty"
          ? `${API_BASE}/auth/faculty/register`
          : `${API_BASE}/auth/hod/register`;

      const formData = new FormData();
      formData.append("employeeId", form.employeeId);
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("department", form.department);
      formData.append("designation", form.designation);
      formData.append("googleScholar", form.googleScholar);
      formData.append("vidwanId", form.vidwanId);
      formData.append("scopusId", form.scopusId);
      formData.append("profileImage", profileImage);
      

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      // Show success alert and redirect to login
      alert("Registered Successfully. Thank you");
      setPage('login');
    } catch (err) {
      console.error(err);
      alert("Registration failed. Please try again.");
    }
  };

  // No longer needed - using alert instead
  const handleCloseSuccess = () => {
    setPage('login');
  };

  // ===== ALL STYLES DEFINED HERE =====
  const titleStyle = {
    textAlign: "center",
    marginBottom: "25px",
    color: "#0f2333",
  };

  const loginText = {
    marginTop: "20px",
    textAlign: "center",
    color: "#0f2333",
    fontSize: "14px",
  };

  // dynamic box style based on message type
  return (
    <>
      {/* Background */}
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

      {/* ===== Top Left Back Button ===== */}
      <div className="top-left-actions">
        <button
          onClick={() => setPage("login")}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            border: "2px solid transparent",
            color: "white",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            fontSize: "14px",
          }}
        >
          ← Back to Login
        </button>
      </div>

      {/* Overlay (darken page when notification shown) - HIDDEN */}
      {/* Removed overlay for simpler pop-up */}

      <div className="responsive-center">
        <div className="glass-card responsive-card">
          <h2 style={titleStyle}>Faculty / HOD Registration</h2>

          <StyledInput name="employeeId" value={form.employeeId} onChange={handleChange} placeholder="Employee ID" />
          <StyledInput name="name" value={form.name} onChange={handleChange} placeholder="Name" />
          
          {/* Professional Email Input */}
          <div style={{ position: "relative", marginBottom: "18px" }}>
            <div style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666",
              fontSize: "16px",
              zIndex: 1,
              pointerEvents: "none"
            }}>
              ✉
            </div>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              style={{
                width: "100%",
                padding: "12px 14px 12px 40px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.4)",
                outline: "none",
                background: "rgba(255,255,255,0.9)",
                transition: "all 0.3s ease",
                fontSize: "14px",
                color: "black",
                boxShadow: "none",
              }}
              onFocus={(e) => {
                e.target.style.border = "2px solid #8b5cf6";
                e.target.style.boxShadow = "0 0 12px rgba(139,92,246,0.6)";
                e.target.previousSibling.style.color = "#8b5cf6";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(255,255,255,0.4)";
                e.target.style.boxShadow = "none";
                e.target.previousSibling.style.color = "#666";
              }}
            />
          </div>

          <StyledSelect name="role" value={form.role} onChange={handleChange}>
            <option value="">Select Role</option>
            <option value="Faculty">Faculty</option>
            <option value="HOD">HOD</option>
          </StyledSelect>

          <StyledSelect name="department" value={form.department} onChange={handleChange}>
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="AIML">AIML</option>
            <option value="AIDS">AIDS</option>
            <option value="IT">IT</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
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

          <h4 style={{ color: "#0f2333", marginBottom: "8px", fontWeight: "500" }}>
            Choose Profile Photo
          </h4>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files[0])}
            style={{
              width: "100%",
              marginBottom: "18px",
              color: "white",
            }}
          />

          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <HoverButton onClick={handleRegister}>
              Register
            </HoverButton>
          </div>

          <p style={loginText}>
            Already have an account?{" "}
            <span
              style={{ color: "#8b5cf6", cursor: "pointer" }}
              onClick={() => setPage("login")}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;

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
        fontSize: "14px",
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
        fontSize: "14px",
        fontWeight: "500",
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
        background: hover
          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
          : "transparent",
        color: "white",
        border: "2px solid #8b5cf6",
        borderRadius: "16px",
        cursor: "pointer",
        fontWeight: 500,
        transition: "all 0.3s ease",
        boxShadow: hover
          ? "0 10px 25px rgba(139,92,246,0.4)"
          : "0 0 10px rgba(139,92,246,0.3)",
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      {children}
    </button>
  );
}