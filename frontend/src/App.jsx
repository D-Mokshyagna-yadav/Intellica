import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import HodDashboard from "./pages/hod/HodDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {

  const [page, setPage] = useState("login");
  const [error, setError] = useState(null);

  console.log("🟢 App component loaded, current page:", page);

  /* ✅ RESTORE SESSION ON REFRESH */
  useEffect(() => {
  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role");

    console.log("🟡 Checking stored token & role:", token, role);

    if (token && role) {
      if (role === "ADMIN") {
        setPage("admin-dashboard");
      } else if (role === "HOD") {
        setPage("hod");
      } else if (role === "FACULTY") {
        setPage("faculty");
      }
    } else {
      setPage("login");
    }

  } catch (err) {
    console.error("🔴 Error in useEffect:", err);
    setError(err.message);
  }
}, []);

  if (error) {
    return <div style={{ color: "red", fontSize: "20px", padding: "20px" }}>Error: {error}</div>;
  }

  return (
    <>
      {page === "login" && <Login setPage={setPage} />}
      {page === "register" && <Register setPage={setPage} />}
      {page === "faculty" && <FacultyDashboard setPage={setPage} />}
      {page === "hod" && <HodDashboard setPage={setPage} />}
      {page === "admin-dashboard" && <AdminDashboard setPage={setPage} />}
    </>
  );
}

export default App;