import { useState, useMemo, useEffect, useRef } from "react";
import { useResponsive } from "../../hooks/useResponsive";
import "../../styles/responsiveDashboard.css";

import FacultyHeader from "./FacultyHeader";
import ProfessionalDevelopment from "./ProfessionalDevelopment";
import RnD from "./RnD";

import Conferences from "./categories/Conferences";
import Workshops from "./categories/Workshops";
import FDP from "./categories/FDP";
import Books from "./categories/Books";
import NPTEL from "./categories/NPTEL";
import Seminars from "./categories/Seminars";
import Webinars from "./categories/Webinars";
import GuestLectures from "./categories/GuestLectures";
import HonorsAwards from "./categories/HonorsAwards";
import Certifications from "./categories/Certifications";
import Others from "./categories/Others";

import Publications from "./categories/Publications";
import ResearchPolicy from "./categories/ResearchPolicy";
import DoctoralThesis from "./categories/DoctoralThesis";
import ResearchProjects from "./categories/ResearchProjects";
import ProfessionalMemberships from "./categories/ProfessionalMemberships";
import IPRs from "./categories/IPRs";
import Incubation from "./categories/Incubation";
import Consultancy from "./categories/Consultancy";

import ProfileInfo from "../common/ProfileInfo";
import API_BASE from "../../api";
import CreditConfigViewer from "../admin/sections/credit-config/common/CreditConfigViewer";

const ALL_YEARS = Array.from({ length: 1101 }, (_, i) => (1900 + i).toString());

function FacultyDashboard({ setPage, readOnly = false, facultyId = null })  {
const responsive = useResponsive();
const isHODView = readOnly && facultyId;
const [view,setView]=useState("dashboard");
const [uploads,setUploads]=useState([]);

const ALL_CATEGORIES = [
  "Publications",
  "Conferences",
  "FDPs",
  "Books",
  "NPTEL",
  "Seminars",
  "Webinars",
  "GuestLectures",
  "HonorsAwards",
  "Certification",
  "ResearchPolicy",
  "Membership",
  "IPR",
  "Consultancy",
  "Incubation",
  "ResearchProjects",
  "DoctoralThesis",
  "MOUs",
  "Other"
];

const availableCategories = ALL_CATEGORIES;

const availableYears = useMemo(() => 
  [...new Set(
    uploads
      .filter(u => u.createdAt) // ✅ safety
      .map(u => new Date(u.createdAt).getFullYear())
  )]
  .filter(Boolean)
  .sort((a, b) => b - a),
[uploads]);
const [user,setUser]=useState(null);
const [categoryMode,setCategoryMode]=useState("upload");
const [selectedCategory, setSelectedCategory] = useState("");
const [selectedYear, setSelectedYear] = useState("");
const [rankData, setRankData] = useState(null);

const fileInputRef=useRef(null);
const token=localStorage.getItem("token");



/* LOGOUT */

const handleLogout = () => {
  localStorage.clear();
  window.location.href = "/";
};



/* FETCH PROFILE */


useEffect(()=>{

const url = facultyId
? `${API_BASE}/faculty/${facultyId}`
: `${API_BASE}/faculty/profile`;

fetch(url,{
headers:{Authorization:`Bearer ${token}`}
})
.then(res=>res.json())
.then(data=>setUser(data))
.catch(console.error);

},[token, facultyId]);

useEffect(() => {
  const fetchRank = async () => {
    try {
      const res = await fetch(`${API_BASE}/ranking`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.error("Ranking fetch failed:", res.status);
        return;
      }

      const data = await res.json();
      console.log("FULL RANKING DATA:", data);

      if (!Array.isArray(data)) return;

      
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.id;

      
      const myData = data.find(f => f.facultyId === userId);
      console.log("MY DATA:", myData);

      if (myData) {
        
        setRankData({
          departmentRank:  myData.rank,
          departmentTotal: myData.departmentTotal,
          collegeRank:     myData.collegeRank,
          collegeTotal:    myData.collegeTotal,
          score:           myData.score
        });
      }

    } catch (err) {
      console.error("Rank fetch error:", err);
    }
  };

  if (token) fetchRank();
}, [token]);

/* FETCH UPLOADS */

useEffect(()=>{

const url = facultyId
? `${API_BASE}/uploads/faculty/${facultyId}`
: `${API_BASE}/uploads/mine`;

fetch(url,{
headers:{Authorization:`Bearer ${token}`}
})
.then(async res => {

if(!res.ok){
console.error("Upload fetch failed",res.status);
setUploads([]);
return;
}

const data = await res.json();   

if(Array.isArray(data)){
setUploads(data);
}else{
setUploads([]);
}

})
.catch(err=>{
console.error("UPLOAD FETCH ERROR",err);
setUploads([]);
});

},[token, facultyId]);

/* PROFILE IMAGE */

const handleImageClick=()=>fileInputRef.current.click();

const handleImageChange=async(e)=>{

const file=e.target.files[0];
if(!file) return;

const formData=new FormData();
formData.append("profileImage",file);

const res=await fetch(`${API_BASE}/auth/update-profile-image`,{
method:"PUT",
headers:{Authorization:`Bearer ${token}`},
body:formData
});

const data=await res.json();

if(res.ok){
setUser(prev=>({...prev,profileImage:data.profileImage}));
}

};



/* APPROVED UPLOADS */

const approvedUploads = useMemo(() =>
  uploads.filter((u) => {
    const status = (u.status || "").toUpperCase();
    return (
      status === "HOD_APPROVED" ||
      status === "ADMIN_APPROVED"
    );
  }),
[uploads]);
/* CREDIT CALCULATIONS */

const totalCredits=approvedUploads.reduce((sum,u)=>sum+u.credits,0);

const byCategory = (category) =>
approvedUploads
.filter(u => (u.category || "").toLowerCase() === category.toLowerCase())
.reduce((sum, u) => sum + (u.credits || 0), 0);
const pendingUploads = uploads.filter((u) => {
  const status = (u.status || "").toUpperCase();
  return status === "PENDING";
});

const approvedCount = approvedUploads.length;
const pendingCount = pendingUploads.length;



/* CATEGORY CREDIT MAP */

const categoryCredits={
publication:byCategory("publication"),
conference:byCategory("conference"),
workshop:byCategory("workshop"),
fdp:byCategory("fdp"),
book:byCategory("book"),
nptel:byCategory("nptel"),
seminar:byCategory("seminar"),
webinar:byCategory("webinar"),
guestlecture:byCategory("guestlecture"),
honorsawards:byCategory("honorsawards"),
certification:byCategory("certification"),
others: byCategory("others"),
researchpolicy:byCategory("researchpolicy"),
membership:byCategory("membership"),
ipr:byCategory("ipr"),
consultancy:byCategory("consultancy"),
incubation:byCategory("incubation"),
doctoralThesis:byCategory("doctoralThesis"),
researchProjects:byCategory("researchProjects")
};



/* CATEGORY OPEN HANDLER */

const openCategory=(key)=>{
setCategoryMode("approved");
setView(key);
};
/* DOWNLOAD EXCEL */

const handleDownload = async () => {
  try {
    let url = `${API_BASE}/reports/faculty-excel`;

    const params = new URLSearchParams();

    if (selectedCategory) {
      params.append("category", selectedCategory);
    }

    if (selectedYear) {
      params.append("year", selectedYear);
    }

    if ([...params].length > 0) {
      url += `?${params.toString()}`;
    }

    console.log("DOWNLOAD URL:", url); // 🔍 debug this

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      console.error("Download failed:", res.status);
      return;
    }

    const blob = await res.blob();

    if (blob.size === 0) {
      console.error("Empty file returned ❌");
      return;
    }

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "faculty_activities.xlsx";
    link.click();

  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
  }
};



return(

<div style={wrapper}>

<FacultyHeader user={user} readOnly={readOnly}/>

<div style={layout}>

{/* SIDEBAR */}

<div style={sidebar}>

<div style={profileSection}>

<img
src={
  user?.profileImage
    ? `/uploads/${user.profileImage}`
    : "https://via.placeholder.com/260x220"
}
alt="Profile"
style={profileImageStyle}
onClick={!readOnly ? handleImageClick : undefined}
/>

<input
type="file"
ref={fileInputRef}
style={{display:"none"}}
onChange={handleImageChange}
/>

{!readOnly && (
<div style={changeText} onClick={handleImageClick}>
Click to change image
</div>
)}

<ProfileInfo user={user} readOnly={readOnly}/>

</div>

<div style={sidebarTitle}>Faculty Panel</div>

{menuItems.map(item=>(

<div
key={item.key}
onClick={()=>{

if(readOnly){
  setCategoryMode("approved");
}else{
  setCategoryMode("upload");
}

setView(item.key);

}}
style={{
...menuItem,
...(view===item.key?activeItem:{})
}}
onMouseEnter={(e)=>{
if(view!==item.key){
e.currentTarget.style.background="rgba(255,255,255,0.35)";
}
}}
onMouseLeave={(e)=>{
if(view!==item.key){
e.currentTarget.style.background="transparent";
}
}}
>
{item.label}
</div>


))}
{/* LOGOUT BUTTON */}

{!readOnly && (
<div
onClick={handleLogout}
style={{
marginTop:20,
padding:"10px 12px",
background:"#ef4444",
color:"white",
borderRadius:8,
cursor:"pointer",
textAlign:"center",
fontWeight:600
}}
>
Logout
</div>
)}
</div>



{/* CONTENT */}

<div style={content}>


{/* DASHBOARD */}

{view==="dashboard"&&(

<>

<div style={dashboardHeader}>

<h2>Academic Performance Overview</h2>

<div style={{display:"flex",gap:10}}>

<button style={downloadBtn} onClick={handleDownload}>
Download All
</button>

<select
  style={downloadSelect}
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
>
  <option value="">Category</option>
  <option value="All">ALL</option>

  {availableCategories.map(cat => (
    <option key={cat} value={cat}>
      {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
    </option>
  ))}

</select>

<select
  style={downloadSelect}
  value={selectedYear}
  onChange={(e) => setSelectedYear(e.target.value)}
>
  <option value="">Year</option>
  <option value="All">ALL</option>

  {Array.from({ length: 1101 }, (_, i) => 1900 + i).map(year => (
    <option key={year} value={year}>
      {year}
    </option>
  ))}
</select>

</div>

</div>

<div style={{display:"flex",gap:20,marginTop:30}}>
<SummaryCard title="Total Credits" value={totalCredits}/>

<SummaryCard 
  title="Department Rank"
  value={
    rankData
      ? `${rankData.departmentRank} / ${rankData.departmentTotal}`
      : "—"
  }
/>

<SummaryCard 
  title="College Rank"
  value={
    rankData
      ? `${rankData.collegeRank} / ${rankData.collegeTotal}`
      : "—"
  }
/>
</div>

<div style={cardGrid}>

<CategoryCard title="Publications" value={categoryCredits.publication} onClick={()=>openCategory("rnd-publications")}/>
<CategoryCard title="Conferences" value={categoryCredits.conference} onClick={()=>openCategory("conferences")}/>
<CategoryCard title="Workshops" value={categoryCredits.workshop} onClick={()=>openCategory("workshops")}/>
<CategoryCard title="FDP" value={categoryCredits.fdp} onClick={()=>openCategory("fdp")}/>
<CategoryCard title="Books" value={categoryCredits.book} onClick={()=>openCategory("books")}/>
<CategoryCard title="NPTEL" value={categoryCredits.nptel} onClick={()=>openCategory("nptel")}/>
<CategoryCard title="Seminars" value={categoryCredits.seminar} onClick={()=>openCategory("seminars")}/>
<CategoryCard title="Webinars" value={categoryCredits.webinar} onClick={()=>openCategory("webinars")}/>
<CategoryCard title="Guest Lectures" value={categoryCredits.guestlecture} onClick={()=>openCategory("guest-lectures")}/>
<CategoryCard title="Awards" value={categoryCredits.honorsawards} onClick={()=>openCategory("honors-awards")}/>
<CategoryCard title="Certifications" value={categoryCredits.certification} onClick={()=>openCategory("certifications")}/>
<CategoryCard title="Research Policy" value={categoryCredits.researchpolicy} onClick={()=>openCategory("rnd-policy")}/>
<CategoryCard title="Memberships" value={categoryCredits.membership} onClick={()=>openCategory("rnd-memberships")}/>
<CategoryCard title="IPR" value={categoryCredits.ipr} onClick={()=>openCategory("rnd-iprs")}/>
<CategoryCard title="Consultancy" value={categoryCredits.consultancy} onClick={()=>openCategory("rnd-consultancy")}/>
<CategoryCard title="Incubation" value={categoryCredits.incubation} onClick={()=>openCategory("rnd-incubation")}/>
<CategoryCard title="Projects" value={categoryCredits.researchProjects} onClick={()=>openCategory("rnd-projects")}/>
<CategoryCard title="Doctoral Thesis" value={categoryCredits.doctoralThesis} onClick={()=>openCategory("rnd-doctoral-thesis")}/>
<CategoryCard title="Others" value={categoryCredits.others || 0} onClick={()=>openCategory("others")}/>
</div>

</>

)}



{/* PROFESSIONAL DEVELOPMENT */}

{view==="pdc"&&( <ProfessionalDevelopment onSelectCategory={setView}/> )}

{view==="conferences"&&<Conferences mode={categoryMode} facultyId={facultyId} onBack={()=>setView("pdc")}/>}

{view==="workshops"&&<Workshops mode={categoryMode} facultyId={facultyId} onBack={()=>setView("pdc")}/>}

{view==="fdp"&&<FDP mode={categoryMode} facultyId={facultyId} onBack={()=>setView("pdc")}/>}

{view==="books"&&<Books mode={categoryMode} facultyId={facultyId} onBack={()=>setView("pdc")}/>}

{view==="nptel"&&<NPTEL mode={categoryMode} facultyId={facultyId} onBack={()=>setView("pdc")}/>}

{view==="seminars"&&<Seminars mode={categoryMode} facultyId={facultyId} onBack={()=>setView("pdc")}/>}

{view==="webinars"&&<Webinars mode={categoryMode} facultyId={facultyId} onBack={()=>setView("pdc")}/>}

{view==="guest-lectures"&&<GuestLectures mode={categoryMode} facultyId={facultyId} onBack={()=>setView("pdc")}/>}

{view==="honors-awards"&&<HonorsAwards mode={categoryMode} facultyId={facultyId} onBack={()=>setView("pdc")}/>}

{view==="certifications"&&<Certifications mode={categoryMode} facultyId={facultyId} onBack={()=>setView("pdc")}/>}

{view==="others"&&<Others mode={categoryMode} facultyId={facultyId} onBack={()=>setView("pdc")}/>}

{/* R&D */}

{view==="rnd"&&(
  <RnD 
    onSelectCategory={setView} 
    role="FACULTY" 
  />
)}

{view==="rnd-publications"&&<Publications mode={categoryMode} facultyId={facultyId} onBack={()=>setView("rnd")}/>}

{view==="rnd-policy"&&<ResearchPolicy mode={categoryMode} facultyId={facultyId} onBack={()=>setView("rnd")}/>}

{view==="rnd-doctoral-thesis"&&<DoctoralThesis mode={categoryMode} facultyId={facultyId} onBack={()=>setView("rnd")}/>}

{view==="rnd-projects"&&<ResearchProjects mode={categoryMode} facultyId={facultyId} onBack={()=>setView("rnd")}/>}

{view==="rnd-memberships"&&<ProfessionalMemberships mode={categoryMode} facultyId={facultyId} onBack={()=>setView("rnd")}/>}

{view==="rnd-iprs"&&<IPRs mode={categoryMode} facultyId={facultyId} onBack={()=>setView("rnd")}/>}

{view==="rnd-incubation"&&<Incubation mode={categoryMode} facultyId={facultyId} onBack={()=>setView("rnd")}/>}

{view==="rnd-consultancy"&&<Consultancy mode={categoryMode} facultyId={facultyId} onBack={()=>setView("rnd")}/>}
{view==="credit-config" && <CreditConfigViewer />}
</div>

</div>

</div>

);

}

export default FacultyDashboard;



/* COMPONENTS */

function SummaryCard({title,value}){

const [hover,setHover] = useState(false);

return(
<div
style={{
...summaryCard,
...(hover?summaryHover:{})
}}
onMouseEnter={()=>setHover(true)}
onMouseLeave={()=>setHover(false)}
>
<h2>{value}</h2>
<p>{title}</p>
</div>
);
}

function CategoryCard({title,value,onClick}){

const [hover,setHover] = useState(false);

return(
<div
style={{
...categoryCard,
...(hover?categoryHover:{})
}}
onClick={onClick}
onMouseEnter={()=>setHover(true)}
onMouseLeave={()=>setHover(false)}
>
<h3>{title}</h3>
<p>Credits Earned</p>
<h2>{value}</h2>
</div>
);
}


/* STYLES */

const wrapper={minHeight:"100vh",background:"linear-gradient(180deg,#c7d2fe 0%,#e9d5ff 100%)",paddingTop:"100px"};

const layout={display:"flex"};

const sidebar={width:260,padding:20,borderRight:"1px solid rgba(0,0,0,0.08)"};

const profileSection={marginBottom:30,display:"flex",flexDirection:"column",alignItems:"center"};

const profileImageStyle={width:"100%",height:220,borderRadius:"18px",objectFit:"cover",cursor:"pointer",border:"3px solid #4f46e5"};

const changeText={fontSize:13,marginTop:12,cursor:"pointer"};

const sidebarTitle={fontWeight:700,marginBottom:15};

const menuItem={
marginBottom:10,
padding:"8px 10px",
cursor:"pointer",
borderRadius:6,
transition:"all 0.2s ease"
};

const activeItem={background:"rgba(255,255,255,0.5)",borderLeft:"4px solid #4f46e5"};

const content={flex:1,padding:40};

const cardGrid={display:"flex",gap:20,flexWrap:"wrap"};

const summaryCard={
width:200,
height:100,
background:"white",
borderRadius:12,
display:"flex",
flexDirection:"column",
justifyContent:"center",
alignItems:"center",
transition:"all 0.25s ease",
boxShadow:"0 4px 10px rgba(0,0,0,0.08)"
};

const categoryCard={
width:220,
height:120,
background:"white",
borderRadius:12,
padding:20,
marginTop:20,
cursor:"pointer",
boxShadow:"0 4px 10px rgba(0,0,0,0.08)",
transition:"all 0.25s ease"
};
const dashboardHeader={
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:10
};

const downloadBtn={
padding:"8px 14px",
background:"#2563eb",
color:"white",
border:"none",
borderRadius:6,
cursor:"pointer",
fontSize:13,
fontWeight:500
};
const menuItems=[
{key:"dashboard",label:"Dashboard"},
{key:"pdc",label:"Professional Development"},
{key:"rnd",label:"Research & Development"},
{key:"credit-config",label:"Credit Rules"} 
];
const summaryHover={
transform:"translateY(-6px)",
boxShadow:"0 12px 24px rgba(0,0,0,0.15)"
};

const categoryHover={
transform:"translateY(-8px)",
boxShadow:"0 16px 28px rgba(0,0,0,0.18)"
};
const downloadSelect = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500
};