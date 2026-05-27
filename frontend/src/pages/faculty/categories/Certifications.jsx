import ProfessionalModule from "../../../components/ProfessionalModule";
import UploadActivity from "../../../components/UploadActivity";
import API_BASE from "../../../api";

function Certifications({ onBack, mode = "upload", facultyId = null }) {

  return (
    <ProfessionalModule
      title="Certifications"
      category="Certification"
      fetchUrl={`${API_BASE}/uploads/category`}
      facultyId={facultyId}
      UploadComponent={(props) => (
        <UploadActivity category="Certification" {...props} />
      )}
      mode={mode}
      onBack={onBack}
      roleMode={facultyId ? "faculty" : "hod"}
    />
  );

}

export default Certifications;