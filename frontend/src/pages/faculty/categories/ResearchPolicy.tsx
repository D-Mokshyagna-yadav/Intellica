import ProfessionalModule from "../../../components/ProfessionalModule";
import UploadActivity from "../../../components/UploadActivity";
import API_BASE from "../../../api";
function ResearchPolicy({ onBack, facultyId, mode = "upload" }) {

  return (
    <ProfessionalModule
      title="Research Policy / R&D Committee"
      category="ResearchPolicy"
      facultyId={facultyId}
      fetchUrl={`${API_BASE}/uploads/category`}
      UploadComponent={(props) => (
        <UploadActivity
          category="ResearchPolicy"
          facultyId={facultyId}
          {...props}
        />
      )}
      mode={mode}
      onBack={onBack}
      roleMode={facultyId ? "faculty" : "hod"}
    />
  );

}

export default ResearchPolicy;