import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import HodDashboard from "./pages/hod/HodDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Leaderboard from "./pages/Leaderboard";
import ToastViewport from "./components/ToastViewport";

const PATH_TO_PAGE = {
  "/": "login",
  "/register": "register",
  "/faculty": "faculty",
  "/hod": "hod",
  "/admin": "admin-dashboard",
  "/leaderboard": "leaderboard",
};

const PAGE_TO_PATH = {
  login: "/",
  register: "/register",
  faculty: "/faculty",
  hod: "/hod",
  "admin-dashboard": "/admin",
  leaderboard: "/leaderboard",
};

function getAuthenticatedLandingPage() {
  const role = localStorage.getItem("user_role");
  if (role === "ADMIN") return "admin-dashboard";
  if (role === "HOD") return "hod";
  if (role === "FACULTY") return "faculty";
  return "login";
}

function resolvePageFromPath(pathname) {
  return PATH_TO_PAGE[pathname] || "login";
}

function App() {
  const [page, setPageState] = useState(resolvePageFromPath(window.location.pathname));

  useEffect(() => {
    const syncPageWithLocation = () => {
      const currentPage = resolvePageFromPath(window.location.pathname);
      if (currentPage === "login" && localStorage.getItem("token") && window.location.pathname === "/") {
        setPageState(getAuthenticatedLandingPage());
        return;
      }

      if (!localStorage.getItem("token") && ["faculty", "hod", "admin-dashboard"].includes(currentPage)) {
        setPageState("login");
        window.history.replaceState({}, "", "/");
        return;
      }

      setPageState(currentPage);
    };

    syncPageWithLocation();
    window.addEventListener("popstate", syncPageWithLocation);
    return () => window.removeEventListener("popstate", syncPageWithLocation);
  }, []);

  const setPage = (nextPage, options = {}) => {
    const path = PAGE_TO_PATH[nextPage] || "/";
    const method = options.replace ? "replaceState" : "pushState";
    window.history[method]({}, "", path);
    setPageState(nextPage);
  };

  const currentPage = page === "login" && localStorage.getItem("token") ? getAuthenticatedLandingPage() : page;

  return (
    <>
      {currentPage === "login" && <Login setPage={setPage} />}
      {currentPage === "register" && <Register setPage={setPage} />}
      {currentPage === "faculty" && <FacultyDashboard setPage={setPage} />}
      {currentPage === "hod" && <HodDashboard setPage={setPage} />}
      {currentPage === "admin-dashboard" && <AdminDashboard setPage={setPage} />}
      {currentPage === "leaderboard" && <Leaderboard setPage={setPage} />}
      <ToastViewport />
    </>
  );
}

export default App;
