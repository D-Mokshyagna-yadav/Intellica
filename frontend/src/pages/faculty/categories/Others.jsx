import ProfessionalModule from "../../../components/ProfessionalModule";
import UploadActivity from "../../../components/UploadActivity";
import API_BASE from "../../../api";
function Others({ onBack, mode = "upload", facultyId = null }) {

  const UploadComponent = (props) => (
    <UploadActivity category="Others" {...props} />
  );

  return (
    <ProfessionalModule
      title="Others"
      category="Others"
      fetchUrl={`${API_BASE}/uploads/category`}
      facultyId={facultyId}
      UploadComponent={UploadComponent}
      mode={mode}
      onBack={onBack}
      roleMode={facultyId ? "faculty" : "hod"}
    />
  );
}

export default Others;