import { useState, useEffect } from "react";
import { activityFields } from "../config/activityFields";
import API_BASE from "../api";
import { buildYearOptions } from "../constants/years";
import { showToast } from "../utils/toast";

function UploadActivity({ category, onSubmit, editData }) {

const fields = activityFields[category] || [];

const [form, setForm] = useState({});
const [file, setFile] = useState(null);
const [selectedYear, setSelectedYear] = useState("");

const [guidedForms, setGuidedForms] = useState([]);
const [guidingForms, setGuidingForms] = useState([]);

const token = localStorage.getItem("token");

/* ================= LOAD EDIT DATA ================= */

useEffect(() => {

if (editData) {

  const metadata = editData.metadata || {};
  setForm({ ...metadata });
  setSelectedYear(editData.year ? String(editData.year) : "");

} else {

const defaults = {};

fields.forEach(field => {
if (field.defaultValue) {
defaults[field.name] = field.defaultValue;
}
});

setForm(defaults);
setSelectedYear("");

}

}, [editData, category]);

/* ================= HANDLE CHANGE ================= */

const handleChange = (e) => {

const { name, value } = e.target;

let updatedForm = {
...form,
[name]: value
};

/* AUTO DURATION */

if (
name === "startDate" ||
name === "endDate" ||
name === "fromDate" ||
name === "toDate"
) {

const start =
name === "startDate"
? value
: name === "fromDate"
? value
: form.startDate || form.fromDate;

const end =
name === "endDate"
? value
: name === "toDate"
? value
: form.endDate || form.toDate;

if (start && end) {

const startDate = new Date(start);
const endDate = new Date(end);

const diffDays =
Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

updatedForm.duration = diffDays > 0 ? diffDays : "";

} else {
updatedForm.duration = "";
}

}

/* DOCTORAL FORMS */

if (name === "guidedCount") {

const count = Number(value) || 0;

const forms = Array.from({ length: count }, () => ({
scholarName: "",
university: "",
completionDate: "",
proof: null
}));

setGuidedForms(forms);

}

if (name === "guidingCount") {

const count = Number(value) || 0;

const forms = Array.from({ length: count }, () => ({
scholarName: "",
university: "",
completionDate: "",
proof: null
}));

setGuidingForms(forms);

}

setForm(updatedForm);

};

/* ================= FILE VALIDATION ================= */

const handleFileChange = (e) => {

const selectedFile = e.target.files[0];
if (!selectedFile) return;

const maxSize = 20 * 1024 * 1024;

if (selectedFile.size > maxSize) {
showToast({ type: "error", message: "PDF must be less than 20MB" });
return;
}

setFile(selectedFile);

};

/* ================= HANDLE SUBMIT ================= */

const handleSubmit = async (e) => {

e.preventDefault();

if (!selectedYear) {
  showToast({ type: "error", message: "Please select a valid year before submitting." });
  return;
}

try {

const formData = new FormData();
formData.append("year", selectedYear);


/* TITLE */

const autoTitle =
form.title ||
form.paperTitle ||
form.courseName ||
form.projectTitle ||
form.startupName ||
form.topic ||
form.awardName ||
form.policyName ||
form.conferenceName ||
form.bookTitle ||
"";

formData.append("title", autoTitle);


/* METADATA */

fields.forEach(field => {
formData.append(field.name, form[field.name] || "");
});

/* DOCTORAL DETAILS */

formData.append("guidedDetails", JSON.stringify(guidedForms));
formData.append("guidingDetails", JSON.stringify(guidingForms));

/* FILE */

if (file && category !== "doctoralThesis") {
formData.append("file", file);
}

/* API URL */

const url = editData
? `${API_BASE}/uploads/update/${editData._id}/${category}`
: `${API_BASE}/uploads/create/${category}`;

const method = editData ? "PUT" : "POST";

/* REQUEST */

const res = await fetch(url, {
method,
headers: {
Authorization: `Bearer ${token}`
},
body: formData
});

const data = await res.json();

if (!res.ok) {
showToast({ type: "error", message: data.message || "Upload failed" });
return;
}

showToast({ type: "success", message: editData ? "Updated and resubmitted" : "Upload submitted" });

setForm({});
setFile(null);
setGuidedForms([]);
setGuidingForms([]);

if (onSubmit) onSubmit();

} catch (err) {

showToast({ type: "error", message: err.message || "Upload failed" });

}

};

/* ================= CONDITIONAL DISPLAY ================= */

const shouldShow = (field) => {
if (!field.showIf) return true;
return form[field.showIf.field] === field.showIf.value;
};

return (

<form onSubmit={handleSubmit} style={formWrapper}>
    <div style={fieldWrapper}>
      <label>Select Year</label>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        style={inputStyle}
        required
      >
        <option value="">Year</option>
        {buildYearOptions(2000).map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>

    {fields.map(field => {

if (!shouldShow(field)) return null;

return (

<div key={field.name} style={fieldWrapper}>

<label>{field.label}</label>

{field.type === "radio" ? (

<div style={radioWrapper}>

{field.options?.map(option => (

<label key={option} style={radioLabel}>

<input
type="radio"
name={field.name}
value={option}
checked={form[field.name] === option}
onChange={handleChange}
required={field.required}
/>

{option}

</label>

))}

</div>

) : field.type === "select" ? (

<select
name={field.name}
value={form[field.name] || ""}
onChange={handleChange}
required={field.required}
style={inputStyle}
>

<option value="">Select</option>

{field.options?.map(option => (
<option key={option} value={option}>
{option}
</option>
))}

</select>

) : (

<input
type={field.type}
name={field.name}
value={form[field.name] || ""}
onChange={handleChange}
required={field.required}
min="0"
style={inputStyle}
/>

)}

</div>

);

})}



{category !== "doctoralThesis" && (

<div style={fieldWrapper}>

<label>Upload Proof (PDF)</label>

<input
type="file"
accept="application/pdf"
onChange={handleFileChange}
required={!editData}
style={inputStyle}
/>

</div>

)}
{/* ================= GUIDED SCHOLARS ================= */}

{guidedForms.length > 0 && (
<div style={{marginTop:20}}>
<h3>Guided Scholars</h3>

{guidedForms.map((scholar, index)=>(
<div key={index} style={fieldWrapper}>

<label>Scholar Name</label>
<input
type="text"
value={scholar.scholarName}
onChange={(e)=>{
const updated=[...guidedForms];
updated[index].scholarName=e.target.value;
setGuidedForms(updated);
}}
style={inputStyle}
/>

<label>University</label>
<input
type="text"
value={scholar.university}
onChange={(e)=>{
const updated=[...guidedForms];
updated[index].university=e.target.value;
setGuidedForms(updated);
}}
style={inputStyle}
/>

<label>Completion Date</label>
<input
type="date"
value={scholar.completionDate}
onChange={(e)=>{
const updated=[...guidedForms];
updated[index].completionDate=e.target.value;
setGuidedForms(updated);
}}
style={inputStyle}
/>

</div>
))}

</div>
)}

{/* ================= GUIDING SCHOLARS ================= */}

{guidingForms.length > 0 && (
<div style={{marginTop:20}}>
<h3>Guiding Scholars</h3>

{guidingForms.map((scholar, index)=>(
<div key={index} style={fieldWrapper}>

<label>Scholar Name</label>
<input
type="text"
value={scholar.scholarName}
onChange={(e)=>{
const updated=[...guidingForms];
updated[index].scholarName=e.target.value;
setGuidingForms(updated);
}}
style={inputStyle}
/>

<label>University</label>
<input
type="text"
value={scholar.university}
onChange={(e)=>{
const updated=[...guidingForms];
updated[index].university=e.target.value;
setGuidingForms(updated);
}}
style={inputStyle}
/>

<label>Completion Date</label>
<input
type="date"
value={scholar.completionDate}
onChange={(e)=>{
const updated=[...guidingForms];
updated[index].completionDate=e.target.value;
setGuidingForms(updated);
}}
style={inputStyle}
/>

</div>
))}

</div>
)}

<button type="submit" style={submitBtn}>
{editData ? "Update & Resubmit" : "Submit"}
</button>

</form>

);

}

export default UploadActivity;

/* ================= STYLES ================= */

const formWrapper = {
backgroundColor: "white",
padding: 25,
borderRadius: 12,
maxWidth: 650,
display: "flex",
flexDirection: "column",
gap: 14
};

const fieldWrapper = {
display: "flex",
flexDirection: "column",
gap: 4
};

const inputStyle = {
width: "100%",
padding: 10
};

const submitBtn = {
padding: 12,
backgroundColor: "#2563eb",
color: "white",
border: "none",
borderRadius: 10,
cursor: "pointer",
marginTop: 10
};

const radioWrapper = {
display: "flex",
gap: 20,
marginTop: 6
};

const radioLabel = {
display: "flex",
alignItems: "center",
gap: 6
};
