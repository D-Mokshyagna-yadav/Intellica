import collegeLogo from "../../../assets/logo-mic.png";

function AdminHeader() {

  return (
    <div style={header}>

      <div style={textCenter}>
        <p style={welcomeText}>
          Welcome, Admin
        </p>
      </div>

      <div style={logoWrapper}>
        <img src={collegeLogo} alt="College Logo" style={logoStyle} />
      </div>

    </div>
  );
}

export default AdminHeader;


/* ================= STYLES ================= */

const header = {
  height: 80,
  paddingLeft: "40px",
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
  fontSize: 24,
  fontWeight: 600,
};

const logoWrapper = {
  position: "absolute",
  right: 0,
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

const textCenter = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  textAlign: "center"
};