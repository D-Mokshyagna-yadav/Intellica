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
import API_BASE, { apiFetch, getFileUrl } from "../../api";
import CreditConfigViewer from "../admin/sections/credit-config/common/CreditConfigViewer";
import { buildYearOptions } from "../../constants/years";
import { CATEGORY_FILTER_OPTIONS } from "../../constants/categories";
import LoadingState from "../../components/LoadingState";
import { showToast } from "../../utils/toast";

const ALL_YEARS = buildYearOptions(2000);

export default function FacultyDashboard({ readOnly = false, facultyId = null }) {
const navigate = useNavigate();
const responsive = useResponsive();
const isHODView = readOnly && facultyId;
const [view,setView]=useState("dashboard");
const [uploads,setUploads]=useState([]);

const availableCategories = CATEGORY_FILTER_OPTIONS;

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
const [loading, setLoading] = useState(true);

const fileInputRef=useRef(null);
const token=localStorage.getItem("token");



/* LOGOUT */

const handleLogout = () => {
  localStorage.clear();
  navigate("/");
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
.catch((error)=>showToast({ type:"error", message:error.message || "Failed to load profile" }));

},[token, facultyId]);

useEffect(() => {
  const fetchRank = async () => {
    try {
      if (!token && !readOnly) {
        navigate("/");
        return;
      }
      const myData = await apiFetch(`/ranking/me`);
      if (myData) {
        setRankData({
          departmentRank:  myData.departmentRank,
          departmentTotal: myData.departmentTotal,
          collegeRank:     myData.collegeRank,
          collegeTotal:    myData.collegeTotal,
          score:           myData.score
        });
      }

    } catch (err) {
      showToast({ type: "error", message: err.message || "Failed to load ranking" });
    }
  };

  if (token) fetchRank();
}, [token, facultyId]);

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
showToast({ type:"error", message:"Failed to load uploads" });
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
showToast({ type:"error", message:err.message || "Failed to load uploads" });
setUploads([]);
})
.finally(()=>setLoading(false));

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
showToast({ type:"success", message:"Profile image updated" });
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
  return status === "FACULTY_SUBMITTED" || status === "HOD_COMMENT" || status === "ADMIN_COMMENT";
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
membership:byCategory("professionalmembership"),
ipr:byCategory("ipr"),
consultancy:byCategory("consultancy"),
incubation:byCategory("incubation"),
doctoralThesis:byCategory("doctoralthesis"),
researchProjects:byCategory("researchproject")
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

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      showToast({ type:"error", message:"Download failed" });
      return;
    }

    const blob = await res.blob();

    if (blob.size === 0) {
      showToast({ type:"error", message:"No report data found" });
      return;
    }

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "faculty_activities.xlsx";
    link.click();

  } catch (err) {
    showToast({ type:"error", message:err.message || "Download failed" });
  }
};

if (loading) {
return <div style={{ paddingTop: 120, paddingInline: 32 }}><LoadingState message="Loading faculty dashboard..." /></div>;
}



return(
<div className="w-full">
  <div className="flex gap-3 flex-wrap mb-8 bg-surface-container-low/30 p-2 rounded-xl border border-subtle">
    {menuItems.map(item => (
      <button 
        key={item.key} 
        onClick={() => {
          if (readOnly) setCategoryMode("approved");
          else setCategoryMode("upload");
          setView(item.key);
        }} 
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          view === item.key 
            ? "bg-primary-container text-on-primary-container shadow-sm" 
            : "text-on-surface hover:bg-surface-bright/20"
        }`}
      >
        {item.label}
      </button>
    ))}
  </div>

  <div className="w-full relative">

{/* DASHBOARD */}

{view==="dashboard"&&(

<>

<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
  <h2 className="text-2xl font-display font-bold text-on-surface">Academic Performance Overview</h2>
  <div className="flex gap-3 flex-wrap items-center">
    <select
      className="bg-surface-container-low border border-subtle text-on-surface rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-all"
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
      className="bg-surface-container-low border border-subtle text-on-surface rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-all"
      value={selectedYear}
      onChange={(e) => setSelectedYear(e.target.value)}
    >
      <option value="">Year</option>
      <option value="All">ALL</option>
      {ALL_YEARS.map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
    <button className="btn-primary flex items-center gap-2 px-5 py-2" onClick={handleDownload}>
      ⬇ Download
    </button>
  </div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-8">
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

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

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
);

}

/* COMPONENTS */

function SummaryCard({ title, value }) {
  return (
    <div className="bg-glass-card rounded-2xl p-6 border border-subtle flex flex-col items-center justify-center text-center transition-all hover:border-primary/50 hover:shadow-lg group">
      <h2 className="text-3xl font-display font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">{value}</h2>
      <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">{title}</p>
    </div>
  );
}

function CategoryCard({ title, value, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-glass-card rounded-2xl p-5 border border-subtle flex flex-col cursor-pointer transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 group"
    >
      <h3 className="text-lg font-bold text-on-surface mb-1 truncate" title={title}>{title}</h3>
      <p className="text-on-surface-variant text-xs uppercase tracking-wider font-semibold mb-4">Credits Earned</p>
      <div className="mt-auto flex items-end justify-between">
        <h2 className="text-3xl font-display font-bold text-primary">{value}</h2>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-primary text-xl">→</span>
        </div>
      </div>
    </div>
  );
}


const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "pdc", label: "Professional Development" },
  { key: "rnd", label: "Research & Development" },
  { key: "credit-config", label: "Credit Rules" }
];
