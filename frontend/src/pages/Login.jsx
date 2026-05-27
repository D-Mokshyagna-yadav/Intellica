import { useEffect, useMemo, useState } from "react";
import { useResponsive } from "../hooks/useResponsive";
import "../styles/responsiveDashboard.css";
import { apiFetch } from "../api";
import collegeImg from "../assets/college_logo.png";
import { showToast } from "../utils/toast";

function Login({ setPage }) {
  const responsive = useResponsive();
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!otpExpiresAt) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const remainingSeconds = Math.max(0, Math.floor((new Date(otpExpiresAt).getTime() - Date.now()) / 1000));
      setCountdown(remainingSeconds);
      if (remainingSeconds === 0) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [otpExpiresAt]);

  const formattedCountdown = useMemo(() => {
    const minutes = Math.floor(countdown / 60);
    const seconds = String(countdown % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [countdown]);

  const sendOtp = async (isResend = false) => {
    if (!identifier.trim()) {
      showToast({ type: "error", message: "Please fill Employee ID or Email" });
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch(isResend ? "/auth/resend-otp" : "/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      setOtpSent(true);
      setOtp("");
      setOtpExpiresAt(data.expiresAt);
      showToast({ type: "success", message: data.message || "OTP sent successfully" });
    } catch (error) {
      showToast({ type: "error", message: error.message || "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      showToast({ type: "error", message: "Please enter the 6-digit OTP" });
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp,
        }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user_role", data.role);
      localStorage.setItem("user_name", data.name || "");
      localStorage.setItem("user_department", data.department || "");
      localStorage.setItem("user_designation", data.designation || "");
      localStorage.setItem("userId", data.id || "");

      showToast({ type: "success", message: "OTP verified successfully" });
      setTimeout(() => {
        if (data.role === "ADMIN") setPage("admin-dashboard");
        else if (data.role === "HOD") setPage("hod");
        else setPage("faculty");
      }, 500);
    } catch (error) {
      if (error.message?.toLowerCase().includes("expired")) {
        setOtpSent(false);
        setOtp("");
      }
      showToast({ type: "error", message: error.message || "OTP verification failed" });
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

      <div className="top-right-actions" style={{ display: "flex", gap: 12 }}>
        <HoverButton onClick={() => setPage("leaderboard")}>Leaderboard</HoverButton>
        <HoverButton onClick={() => setPage("register")}>Register</HoverButton>
      </div>

      <div className="responsive-center">
        <form onSubmit={otpSent ? handleVerifyOtp : (event) => { event.preventDefault(); sendOtp(false); }} className="glass-card responsive-card">
          <StyledInput
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Employee ID or Email"
            disabled={otpSent}
          />

          {otpSent && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <OtpInput key={index} index={index} otp={otp} setOtp={setOtp} />
                ))}
              </div>
              <div style={{ textAlign: "center", color: "white", fontSize: 14, opacity: 0.92 }}>
                OTP expires in {formattedCountdown}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <HoverButton type="submit">{loading ? "Processing..." : otpSent ? "Verify OTP" : "Send OTP"}</HoverButton>
          </div>

          {otpSent && (
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
              <TextButton type="button" onClick={() => { setOtpSent(false); setOtp(""); setOtpExpiresAt(null); }}>
                Change details
              </TextButton>
              <TextButton type="button" onClick={() => sendOtp(true)} disabled={loading || countdown > 0}>
                {countdown > 0 ? `Resend in ${formattedCountdown}` : "Resend OTP"}
              </TextButton>
            </div>
          )}
        </form>
      </div>
    </>
  );
}

function OtpInput({ index, otp, setOtp }) {
  return (
    <input
      type="text"
      maxLength="1"
      value={otp[index] || ""}
      onChange={(event) => {
        const value = event.target.value.replace(/\D/g, "");
        const nextOtp = otp.split("");
        nextOtp[index] = value;
        setOtp(nextOtp.join(""));
        if (value && index < 5) {
          event.target.nextElementSibling?.focus();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Backspace" && !otp[index] && index > 0) {
          event.target.previousElementSibling?.focus();
        }
      }}
      style={otpInputStyle}
    />
  );
}

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
        border: focus ? "2px solid #8b5cf6" : "1px solid rgba(255,255,255,0.4)",
        outline: "none",
        background: "rgba(255,255,255,0.9)",
        boxShadow: focus ? "0 0 12px rgba(139,92,246,0.6)" : "none",
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
        borderRadius: "8px",
        fontWeight: 600,
        cursor: "pointer",
        border: "2px solid transparent",
        color: hover ? "white" : "black",
        background: hover
          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
          : "linear-gradient(white, white) padding-box, linear-gradient(135deg, #6366f1, #8b5cf6) border-box",
        transition: "all 0.3s ease",
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function TextButton({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: "none",
        border: "none",
        color: "#d8b4fe",
        textDecoration: "underline",
        cursor: props.disabled ? "not-allowed" : "pointer",
        fontSize: 14,
        opacity: props.disabled ? 0.65 : 1,
      }}
    >
      {children}
    </button>
  );
}

const otpInputStyle = {
  width: 45,
  height: 45,
  borderRadius: 12,
  border: "2px solid rgba(255,255,255,0.4)",
  outline: "none",
  background: "rgba(255,255,255,0.9)",
  textAlign: "center",
  fontSize: 20,
  fontWeight: 600,
  color: "#333",
};

export default Login;
