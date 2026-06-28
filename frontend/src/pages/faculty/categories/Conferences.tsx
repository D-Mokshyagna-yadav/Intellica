import ProfessionalModule from "../../../components/ProfessionalModule";
import UploadActivity from "../../../components/UploadActivity";
import API_BASE from "../../../api";
function Conferences({ onBack, mode = "upload", facultyId = null }) {

  return (

    <ProfessionalModule
      title="Conferences"
      category="Conference"
      fetchUrl={`${API_BASE}/uploads/category`}
      facultyId={facultyId}
      UploadComponent={(props) => (
        <UploadActivity category="Conference" {...props} />
      )}
      mode={mode}
      onBack={onBack}
      roleMode={facultyId ? "faculty" : "hod"}
    />

  );

}

export default Conferences;