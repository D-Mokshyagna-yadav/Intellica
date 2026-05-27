import { useState, useEffect } from "react";

const API_BASE = "/api";   // ✅ central API base

function ApproveHodUploads() {

const [uploads, setUploads] = useState([]);
const [selectedUpload,setSelectedUpload] = useState(null);
const [deptFilter,setDeptFilter] = useState("");
const [categoryFilter,setCategoryFilter] = useState("");
const [empFilter,setEmpFilter] = useState("");
const [nameFilter,setNameFilter] = useState("");

const token = localStorage.getItem("token");

/* ================= FILE URL FIX ================= */

const getFileUrl = (path) => {
  if(!path) return "";
  if(path.startsWith("http")) return path;

  if(!path.startsWith("uploads")){
    return `/uploads/${path}`;   // ✅ fixed
  }

  return `/${path}`;             // ✅ fixed
};

/* ================= FETCH PENDING ================= */

const fetchUploads = async () => {
  try{

    const res = await fetch(
      `${API_BASE}/admin/pending-uploads`,   // ✅ fixed
      {
        headers:{ Authorization:`Bearer ${token}` }
      }
    );

    const data = await res.json();

    if(res.ok){
      setUploads(data);
    }

  }catch(err){
    console.error(err);
  }
};

useEffect(()=>{
  fetchUploads();
},[]);

/* ================= APPROVE ================= */

const approveUpload = async(id)=>{
  try{

    const res = await fetch(
      `${API_BASE}/admin/approve-upload/${id}`,   // ✅ fixed
      {
        method:"POST",
        headers:{ Authorization:`Bearer ${token}` }
      }
    );

    if(res.ok){
      fetchUploads();
    }

  }catch(err){
    console.error(err);
  }
};

/* ================= DISCUSSION ================= */

const callDiscussion = async(id)=>{

  const comment = prompt("Enter discussion comment");
  if(!comment) return;

  try{

    const res = await fetch(
      `${API_BASE}/admin/discussion/${id}`,   // ✅ fixed
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({comment})
      }
    );

    if(res.ok){
      fetchUploads();
    }

  }catch(err){
    console.error(err);
  }
};

/* ================= GET TITLE ================= */

const getTitle = (item) => {

const metadata = item.metadata || {};

return (
item.title ||
metadata.title ||
metadata.paperTitle ||
metadata.conferenceTitle ||
metadata.conferenceName ||
metadata.workshopTitle ||
metadata.fdpTitle ||
metadata.bookTitle ||
metadata.courseName ||
metadata.awardName ||
metadata.policyName ||
metadata.projectTitle ||
metadata.startupName ||
metadata.organization ||
metadata.topic ||
metadata.schemeName ||
metadata.activityTitle ||
metadata.programTitle ||
"-"
);

};

/* ================= GET FACULTY ================= */

const getFaculty = (item)=>{
return item.faculty || item.facultyId || {};
};
const filteredUploads = uploads.filter(item => {

const faculty = getFaculty(item);

/* DEPARTMENT FILTER */

if(deptFilter && (item.department || "").toLowerCase() !== deptFilter.toLowerCase())
return false;

/* CATEGORY FILTER */

if(categoryFilter && (item.category || "").toLowerCase() !== categoryFilter.toLowerCase())
return false;

/* EMPLOYEE ID FILTER */

if(empFilter &&
!(faculty.employeeId || "")
.toLowerCase()
.includes(empFilter.toLowerCase()))
return false;

/* NAME FILTER */

if(nameFilter &&
!(faculty.name || "")
.toLowerCase()
.includes(nameFilter.toLowerCase()))
return false;

return true;

});

/* ================= VIEW DETAILS ================= */

const openDetails = (upload)=>{
setSelectedUpload(upload);
};

/* ================= UI ================= */

return (

<div>

<h2 style={{marginBottom:20}}>Approve HOD Uploads</h2>
<div style={filterBar}>

<input
placeholder="Search Employee ID"
value={empFilter}
onChange={e=>setEmpFilter(e.target.value)}
style={filterInput}
/>

<input
placeholder="Search Name"
value={nameFilter}
onChange={e=>setNameFilter(e.target.value)}
style={filterInput}
/>

<select
value={deptFilter}
onChange={e=>setDeptFilter(e.target.value)}
style={filterInput}
>
<option value="">All Departments</option>
<option value="CSE">CSE</option>
<option value="ECE">ECE</option>
<option value="MECH">MECH</option>
<option value="CIVIL">CIVIL</option>
</select>

<select
value={categoryFilter}
onChange={e=>setCategoryFilter(e.target.value)}
style={filterInput}
>
<option value="">All Categories</option>
<option value="publication">Publication</option>
<option value="conference">Conference</option>
<option value="workshop">Workshop</option>
<option value="fdp">FDP</option>
<option value="book">Book</option>
<option value="nptel">NPTEL</option>
<option value="seminar">Seminar</option>
<option value="webinar">Webinar</option>
<option value="guestlecture">Guest Lecture</option>
<option value="honorsawards">Awards</option>
<option value="certification">Certification</option>
<option value="researchpolicy">Research Policy</option>
<option value="membership">Membership</option>
<option value="ipr">IPR</option>
<option value="consultancy">Consultancy</option>
<option value="incubation">Incubation</option>
<option value="researchprojects">Projects</option>
<option value="doctoralthesis">Doctoral Thesis</option>
</select>

</div>

<table style={table}>

<thead>

<tr style={headerRow}>
<th style={th}>Employee ID</th>
<th style={th}>HOD Name</th>
<th style={th}>Department</th>
<th style={th}>Title</th>
<th style={th}>Category</th>
<th style={th}>Credits</th>
<th style={th}>View</th>
<th style={th}>Actions</th>
</tr>

</thead>

<tbody>

{filteredUploads.map(item=>{

const faculty = getFaculty(item);

return(

<tr key={item._id}>

<td style={td}>{faculty.employeeId || "-"}</td>
<td style={td}>{faculty.name || "-"}</td>
<td style={td}>{item.department}</td>
<td style={td}>{getTitle(item)}</td>
<td style={td}>{item.category}</td>
<td style={td}>{item.credits}</td>

<td style={td}>

<button
onClick={()=>openDetails(item)}
style={viewBtn}
onMouseEnter={(e)=>{e.target.style.transform="scale(1.05)";e.target.style.boxShadow="0 4px 12px rgba(37,99,235,0.4)"}}
onMouseLeave={(e)=>{e.target.style.transform="scale(1)";e.target.style.boxShadow="none"}}
>
View Details
</button>

</td>

<td style={td}>

<button
style={approveBtn}
onClick={()=>approveUpload(item._id)}
onMouseEnter={(e)=>{e.target.style.transform="scale(1.05)";e.target.style.boxShadow="0 4px 12px rgba(22,163,74,0.4)"}}
onMouseLeave={(e)=>{e.target.style.transform="scale(1)";e.target.style.boxShadow="none"}}
>
Approve
</button>

<button
style={discussionBtn}
onClick={()=>callDiscussion(item._id)}
onMouseEnter={(e)=>{e.target.style.transform="scale(1.05)";e.target.style.boxShadow="0 4px 12px rgba(245,158,11,0.4)"}}
onMouseLeave={(e)=>{e.target.style.transform="scale(1)";e.target.style.boxShadow="none"}}
>
Discussion
</button>

</td>

</tr>

);

})}

</tbody>

</table>


{/* ================= VIEW MODAL ================= */}

{selectedUpload && (

<div style={modalOverlay}>

<div style={modalBox}>

<h2>{getTitle(selectedUpload)}</h2>

<p>
<b>HOD:</b> {getFaculty(selectedUpload).name || "-"} ({getFaculty(selectedUpload).employeeId || "-"})
</p>

<p><b>Category:</b> {selectedUpload.category}</p>
<p><b>Status:</b> {selectedUpload.status}</p>
<p><b>Credits:</b> {selectedUpload.credits}</p>

{/* ===== COMMENT ===== */}

{(selectedUpload.hodComment || selectedUpload.adminComment) && (

<div style={{
background:"#fee2e2",
border:"1px solid #f87171",
padding:"10px 12px",
borderRadius:"6px",
marginTop:"12px"
}}>

<b style={{color:"#b91c1c"}}>Comment</b>

<p style={{marginTop:"6px"}}>
{selectedUpload.hodComment || selectedUpload.adminComment}
</p>

</div>

)}

<hr/>

<h4 style={{marginTop:10}}>Details</h4>

{selectedUpload.metadata &&
Object.entries(selectedUpload.metadata)
.filter(([key,value]) =>
key !== "guidedDetails" &&
key !== "guidingDetails" &&
value !== "" &&
value !== null &&
value !== undefined &&
!(Array.isArray(value) && value.length === 0)
)
.map(([key,value]) => {

const label = key
.replace(/([A-Z])/g," $1")
.replace(/^./,c=>c.toUpperCase());

const isChanged =
(selectedUpload.changedFields || [])
.map(f => f.toLowerCase().trim())
.includes(key.toLowerCase().trim());

return (
<p
key={key}
style={{
background: isChanged ? "#fde68a" : "transparent",
color: "#1e293b",
padding:"4px 6px",
borderRadius:4,
fontSize:"14px"
}}
>
<b style={{color:"#0f172a"}}>{label}</b> : {String(value)}
</p>
);

})}

{/* ===== GUIDED SCHOLARS ===== */}

{selectedUpload.metadata?.guidedDetails && (() => {

let guided = [];

try{
guided = JSON.parse(selectedUpload.metadata.guidedDetails);
}catch(e){}

if(!guided.length) return null;

return(

<div style={{marginTop:20}}>

<h4>Guided Scholars</h4>

<table style={{width:"100%",borderCollapse:"collapse"}}>

<thead>
<tr style={{background:"#f3f4f6"}}>
<th style={th}>Scholar Name</th>
<th style={th}>University</th>
<th style={th}>Completion Date</th>
</tr>
</thead>

<tbody>

{guided.map((s,i)=>(
<tr key={i}>
<td style={td}>{s.scholarName || "-"}</td>
<td style={td}>{s.university || "-"}</td>
<td style={td}>{s.completionDate || "-"}</td>
</tr>
))}

</tbody>

</table>

</div>

);

})()}

{/* ===== GUIDING SCHOLARS ===== */}

{selectedUpload.metadata?.guidingDetails && (() => {

let guiding = [];

try{
guiding = JSON.parse(selectedUpload.metadata.guidingDetails);
}catch(e){}

if(!guiding.length) return null;

return(

<div style={{marginTop:20}}>

<h4>Guiding Scholars</h4>

<table style={{width:"100%",borderCollapse:"collapse"}}>

<thead>
<tr style={{background:"#f3f4f6"}}>
<th style={th}>Scholar Name</th>
<th style={th}>University</th>
<th style={th}>Completion Date</th>
</tr>
</thead>

<tbody>

{guiding.map((s,i)=>(
<tr key={i}>
<td style={td}>{s.scholarName || "-"}</td>
<td style={td}>{s.university || "-"}</td>
<td style={td}>{s.completionDate || "-"}</td>
</tr>
))}

</tbody>

</table>

</div>

);

})()}


{selectedUpload.filePath && (

<div style={{marginTop:20}}>

<h3>Uploaded File</h3>

<iframe
title="pdf"
src={getFileUrl(selectedUpload.filePath)}
width="100%"
height="450"
style={{
border:"1px solid #ddd",
borderRadius:"6px"
}}
/>

<a
href={getFileUrl(selectedUpload.filePath)}
target="_blank"
rel="noopener noreferrer"
style={{
display:"inline-block",
marginTop:"10px",
color:"#2563eb",
fontWeight:"bold"
}}
>
Open PDF in new tab
</a>

</div>

)}

<button
onClick={()=>setSelectedUpload(null)}
style={closeBtn}
onMouseEnter={(e)=>{e.target.style.transform="translateY(-2px)";e.target.style.boxShadow="0 4px 12px rgba(239,68,68,0.4)"}}
onMouseLeave={(e)=>{e.target.style.transform="translateY(0)";e.target.style.boxShadow="none"}}
>
Close
</button>

</div>

</div>

)}

</div>

);

}

export default ApproveHodUploads;


/* ================= STYLES ================= */

const table={
width:"100%",
borderCollapse:"collapse"
};

const headerRow={
background:"#f3f4f6"
};

const th={
border:"1px solid #e5e7eb",
padding:"10px",
textAlign:"left"
};

const td={
border:"1px solid #e5e7eb",
padding:"10px"
};

const viewBtn={
background:"#2563eb",
color:"white",
border:"none",
padding:"6px 10px",
borderRadius:"6px",
cursor:"pointer",
transition:"all 0.2s ease"
};

const approveBtn={
background:"#16a34a",
color:"white",
border:"none",
padding:"6px 12px",
borderRadius:"6px",
cursor:"pointer",
marginRight:"8px",
transition:"all 0.2s ease"
};

const discussionBtn={
background:"#f59e0b",
color:"white",
border:"none",
padding:"6px 12px",
borderRadius:"6px",
cursor:"pointer",
transition:"all 0.2s ease"
};

const modalOverlay={
position:"fixed",
top:0,
left:0,
right:0,
bottom:0,
background:"rgba(0,0,0,0.5)",
display:"flex",
justifyContent:"center",
alignItems:"center"
};

const modalBox={
background:"white",
color:"#1e293b",
padding:"25px",
borderRadius:"10px",
width:"700px",
maxHeight:"80vh",
overflowY:"auto"
};

const closeBtn={
marginTop:"20px",
background:"#ef4444",
color:"white",
border:"none",
padding:"8px 14px",
borderRadius:"6px",
cursor:"pointer",
transition:"all 0.2s ease"
};
const filterBar={
display:"flex",
gap:12,
marginBottom:20,
flexWrap:"wrap"
};

const filterInput={
padding:"8px 10px",
borderRadius:"6px",
border:"1px solid #d1d5db",
fontSize:"14px"
};