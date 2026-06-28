import { useState } from "react";
import ProfessionalCredits from "./professional/ProfessionalCredits";
import RNDCredits from "./rnd/RNDCredits";
import Card from "./common/Card";
import { Settings, BookOpen, FlaskConical } from "lucide-react";

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
    <div className="w-full">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold text-on-surface mb-2 flex items-center gap-3">
          <Settings className="text-primary" size={32} />
          Credit Configuration
        </h1>
        <p className="text-on-surface-variant font-body-md">
          Configure default credits and rules for all academic and research activities.
        </p>
      </div>

      {/* Professional Development */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <BookOpen size={20} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Professional Development</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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
      </div>

      {/* Research & Development */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <FlaskConical size={20} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Research & Development</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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

export default CreditConfig;