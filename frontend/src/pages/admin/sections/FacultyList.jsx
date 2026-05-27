import { useEffect, useState } from "react";
import API_BASE from "../../../api";

import FacultyDashboard from "../../faculty/FacultyDashboard";
import HodDashboard from "../../hod/HodDashboard";

export default function FacultyList() {

const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [search,setSearch] = useState("");
const [selectedDept, setSelectedDept] = useState(null);
const departments = ["CIVIL","EEE","MECH","ECE","CSE","IT","AIML","AIDS","DIPLOMA"];
const departmentUsers = users.filter(
u => u.department?.toUpperCase() === selectedDept
);
/* ================= DEPARTMENT ANALYTICS ================= */

const totalFaculty = departmentUsers.filter(
u => u.role === "FACULTY" || u.role === "HOD"
).length;
const [analytics,setAnalytics] = useState(null);
/* placeholder values until credits API is connected */



useEffect(() => {
fetchUsers();
}, []);

const fetchUsers = async () => {


try {

  const res = await fetch(`${API_BASE}/admin/all-users`,{
    headers:{
      Authorization:`Bearer ${localStorage.getItem("token")}`
    }
  });

  const data = await res.json();
  setUsers(data);

} catch(err) {
  console.error("Failed to fetch users",err);
}


};

useEffect(()=>{

if(!selectedDept) return;

fetch(`${API_BASE}/admin/department-analytics/${selectedDept}`,{
headers:{
Authorization:`Bearer ${localStorage.getItem("token")}`
}
})
.then(res=>res.json())
.then(data=>setAnalytics(data))
.catch(console.error);

},[selectedDept]);

const deleteUser = async (userId) => {

  if(selectedUser){
    alert("Go back to user list before deleting");
    return;
  }

  const confirmDelete = window.confirm("Are you sure you want to remove this user?");
  if(!confirmDelete) return;

  try{
    const res = await fetch(`${API_BASE}/admin/delete-user/${userId}`,{
      method:"DELETE",
      headers:{
        Authorization:`Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();

    if(res.ok){
      alert("User removed successfully");
      fetchUsers(); // refresh list
    }else{
      alert(data.message || "Delete failed");
    }

  }catch(err){
    console.error(err);
    alert("Server error while deleting user");
  }

};


const changeDepartment = async (userId,currentDept)=>{

const newDept = prompt(
`Enter new department (Current: ${currentDept})\nExample: CSE, ECE, MECH, CIVIL, EEE, IT`
);

if(!newDept) return;

try{

const res = await fetch(`${API_BASE}/admin/change-department/${userId}`,{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${localStorage.getItem("token")}`
},
body:JSON.stringify({ department:newDept })
});

const data = await res.json();

if(res.ok){
alert("Department updated successfully");
fetchUsers();
}else{
alert(data.message || "Update failed");
}

}catch(err){
console.error(err);
alert("Server error");
}

};

/* ================= OPEN DASHBOARD ================= */

if(selectedUser){


return(
  <div>

    <button
      onClick={()=>setSelectedUser(null)}
      style={backBtn}
    >
      ← Back
    </button>

    <div style={adminMode}>
      ADMIN READ ONLY MODE
    </div>

    {selectedUser.role === "FACULTY" && (
      <FacultyDashboard
  readOnly={true}
  facultyId={selectedUser._id}
/>
    )}

   {selectedUser.role === "HOD" && (
  <HodDashboard
    readOnly={true}
    hodUser={selectedUser}
  />
)}

  </div>
);


}

/* ================= SEARCH ================= */

const filteredUsers = (selectedDept ? departmentUsers : users).filter((u)=>
u.name?.toLowerCase().includes(search.toLowerCase()) ||
u.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
u.department?.toLowerCase().includes(search.toLowerCase()) ||
u.role?.toLowerCase().includes(search.toLowerCase())
);
/* ================= TABLE ================= */

return(


<div style={pageContainer}>

  <div style={headerSection}>

    <h1 style={title}>Faculty & HOD Profiles</h1>

    <p style={subtitle}>
      Admin view — All Departments
    </p>

    <input
      type="text"
      placeholder="Search by Name, Employee ID, Department..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
      style={searchInput}
    />
    {/* ================= DEPARTMENT CARDS ================= */}

<div style={deptGrid}>

{departments.map(dep => (

<div
key={dep}
style={{
...deptCard,
background: selectedDept === dep ? "#4f46e5" : "white",
color: selectedDept === dep ? "white" : "#1e293b"
}}
onClick={()=>setSelectedDept(dep)}
>

{dep}

</div>

))}

</div>
  </div>
  {selectedDept && (

<div style={analyticsBox}>

<h2 style={{marginBottom:15}}>
{selectedDept} Department
</h2>

<div style={analyticsGrid}>

<div style={analyticsCard}>
<h3>Total Faculty</h3>
<p>{totalFaculty}</p>
</div>


<div style={analyticsCard}>
<h3>Total Credits</h3>
<p>{analytics?.totalCredits || 0}</p>
</div>

<div style={analyticsCard}>
<h3>Total Activities</h3>
<p>{analytics?.totalActivities || 0}</p>
</div>

</div>


</div>

)}
  <div style={{overflowX:"auto"}}>
    {selectedDept && (

<button
style={backDeptBtn}
onClick={()=>setSelectedDept(null)}
>

← Back to Departments

</button>

)}

    <table style={table}>

      <thead>

        <tr>
          <th style={th}>Employee ID</th>
          <th style={th}>Name</th>
          <th style={th}>Department</th>
          <th style={th}>Role</th>
          <th style={{...th,textAlign:"center"}}>Action</th>
          <th style={{...th,textAlign:"center"}}>Change Dept</th>
        <th style={{...th,textAlign:"center"}}>Remove</th>
        </tr>

      </thead>

      <tbody>

        {[...filteredUsers]
  .sort((a, b) => {
    const roleA = (a.role || "").toUpperCase();
    const roleB = (b.role || "").toUpperCase();

    // HOD comes first
    if (roleA === "HOD" && roleB !== "HOD") return -1;
    if (roleB === "HOD" && roleA !== "HOD") return 1;

    return 0;
  })
  .map(user => (
          <HoverRow
  key={user._id}
  style={
    (user.role || "").toUpperCase() === "HOD"
      ? hodRowStyle
      : {}
  }
>

            <td style={td}>{user.employeeId}</td>
            <td style={td}>{user.name}</td>
            <td style={td}>{user.department}</td>
            <td
  style={{
    ...td,
    color: (user.role || "").toUpperCase() === "HOD" ? "#b45309" : td.color,
    fontWeight: (user.role || "").toUpperCase() === "HOD" ? "600" : "normal"
  }}
>
  {(user.role || "").toUpperCase() === "HOD"
    ? "HOD ⭐"
    : user.role}
</td>

           <td style={{...td,textAlign:"center"}}>

                <HoverButton
                  style={viewBtn}
                  onClick={()=>setSelectedUser(user)}
                >
                  View Dashboard
                </HoverButton>

              </td>
              <td style={{...td,textAlign:"center"}}>

                    <HoverButton
                    style={deptBtn}
                    onClick={()=>changeDepartment(user._id,user.department)}
                    >
                    Change
                    </HoverButton>

                    </td>
              <td style={{...td,textAlign:"center"}}>

                <HoverButton
                  style={{
                    ...deleteBtn,
                    opacity: user.role === "ADMIN" ? 0.5 : 1,
                    cursor: user.role === "ADMIN" ? "not-allowed" : "pointer"
                  }}
                  disabled={user.role === "ADMIN"}
                  onClick={()=>deleteUser(user._id)}
                >
                  Remove
                </HoverButton>

              </td>

          </HoverRow>
        ))}

      </tbody>
      

    </table>

  </div>

</div>


);

}

/* ================= HOVER ROW ================= */

function HoverRow({children, style = {}}){
const [hover,setHover] = useState(false);

return(
<tr
style={{
...style,
backgroundColor:hover ? "#f1f5f9":"white",
transition:"background 0.2s ease"
}}
onMouseEnter={()=>setHover(true)}
onMouseLeave={()=>setHover(false)}
>
{children}
</tr>
);

}
/* ================= HOVER BUTTON ================= */

function HoverButton({children,style,...props}){

const [hover,setHover] = useState(false);

return(
<button
{...props}
style={{
...style,
transform:hover ? "translateY(-2px)":"none",
boxShadow:hover
? "0 6px 14px rgba(0,0,0,0.15)"
:"none",
transition:"all 0.2s ease"
}}
onMouseEnter={()=>setHover(true)}
onMouseLeave={()=>setHover(false)}
>
{children}
</button>
);

}

/* ================= STYLES ================= */

const pageContainer={
width:"100%"
};

const headerSection={
marginBottom:35
};

const title={
fontSize:26,
fontWeight:700,
color:"#0F172A"
};

const subtitle={
fontSize:14,
color:"#334155",
marginTop:6
};

const searchInput={
marginTop:18,
padding:"10px 14px",
width:"320px",
borderRadius:8,
border:"1px solid #cbd5e1",
fontSize:14
};

const table={
width:"100%",
borderCollapse:"collapse",
backgroundColor:"white",
borderRadius:12,
overflow:"hidden",
boxShadow:"0 6px 18px rgba(0,0,0,0.06)"
};

const th={
padding:"16px 18px",
backgroundColor:"#f8fafc",
borderBottom:"1px solid #e2e8f0",
fontWeight:600,
fontSize:14,
color:"#1e293b",
textAlign:"left"
};

const td={
padding:"16px 18px",
borderBottom:"1px solid #e2e8f0",
fontSize:14,
color:"#1e293b"
};

const viewBtn={
padding:"7px 16px",
backgroundColor:"#4f46e5",
color:"white",
border:"none",
borderRadius:8,
cursor:"pointer",
fontSize:13,
fontWeight:500,
transition:"all 0.2s ease"
};

const backBtn={
marginBottom:15,
padding:"8px 14px",
background:"#64748b",
color:"white",
border:"none",
borderRadius:6,
cursor:"pointer",
transition:"all 0.2s ease"
};

const adminMode={
color:"red",
fontWeight:600,
marginBottom:10
};
const deleteBtn={
padding:"7px 16px",
backgroundColor:"#ef4444",
color:"white",
border:"none",
borderRadius:8,
cursor:"pointer",
fontSize:13,
fontWeight:500,
transition:"all 0.2s ease"
};
const deptBtn={
padding:"7px 16px",
backgroundColor:"#0ea5e9",
color:"white",
border:"none",
borderRadius:8,
cursor:"pointer",
fontSize:13,
fontWeight:500,
transition:"all 0.2s ease"
};
const deptGrid = {
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",
gap:15,
marginTop:20,
marginBottom:30
};

const deptCard = {
padding:"18px",
borderRadius:10,
background:"white",
border:"1px solid #e2e8f0",
fontWeight:600,
textAlign:"center",
cursor:"pointer",
boxShadow:"0 4px 10px rgba(0,0,0,0.05)",
transition:"all 0.2s ease"
};

const backDeptBtn = {
marginBottom:15,
padding:"8px 14px",
background:"#0ea5e9",
color:"white",
border:"none",
borderRadius:6,
cursor:"pointer"
};
const analyticsBox = {
background:"white",
padding:20,
borderRadius:10,
marginBottom:20,
boxShadow:"0 4px 10px rgba(0,0,0,0.05)"
};

const analyticsGrid = {
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",
gap:15,
marginBottom:20
};

const analyticsCard = {
background:"#f8fafc",
padding:15,
borderRadius:8,
textAlign:"center",
fontWeight:600
};
const hodRowStyle = {
  background: "#fef3c7", // light yellow
  fontWeight: 600,
  borderLeft: "4px solid #f59e0b"
};