import { useState, useEffect } from "react";

function ApproveUploads() {

const [uploads, setUploads] = useState([]);
const [selectedUpload, setSelectedUpload] = useState(null);

const [categoryFilter,setCategoryFilter] = useState("");
const [facultyFilter,setFacultyFilter] = useState("");
const [searchTitle,setSearchTitle] = useState("");

const token = localStorage.getItem("token");

/* ================= FORMAT FIELD NAME ================= */

const formatFieldName = (field) => {
return field
.replace(/([A-Z])/g," $1")
.replace(/^./,str => str.toUpperCase());
};

/* ================= UNIVERSAL TITLE ================= */

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
  "-"
);

};

/* ================= FETCH UPLOADS ================= */

const fetchPendingUploads = async () => {

try {

const res = await fetch(
"http://localhost:5000/api/uploads/hod/pending",
{
headers:{ Authorization:`Bearer ${token}` }
}
);

const result = await res.json();
console.log("UPLOAD DATA:", result);

const flattened = (result || []).map(item => ({

...item,
metadata:item.metadata || {},
displayTitle:getTitle(item),
comment:item.comment || "",
changedFields:item.changedFields || []

}));

setUploads(flattened);

} catch(err){
console.error(err);
setUploads([]);
}

};

/* ================= LOAD ON START ================= */

useEffect(()=>{
fetchPendingUploads();
},[]);

/* ================= FILTER DATA ================= */

const categories=[...new Set(uploads.map(u=>u.category))];

const faculties=[
...new Set(
uploads.map(u=>u.faculty?.name).filter(Boolean)
)
];

const filteredUploads = uploads.filter(upload => {

if(categoryFilter && upload.category !== categoryFilter) return false;

if(facultyFilter && upload.faculty?.name !== facultyFilter) return false;

if(searchTitle){

const titleMatch = upload.displayTitle;

if(!titleMatch.toLowerCase().includes(searchTitle.toLowerCase()))
return false;

}

return true;

});

/* ================= APPROVE ================= */

const handleApprove = async (id) => {

await fetch(
`http://localhost:5000/api/uploads/hod/approve/${id}`,
{
method:"PUT",
headers:{ Authorization:`Bearer ${token}` }
}
);

alert("Upload approved");

fetchPendingUploads();

};

/* ================= DISCUSSION ================= */

const handleDiscussion = async (id) => {

const comment = prompt("Enter discussion comment for faculty:");

if(!comment || comment.trim()===""){
alert("Comment required");
return;
}

await fetch(
`http://localhost:5000/api/uploads/discussion/${id}`,
{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({comment})
}
);

fetchPendingUploads();

};

return (

<div style={pageContainer}>

<div style={headerSection}>
<h1 style={title}>Approve Faculty Uploads</h1>
<p style={subtitle}>
Review submitted academic activities and assign credits
</p>
</div>

{/* FILTER BAR */}

<div style={filterWrapper}>

<select
value={categoryFilter}
onChange={(e)=>setCategoryFilter(e.target.value)}
style={filterSelect}
>
<option value="">All Categories</option>
{categories.map(c => (
<option key={c}>{c}</option>
))}
</select>

<select
value={facultyFilter}
onChange={(e)=>setFacultyFilter(e.target.value)}
style={filterSelect}
>
<option value="">All Faculty</option>
{faculties.map(f => (
<option key={f}>{f}</option>
))}
</select>

<input
type="text"
placeholder="Search by title..."
value={searchTitle}
onChange={(e)=>setSearchTitle(e.target.value)}
style={searchInput}
/>

</div>

{/* TABLE */}

<div style={scrollWrapper}>

<table style={table}>

<thead>

<tr>
<th style={th}>Faculty</th>
<th style={th}>Category</th>
<th style={th}>Title</th>
<th style={th}>Credits</th>
<th style={th}>Status</th>
<th style={th}>Actions</th>
</tr>

</thead>

<tbody>

{filteredUploads.map(u => (

<tr key={u._id}>

<td style={td}>{u.faculty?.name} ({u.faculty?.employeeId})</td>
<td style={td}>{u.category}</td>
<td style={td}>{u.displayTitle}</td>
<td style={td}>{u.credits}</td>
<td style={td}>{u.status}</td>

<td style={td}>

<div style={actionWrapper}>

<button
style={viewBtn}
onClick={()=>setSelectedUpload(u)}
onMouseEnter={(e)=>{e.target.style.transform="scale(1.05)";e.target.style.boxShadow="0 4px 12px rgba(37,99,235,0.4)"}}
onMouseLeave={(e)=>{e.target.style.transform="scale(1)";e.target.style.boxShadow="none"}}
>
View Details
</button>

<button
style={approveBtn}
onClick={()=>handleApprove(u._id)}
onMouseEnter={(e)=>{e.target.style.transform="scale(1.05)";e.target.style.boxShadow="0 4px 12px rgba(22,163,74,0.4)"}}
onMouseLeave={(e)=>{e.target.style.transform="scale(1)";e.target.style.boxShadow="none"}}
>
Approve
</button>

<button
style={discussionBtn}
onClick={()=>handleDiscussion(u._id)}
onMouseEnter={(e)=>{e.target.style.transform="scale(1.05)";e.target.style.boxShadow="0 4px 12px rgba(245,158,11,0.4)"}}
onMouseLeave={(e)=>{e.target.style.transform="scale(1)";e.target.style.boxShadow="none"}}
>
Call for Discussion
</button>

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>

{/* VIEW MODAL */}

{selectedUpload && (

<div style={modalOverlay}>

<div style={modalBox}>

<h2>{selectedUpload.displayTitle}</h2>

<p>
<b>Faculty:</b> {selectedUpload.faculty?.name} ({selectedUpload.faculty?.employeeId})
</p>
<p><b>Category:</b> {selectedUpload.category}</p>
<p><b>Status:</b> {selectedUpload.status}</p>
<p><b>Credits:</b> {selectedUpload.credits}</p>

{/* ===== COMMENT ===== */}

{selectedUpload.comment && (

<div style={{
background:"#fee2e2",
border:"1px solid #f87171",
padding:"10px",
borderRadius:6,
marginTop:10
}}>

<b>Comment</b>
<p>{selectedUpload.comment}</p>

</div>

)}

<hr/>

{/* ===== METADATA ===== */}

{Object.entries(selectedUpload.metadata || {})
.filter(([key]) => {

const k = key.toLowerCase();

return !(
k.includes("guided") ||
k.includes("guiding") ||
k.includes("guide")
);

})
.map(([key,value]) => {

if(!value) return null;

return (

<p
key={key}
style={{
background:
(selectedUpload.changedFields || []).includes(key)
? "#fde68a"
: "transparent",
padding:"4px 6px",
borderRadius:4
}}
>
<b>{formatFieldName(key)}</b> : {value}
</p>

);

})}
{/* ===== GUIDED SCHOLARS ===== */}

{selectedUpload.metadata?.guidedDetails && (()=>{

let guided = [];

try{
guided = JSON.parse(selectedUpload.metadata.guidedDetails);
}catch(e){}

if(!guided.length) return null;

return(

<div style={{marginTop:20}}>

<h3>Guided Scholars</h3>

<table style={{
width:"100%",
borderCollapse:"collapse",
marginTop:10
}}>

<thead>

<tr style={{background:"#f1f5f9"}}>
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

{selectedUpload.metadata?.guidingDetails && (()=>{

let guiding = [];

try{
guiding = JSON.parse(selectedUpload.metadata.guidingDetails);
}catch(e){}

if(!guiding.length) return null;

return(

<div style={{marginTop:20}}>

<h3>Guiding Scholars</h3>

<table style={{
width:"100%",
borderCollapse:"collapse",
marginTop:10
}}>

<thead>

<tr style={{background:"#f1f5f9"}}>
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
{/* PDF */}

{selectedUpload.filePath && (

<a
href={`http://localhost:5000/${selectedUpload.filePath}`}
target="_blank"
rel="noreferrer"
style={pdfBtn}
>
View PDF
</a>

)}

<br/>

<button
style={closeBtn}
onClick={()=>setSelectedUpload(null)}
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

export default ApproveUploads;


/* ================= STYLES ================= */

const pageContainer={width:"100%",paddingTop:20};
const headerSection={marginBottom:30};

const title={
fontSize:26,
fontWeight:700,
color:"#0F172A",
marginBottom:8
};

const subtitle={fontSize:14,color:"#334155"};

const filterWrapper={
display:"flex",
gap:12,
marginBottom:20,
flexWrap:"wrap"
};

const filterSelect={
padding:"8px 14px",
borderRadius:8,
border:"1px solid #cbd5f5",
backgroundColor:"#f8fafc",
fontSize:14,
minWidth:180
};

const searchInput={
padding:"8px 14px",
borderRadius:8,
border:"1px solid #cbd5f5",
fontSize:14,
minWidth:240
};

const scrollWrapper={overflowX:"auto"};

const table={
minWidth:"900px",
borderCollapse:"collapse",
backgroundColor:"white",
borderRadius:12,
boxShadow:"0 6px 18px rgba(0,0,0,0.06)"
};

const th={
padding:"18px 20px",
backgroundColor:"#f8fafc",
borderBottom:"1px solid #e2e8f0",
fontWeight:600
};

const td={
padding:"18px 20px",
borderBottom:"1px solid #e2e8f0"
};

const actionWrapper={display:"flex",gap:10};

const viewBtn={
padding:"6px 12px",
backgroundColor:"#2563eb",
color:"white",
borderRadius:8,
border:"none",
cursor:"pointer",
transition:"all 0.2s ease"
};

const approveBtn={
padding:"6px 16px",
backgroundColor:"#16a34a",
color:"white",
border:"none",
borderRadius:8,
cursor:"pointer",
transition:"all 0.2s ease"
};

const discussionBtn={
padding:"6px 16px",
backgroundColor:"#f59e0b",
color:"white",
border:"none",
borderRadius:8,
cursor:"pointer",
transition:"all 0.2s ease"
};

const modalOverlay={
position:"fixed",
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.4)",
display:"flex",
justifyContent:"center",
alignItems:"center"
};

const modalBox={
background:"white",
padding:25,
borderRadius:10,
width:500,
maxHeight:"80vh",
overflowY:"auto"
};

const pdfBtn={
display:"inline-block",
marginTop:10,
padding:"6px 12px",
background:"#2563eb",
color:"white",
borderRadius:6,
textDecoration:"none",
cursor:"pointer",
transition:"all 0.2s ease"
};

const closeBtn={
marginTop:15,
padding:"6px 12px",
background:"#ef4444",
color:"white",
border:"none",
borderRadius:6,
cursor:"pointer",
transition:"all 0.2s ease"
};