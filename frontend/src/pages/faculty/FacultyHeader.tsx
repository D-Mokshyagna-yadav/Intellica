import collegeLogo from "../../assets/logo-mic.png";
import NotificationBell from "../../components/NotificationBell";

function FacultyHeader({ user, readOnly }) {

  const name = user?.name || "";
  const department = user?.department || "";

  return (
    <div style={header}>

      <div>
        <h2 style={welcomeText}>
          {readOnly
            ? `${name} Dashboard`
            : `Welcome${name ? `, ${name}` : ""}`}
        </h2>

        <p style={subText}>
          Faculty • {department}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {!readOnly && <NotificationBell />}
        <div style={logoWrapper}>
        <img src={collegeLogo} alt="College Logo" style={logoStyle} />
        </div>
      </div>

    </div>
  );
}

export default FacultyHeader;

/* ================= STYLES ================= */

const header = {
  height: 80,
  paddingLeft: "32px",
  paddingRight: "32px",
  background: "linear-gradient(90deg, #ffffff 0%, #eff6ff 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "#0f172a",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  borderBottom: "1px solid #e2e8f0",
};

const welcomeText = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: "#0f172a",
};

const subText = {
  margin: 0,
  fontSize: 14,
  color: "#64748b",
};

const logoWrapper = {
  background: "#fff",
  padding: "8px 16px",
  borderRadius: 999,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
};

const logoStyle = {
  height: 45,
  width: "auto",
};
