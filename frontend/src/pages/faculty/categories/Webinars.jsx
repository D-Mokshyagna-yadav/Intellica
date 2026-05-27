import ProfessionalModule from "../../../components/ProfessionalModule";
import UploadActivity from "../../../components/UploadActivity";
import API_BASE from "../../../api";
function Webinars({ onBack, facultyId, mode = "upload" }) {

  return (
    <ProfessionalModule
      title="Webinars"
      category="Webinar"
      facultyId={facultyId}
      fetchUrl={`${API_BASE}/uploads/category`}
      UploadComponent={(props) => (
        <UploadActivity
          category="Webinar"
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

export default Webinars;