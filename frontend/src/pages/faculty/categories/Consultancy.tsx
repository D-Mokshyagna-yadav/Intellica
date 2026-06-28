import ProfessionalModule from "../../../components/ProfessionalModule";
import UploadActivity from "../../../components/UploadActivity";
import API_BASE from "../../../api";
function Consultancy({ onBack, mode = "upload", facultyId = null }) {

  return (
    <ProfessionalModule
      title="Consultancy Projects"
      category="Consultancy"
      fetchUrl={`${API_BASE}/uploads/category`}
      facultyId={facultyId}
      UploadComponent={(props) => (
        <UploadActivity category="Consultancy" {...props} />
      )}
      mode={mode}
      onBack={onBack}
      roleMode={facultyId ? "faculty" : "hod"}
    />
  );

}

export default Consultancy;