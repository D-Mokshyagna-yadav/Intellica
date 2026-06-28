import ProfessionalModule from "../../../components/ProfessionalModule";
import UploadActivity from "../../../components/UploadActivity";
import API_BASE from "../../../api";
function Publications({ onBack, mode = "upload", facultyId = null }) {

  const UploadComponent = (props) => (
    <UploadActivity category="Publication" {...props} />
  );

  return (
    <ProfessionalModule
      title="Paper Publications"
      category="Publication"
      fetchUrl={`${API_BASE}/uploads/category`}
      facultyId={facultyId}
      UploadComponent={UploadComponent}
      mode={mode}
      onBack={onBack}
      roleMode={facultyId ? "faculty" : "hod"}
    />
  );

}

export default Publications;