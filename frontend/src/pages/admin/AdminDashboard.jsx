import { useState, useEffect } from "react";
import { useResponsive } from "../../hooks/useResponsive";
import "../../styles/responsiveDashboard.css";

import AdminHome from "./sections/AdminHome";
import FacultyList from "./sections/FacultyList";
import HodList from "./sections/HodList";
import ApproveHodUploads from "./sections/ApproveHodUploads";
import DepartmentAnalytics from "./sections/DepartmentAnalytics";
import CreditConfig from "./sections/credit-config/CreditConfig";
import AdminHeader from "./sections/AdminHeader";


function AdminDashboard({ setPage }) {

const responsive = useResponsive();

// ✅ ADD THIS (missing line)
const [view,setView] = useState("home");

const [isSidebarOpen, setIsSidebarOpen] = useState(true);

useEffect(() => {
  if(view === "faculty"){
    setIsSidebarOpen(false);
  } else {
    setIsSidebarOpen(true);
  }
}, [view]);

/* LOGOUT */

const handleLogout = () => {
  localStorage.clear();
  window.location.href = "/";
};

return (

<div style={container}>

{/* HEADER */}

<div style={{display:"flex", alignItems:"center"}}>
  <button
    onClick={()=>setIsSidebarOpen(!isSidebarOpen)}
    style={{
      marginLeft:20,
      marginRight:10,
      fontSize:20,
      cursor:"pointer",
      background:"none",
      border:"none"
    }}
  >
    ☰
  </button>

  <AdminHeader />
</div>

<div style={{display:"flex"}}>

{/* SIDEBAR */}

{isSidebarOpen && (
  <div style={sidebar}>
{/* MENU */}

<div>

{menuItems.map((item)=>(

<div
key={item.key}
onClick={()=>setView(item.key)}
style={{
...menuItem,
background:view === item.key ? "rgba(255,255,255,0.4)" : "transparent",
borderLeft:view === item.key ? "3px solid #4f46e5" : "none",
fontWeight:view === item.key ? "600" : "normal"
}}
onMouseEnter={(e)=>{
if(view !== item.key){
e.currentTarget.style.background = "#e5e7eb";
}
}}
onMouseLeave={(e)=>{
if(view !== item.key){
e.currentTarget.style.background = "transparent";
}
}}
>

{item.label}

</div>

))}

</div>


{/* LOGOUT BUTTON */}

<div
onClick={handleLogout}
style={logoutBtn}
>
Logout
</div>

 </div>
  )}

{/* CONTENT */}

<div style={content}>

{view === "home" && (
<AdminHome setView={setView} />
)}

{view === "faculty" && <FacultyList />}
{view === "hod" && <HodList />}
{view === "approve" && <ApproveHodUploads />}
{view === "analytics" && <DepartmentAnalytics />}
{view === "credit" && <CreditConfig />}


</div>

</div>

</div>

);

}

export default AdminDashboard;


/* ================= MENU ================= */

const menuItems = [
{ key:"home", label:"Dashboard"},
{ key:"faculty", label:"Faculty & HOD Profiles"},
{ key:"hod", label:"Approve HOD Accounts"},
{ key:"approve", label:"Approve HOD Uploads"},
{ key:"analytics", label:"Department Analytics"},
{ key:"credit", label:"Credit Config"},
];

/* ================= STYLES ================= */

const container={
minHeight:"100vh",
background:"linear-gradient(180deg,#c7d2fe 0%,#e9d5ff 100%)",
paddingTop:"100px"
};
const header={
height:70,
background:"#ffffff",
display:"flex",
alignItems:"center",
padding:"0 30px",
fontWeight:"bold",
fontSize:20,
boxShadow:"0 2px 6px rgba(0,0,0,0.08)"
};

const sidebar={
width:260,
padding:"30px 20px",
borderRight:"1px solid rgba(0,0,0,0.08)",
display:"flex",
flexDirection:"column",
justifyContent:"space-between",
background:"transparent"
};

const menuItem={
marginBottom:10,
padding:"8px 10px",
cursor:"pointer",
borderRadius:6,
transition:"all 0.2s ease"
};
const logoutBtn={
padding:"10px 14px",
background:"#ef4444",
color:"white",
borderRadius:8,
cursor:"pointer",
textAlign:"center",
fontWeight:600
};

const content={
flex:1,
padding:30
};