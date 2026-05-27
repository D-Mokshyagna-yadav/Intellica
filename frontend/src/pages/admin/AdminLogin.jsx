import { useState } from "react";
import { useResponsive } from "../../hooks/useResponsive";
import "../../styles/responsiveDashboard.css";
import API_BASE from "../../api";
import collegeImg from "../../assets/college_logo.png";

function AdminLogin({ setPage }) {

  const responsive = useResponsive();
  const [adminId, setAdminId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleSendOTP = async () => {

    if (!adminId) {
      alert("Please enter Admin ID");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier: adminId,
          role: "ADMIN"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to send OTP");
        return;
      }

      setShowOtpModal(true);
      setOtpSent(true);

    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {

    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier: adminId,
          role: "ADMIN",
          otp: otp
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "OTP verification failed");
        return;
      }

      /* =========================
         STORE TOKEN
      ========================= */

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      /* ================= SHOW VERIFIED MODAL ================= */
      setOtpVerified(true);
      setShowOtpModal(true); // Ensure modal stays visible

      /* ================= REDIRECT AFTER DELAY ================= */
      setTimeout(() => {
        setPage("admin-dashboard");
      }, 2000); // Increased to 2 seconds to ensure modal is visible

    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== Background ===== */}
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

      {/* ===== Top Bar ===== */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          padding: "25px 60px",
          display: "flex",
          justifyContent: "flex-end",
          zIndex: 5,
        }}
      >
        <HoverButton onClick={() => setPage("login")}>
          Back
        </HoverButton>
      </div>

      {/* ===== Login Card ===== */}
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={glassCard}>

          <h3 style={titleStyle}>Admin Login</h3>

          <StyledInput
            type="text"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            placeholder="Admin ID"
            disabled={otpSent}
          />

          {otpSent && (
            <div style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={otp[index] || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const newOtp = otp.split("");
                      newOtp[index] = value;
                      setOtp(newOtp.join(""));

                      // Auto-focus next input
                      if (value && index < 5) {
                        const nextInput = e.target.nextElementSibling;
                        if (nextInput) nextInput.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && index > 0) {
                        const prevInput = e.target.previousElementSibling;
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "12px",
                      border: "2px solid rgba(255,255,255,0.4)",
                      outline: "none",
                      background: "rgba(255,255,255,0.9)",
                      textAlign: "center",
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#333",
                      transition: "all 0.3s ease",
                      boxShadow: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "2px solid #8b5cf6";
                      e.target.style.boxShadow = "0 0 12px rgba(139,92,246,0.6)";
                      e.target.style.transform = "scale(1.05)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "2px solid rgba(255,255,255,0.4)";
                      e.target.style.boxShadow = "none";
                      e.target.style.transform = "scale(1)";
                    }}
                  />
                ))}
              </div>
              <div style={{ textAlign: "center", color: "white", fontSize: "14px", opacity: 0.8 }}>
                Enter the 6-digit code sent to your email
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <HoverButton onClick={otpSent ? handleVerifyOTP : handleSendOTP}>
              {loading ? "Processing..." : otpSent ? "Verify OTP" : "Send OTP"}
            </HoverButton>
          </div>

          {otpSent && (
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8b5cf6",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Change Admin ID
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ===== OTP Sent Modal ===== */}
      {showOtpModal && !otpVerified && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(5px)",
              zIndex: 100,
            }}
            onClick={() => setShowOtpModal(false)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: "40px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              zIndex: 101,
              textAlign: "center",
              minWidth: "350px",
              maxWidth: "400px",
            }}
          >
            <h2 style={{ color: "#333", marginBottom: "15px", fontSize: "24px" }}>
              ✓ OTP Sent Successfully
            </h2>
            <p style={{ color: "#666", marginBottom: "30px", lineHeight: "1.6", fontSize: "16px" }}>
              OTP has been sent to your verified email. <br />
              <strong>Please check your inbox</strong> and enter the 6-digit code below.
            </p>

            <button
              onClick={() => setShowOtpModal(false)}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                border: "2px solid transparent",
                color: "white",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                transition: "all 0.3s ease",
                marginTop: "15px",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 5px 15px rgba(139,92,246,0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "none";
                e.target.style.boxShadow = "none";
              }}
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* ===== OTP Verified Modal ===== */}
      {showOtpModal && otpVerified && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(5px)",
              zIndex: 100,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: "40px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              zIndex: 101,
              textAlign: "center",
              minWidth: "350px",
              maxWidth: "400px",
            }}
          >
            <h2 style={{ color: "#333", marginBottom: "15px", fontSize: "24px" }}>
              ✓ OTP Verified
            </h2>
            <div style={{ fontSize: "60px", marginBottom: "20px", color: "#22c55e" }}>
              ✓
            </div>
            <p style={{ color: "#666", marginBottom: "30px", lineHeight: "1.6", fontSize: "16px" }}>
              Your OTP has been verified successfully. <br />
              <strong>Redirecting to dashboard...</strong>
            </p>

            <button
              onClick={() => {
                setShowOtpModal(false);
                setOtpVerified(false);
              }}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                border: "2px solid transparent",
                color: "white",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                transition: "all 0.3s ease",
                marginTop: "15px",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 5px 15px rgba(139,92,246,0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "none";
                e.target.style.boxShadow = "none";
              }}
            >
              Close
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default AdminLogin;


/* ================= STYLES ================= */

const glassCard = {
  width: "380px",
  padding: "40px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.25)",
  boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
  display: "flex",
  flexDirection: "column",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "25px",
  color: "white",
};

function StyledInput({ ...props }) {

  const [focus, setFocus] = useState(false);

  return (
    <input
      {...props}
      required
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: "100%",
        padding: "12px 14px",
        marginBottom: "18px",
        borderRadius: "12px",
        border: focus
          ? "2px solid #8b5cf6"
          : "1px solid rgba(255,255,255,0.4)",
        outline: "none",
        background: "rgba(255,255,255,0.9)",
        boxShadow: focus
          ? "0 0 12px rgba(139,92,246,0.6)"
          : "none",
        transition: "all 0.3s ease",
        fontSize: "14px",
      }}
    />
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
        color: "black",
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