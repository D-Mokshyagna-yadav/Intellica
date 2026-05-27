import { useEffect, useState } from "react";
import { useResponsive } from "../../../hooks/useResponsive";
import "../../../styles/responsiveDashboard.css";

export default function AdminHome({ setView }) {

const responsive = useResponsive();

const [stats,setStats] = useState({
departments:0,
faculties:0,
pendingUploads:0
});

const [topDepartments,setTopDepartments] = useState([]);
const [activityStats,setActivityStats] = useState([]);

const token = localStorage.getItem("token");

/* ================= FETCH DASHBOARD DATA ================= */

useEffect(()=>{

const fetchStats = async()=>{

try{

/* FETCH DEPARTMENTS */

const depRes = await fetch(
  "/api/admin/departments",
{
headers:{ Authorization:`Bearer ${token}` }
}
);

const depData = await depRes.json();

/* FETCH TOP DEPARTMENTS */

const depRankRes = await fetch(
"/api/admin/top-departments",
{
headers:{ Authorization:`Bearer ${token}` }
}
);

const depRankData = await depRankRes.json();
setTopDepartments(depRankData);

/* FETCH ACTIVITY STATS */

const actRes = await fetch(
"/api/admin/activity-stats",
{
headers:{ Authorization:`Bearer ${token}` }
}
);

const actData = await actRes.json();
setActivityStats(actData);

/* FETCH PENDING UPLOADS */

const uploadRes = await fetch(
"/api/admin/pending-uploads",
{
headers:{ Authorization:`Bearer ${token}` }
}
);

const uploadData = await uploadRes.json();

/* FETCH ALL USERS */

const userRes = await fetch(
  "/api/admin/all-users",
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);

const userData = await userRes.json();

/* ✅ FIXED: COUNT FACULTY + HOD CORRECTLY */

const totalFacultyAndHOD = Array.isArray(userData)
  ? userData.filter(
      u => ["FACULTY", "HOD"].includes((u.role || "").toUpperCase())
    ).length
  : 0;

/* ✅ SAFER PENDING COUNT */

const pendingCount = Array.isArray(uploadData)
? uploadData.filter(u => u.status !== "ADMIN_APPROVED").length
: 0;

/* SET DASHBOARD STATS */

setStats({
  departments: 9,
  faculties: totalFacultyAndHOD,
  pendingUploads: pendingCount
});

}catch(err){

console.error(err);

}

};

fetchStats();

},[token]);

/* ================= UI ================= */

return(

<div className="dashboard-container">

<h2 className="dashboard-title" style={{marginBottom:5}}>
Welcome, Admin 👋
</h2>

<p style={{opacity:0.7,fontSize:"14px"}}>
System overview at a glance
</p>

{/* ================= STATS CARDS ================= */}

<div className="summary-row" style={{marginTop:30}}>

<StatCard
title="Departments"
value={stats.departments}
onClick={()=>setView("analytics")}
/>

<StatCard
title="Faculty & HOD"
value={stats.faculties}
onClick={()=>setView("faculty")}
/>

<StatCard
title="Pending Approvals"
value={stats.pendingUploads}
onClick={()=>setView("approve")}
/>

</div>

{/* ================= TOP DEPARTMENTS ================= */}

<h3 style={{marginTop:40,fontSize:responsive.isMobile ? "18px" : "20px"}}>Top Departments (Credits)</h3>

<div style={{marginTop:15}}>

{topDepartments.map((d,i)=>(

<div key={i} className="dept-row">

<span>
{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`} {d.department}
</span>

<span style={{marginLeft:8}}>—</span>

<span style={{marginLeft:8,color:"#000000",fontWeight:600}}>
{d.credits} Credits
</span>

</div>

))}

</div>

{/* ================= MOST POPULAR ACTIVITIES ================= */}

<h3 style={{marginTop:40,fontSize:responsive.isMobile ? "18px" : "20px"}}>Most Popular Activities</h3>

<div style={{marginTop:15}}>

{activityStats.map((a,i)=>{

const max = Math.max(...activityStats.map(x => x.count),1);

return(

<div key={i} className="activity-row">

<span style={{
  width:responsive.isMobile ? "100px" : "140px",
  textTransform:"capitalize",
  fontSize:responsive.isMobile ? "13px" : "14px"
}}>
{a.category}
</span>

<div className="bar-container">

<div
style={{
...barFill,
width:`${(a.count / max) * (responsive.isMobile ? 120 : 220)}px`
}}
></div>

</div>

<span style={{fontSize:"12px",minWidth:"30px"}}>
{a.count}
</span>

</div>

);

})}

</div>

</div>

);

}

/* ================= STAT CARD ================= */

function StatCard({title,value,onClick}){

const [hover,setHover] = useState(false);

return(

<div
className="summary-card"
style={{
...(hover?{background:"#f0f9ff"}:{})
}}
onClick={onClick}
onMouseEnter={()=>setHover(true)}
onMouseLeave={()=>setHover(false)}
>

<p style={{fontSize:14,color:"#555"}}>
{title}
</p>

<h2 style={{fontSize:24,marginTop:10}}>
{value}
</h2>

</div>

);

}

/* ================= STYLES ================= */

const barFill={
height:"100%",
background:"#2563eb",
borderRadius:6
};