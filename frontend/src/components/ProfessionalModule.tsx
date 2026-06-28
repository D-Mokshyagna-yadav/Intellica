import { useState, useEffect } from "react";
import ReusableTable from "./ReusableTable";
import { getFileUrl } from "../api";
import { showToast } from "../utils/toast";

function ProfessionalModule({
title,
category,
fetchUrl,
UploadComponent,
onBack,
mode = "upload",
facultyId = null,
roleMode = "faculty"   // NEW
}) {

const [activeTab, setActiveTab] = useState("upload");
const [editItem, setEditItem] = useState(null);
const [data, setData] = useState([]);
const [selectedRow, setSelectedRow] = useState(null);

const token = localStorage.getItem("token");

/* ================= MODE CONTROL ================= */

useEffect(() => {
if (mode === "approved") {
setActiveTab("approved");
} else {
setActiveTab("upload");
}
}, [mode]);

/* ================= STATUS TABS ================= */

const STATUS_TABS = {
pending:{
label:"Pending",
status:[
"FACULTY_SUBMITTED",
"HOD_SUBMITTED"
]
},
approved:{
label:"Approved",
status:[
"HOD_APPROVED",
"ADMIN_APPROVED"
]
},
discussion:{
label:"Call for Discussion",
status:[
"HOD_COMMENT",
"ADMIN_COMMENT"
]
}
};
/* ================= FORMAT FIELD ================= */

const formatField = (field) =>
field
.replace(/([A-Z])/g, " $1")
.replace(/^./, (str) => str.toUpperCase());

/* ================= FETCH DATA ================= */

const fetchData = async () => {

try {

let url = `${fetchUrl}?category=${category}`;

if (facultyId) {
url += `&facultyId=${facultyId}`;
}

const res = await fetch(url,{
method:"GET",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
}
});

const result = await res.json();

const formatted = (result || []).map((item)=>{

const metadata = item.metadata || {};

const displayTitle =
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
"Untitled";

return {
...item,
metadata,
displayTitle
};

});

setData(formatted);

}catch(err){
showToast({ type:"error", message:err.message || "Failed to load activity data" });
setData([]);

}

};

useEffect(()=>{
fetchData();
},[category, facultyId]);

/* ================= FILTER DATA ================= */
const filteredData =
STATUS_TABS[activeTab]?.status
? data.filter((d) => {

const rowStatus = (d.status || "").trim().toUpperCase();

const allowedStatuses = STATUS_TABS[activeTab].status.map(s =>
s.trim().toUpperCase()
);

return (
allowedStatuses.includes(rowStatus) &&
(!category ||
(d.category || "").trim().toLowerCase() ===
(category || "").trim().toLowerCase())
);

})
: [];

/* ================= EDIT ================= */

const handleEdit = (item)=>{
setEditItem(item);
setActiveTab("upload");
};

/* ================= TABLE COLUMNS ================= */

const columns = [
{ key:"displayTitle", label:"Title"},
{ key:"year", label:"Year"},
{ key:"credits", label:"Credits"},
{ key:"status", label:"Status"}
];

/* ================= UI ================= */

return(

<div style={moduleShell}>

<button onClick={onBack} style={backBtn}>
← Back
</button>

<div style={{ marginTop: 8, marginBottom: 18 }}>
  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}>{category}</p>
  <h2 style={{ margin: "8px 0 0", fontSize: 28, lineHeight: 1.1, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
</div>

{/* ================= TABS ================= */}

<div style={tabs}>

<Tab
label="Upload"
tab="upload"
activeTab={activeTab}
setTab={setActiveTab}
/>

{Object.entries(STATUS_TABS).map(([key,value])=>(
<Tab
key={key}
label={value.label}
tab={key}
activeTab={activeTab}
setTab={setActiveTab}
/>
))}

</div>

{/* ================= UPLOAD FORM ================= */}

{activeTab === "upload" && (

<UploadComponent
editData={editItem}
onSubmit={()=>{

fetchData();
setEditItem(null);
setActiveTab("pending");

}}
/>

)}

{/* ================= TABLE ================= */}

{STATUS_TABS[activeTab] && (

<ReusableTable
columns={columns}
data={filteredData}
onEdit={handleEdit}
onResubmit={activeTab==="discussion" ? handleEdit : null}
onView={setSelectedRow}
/>

)}

{/* ================= VIEW MODAL ================= */}

{selectedRow && (

<div style={modalOverlay}>

<div style={modalBox}>

<h3>{selectedRow.displayTitle}</h3>

<p><b>Status:</b> {selectedRow.status}</p>

<p><b>Year:</b> {selectedRow.year}</p>

{/* ================= HOD COMMENT ================= */}

{(selectedRow.hodComment || selectedRow.adminComment) && (
<div style={discussionBox}>

<b style={{color:"#b91c1c"}}>Comment</b>

<p style={{marginTop:6}}>
{selectedRow.hodComment || selectedRow.adminComment}
</p>

</div>

)}

<hr/>

<h4 style={{marginTop:10}}>Details</h4>

{Object.entries(selectedRow.metadata || {})
.filter(([k]) => k !== "guidedDetails" && k !== "guidingDetails")
.map(([k, v]) => {

if (!v) return null;

return (

<p
key={k}
style={{
background:
(selectedRow.changedFields || [])
.map(f=>f.toLowerCase().trim())
.includes(k.toLowerCase().trim())
? "#fde68a"
: "transparent",
padding:"4px 6px",
borderRadius:4
}}
>
<b>{formatField(k)}</b> : {String(v)}
</p>

);

})}

{/* ================= FILE ================= */}

{selectedRow.filePath && (
  <div style={{ marginTop: "20px" }}>
    <h4 style={{ marginBottom: "10px" }}>Proof Document</h4>
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", height: "300px", marginBottom: "10px" }}>
      <iframe
        title="Proof PDF"
        src={getFileUrl(selectedRow.filePath)}
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
    <div style={{ display: "flex", gap: "10px" }}>
      <a
        href={getFileUrl(selectedRow.filePath)}
        target="_blank"
        rel="noreferrer"
        style={pdfBtn}
      >
        Open in New Tab
      </a>
      <a
        href={getFileUrl(selectedRow.filePath)}
        download
        target="_blank"
        rel="noreferrer"
        style={{ ...pdfBtn, background: "#10b981" }}
      >
        Download File
      </a>
    </div>
  </div>
)}

<br/>

<button
style={closeBtn}
onClick={()=>setSelectedRow(null)}
>
Close
</button>

</div>

</div>

)}

</div>

);

}

export default ProfessionalModule;

/* ================= TAB COMPONENT ================= */

function Tab({label,tab,activeTab,setTab}){

const active = activeTab === tab;

return(

<button
onClick={()=>setTab(tab)}
style={{
padding:"10px 16px",
borderRadius:999,
border:"1px solid transparent",
cursor:"pointer",
backgroundColor:active ? "#2563eb" : "#f1f5f9",
color:active ? "white" : "#334155",
fontWeight:700,
boxShadow: active ? "0 8px 18px rgba(37,99,235,0.18)" : "none"
}}
>
{label}
</button>

);

}

/* ================= STYLES ================= */

const tabs={
display:"flex",
gap:10,
margin:"0 0 18px",
padding:"10px",
borderRadius:24,
background:"#f8fafc",
border:"1px solid #e2e8f0",
flexWrap:"wrap"
};

const backBtn={
display:"inline-flex",
alignItems:"center",
gap:8,
background:"#eff6ff",
border:"1px solid #bfdbfe",
color:"#1d4ed8",
padding:"8px 14px",
borderRadius:999,
cursor:"pointer",
marginBottom:14,
fontSize:13,
fontWeight:700
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
alignItems:"center",
padding:16,
backdropFilter:"blur(4px)"
};

const modalBox={
background:"white",
padding:24,
borderRadius:24,
width:"min(760px, 100%)",
maxHeight:"84vh",
overflowY:"auto",
boxShadow:"0 32px 80px rgba(15,23,42,0.24)",
border:"1px solid #e2e8f0"
};

const discussionBox={
background:"#fff1f2",
border:"1px solid #fecdd3",
padding:"12px 14px",
borderRadius:16,
marginTop:12
};

const pdfBtn={
display:"inline-block",
marginTop:10,
padding:"8px 14px",
background:"#2563eb",
color:"white",
borderRadius:999,
textDecoration:"none"
};

const closeBtn={
marginTop:15,
padding:"8px 14px",
background:"#ef4444",
color:"white",
border:"none",
borderRadius:999,
cursor:"pointer"
};

const moduleShell = {
  width: "100%",
  maxWidth: 1240,
  margin: "0 auto",
  padding: 4,
};
