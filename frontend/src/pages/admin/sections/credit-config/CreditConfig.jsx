import { useState } from "react";
import ProfessionalCredits from "./professional/ProfessionalCredits";
import RNDCredits from "./rnd/RNDCredits";
import Card from "./common/Card";

function CreditConfig() {

const [activeSection, setActiveSection] = useState(null);
const [activeCategory, setActiveCategory] = useState(null);

const handleBack = () => {
setActiveCategory(null);
setActiveSection(null);
};

if (activeSection === "professional") {
return (
<ProfessionalCredits
initialCategory={activeCategory}
onBack={handleBack}
/>
);
}

if (activeSection === "rnd") {
return (
<RNDCredits
initialCategory={activeCategory}
onBack={handleBack}
/>
);
}

return (

<div style={{ padding: 20 }}>

<h2>Credit Configuration</h2>

{/* ================= PROFESSIONAL ================= */}

<h3 style={{ marginTop: 30 }}>
Professional Development
</h3>

<div style={grid}>
{PROFESSIONAL_CATEGORIES.map((cat) => (
<Card
key={cat.key}
title={cat.label}
onClick={() => {
setActiveCategory(cat.key);
setActiveSection("professional");
}}
/>
))}
</div>

{/* ================= RND ================= */}

<h3 style={{ marginTop: 40 }}>Research & Development</h3>

<div style={grid}>
{RND_CATEGORIES.map((cat) => (
<Card
key={cat.key}
title={cat.label}
onClick={() => {
setActiveCategory(cat.key);
setActiveSection("rnd");
}}
/>
))}
</div>

</div>

);

}

/* ================= PROFESSIONAL CATEGORIES ================= */

const PROFESSIONAL_CATEGORIES = [
{ key: "conferences", label: "Conferences" },
{ key: "workshops", label: "Workshops" },
{ key: "guestLectures", label: "Guest Lectures" },
{ key: "books", label: "Books" },
{ key: "nptel", label: "NPTEL Certifications" },
{ key: "seminars", label: "Seminars" },
{ key: "webinars", label: "Webinars" },
{ key: "honorsAwards", label: "Honors & Awards" },
{ key: "certifications", label: "Certifications" },
{ key: "others", label: "Others" },
];

/* ================= RND CATEGORIES ================= */

const RND_CATEGORIES = [
{ key: "paperPublications", label: "Paper Publications" },
{ key: "fdp", label: "Faculty Development Programs" },
{ key: "researchPolicy", label: "Research Policy & R&D Committee" },
{ key: "professionalMemberships", label: "Professional Memberships" },
{ key: "iprs", label: "IPRs" },
{ key: "incubation", label: "Incubation Centre" },
{ key: "consultancy", label: "Consultancy" },
{ key: "mous", label: "MOUs" },
{ key: "researchProjects", label: "Research Projects" },
{ key: "doctoralThesis", label: "Doctoral Thesis" }
];

/* ================= GRID STYLE ================= */

const grid = {
display: "grid",
gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
gap: 20,
marginTop: 20,
};

export default CreditConfig;