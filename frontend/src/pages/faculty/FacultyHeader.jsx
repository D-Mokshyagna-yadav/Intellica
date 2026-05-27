import collegeLogo from "../../assets/logo-mic.png";

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

      <div style={logoWrapper}>
        <img src={collegeLogo} alt="College Logo" style={logoStyle} />
      </div>

    </div>
  );
}

export default FacultyHeader;

/* ================= STYLES ================= */

const header = {
  height: 80,
  paddingLeft: "40px",      // 🔥 Only left padding
  background: "linear-gradient(90deg, #2563eb, #7c3aed)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "white",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
};

const welcomeText = {
  margin: 0,
  fontSize: 22,
  fontWeight: 700,
};

const subText = {
  margin: 0,
  fontSize: 14,
  opacity: 0.9,
};

const logoWrapper = {
  position: "absolute",
  right: 0,                // 🔥 Stick to extreme right
  top: "50%",
  transform: "translateY(-50%)",
  background: "white",
  padding: "8px 20px",
  borderTopLeftRadius: 12,
  borderBottomLeftRadius: 12,
  boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
};

const logoStyle = {
  height: 45,
  width: "auto",
};