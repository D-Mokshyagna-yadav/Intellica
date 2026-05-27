import ProfessionalModule from "../../../components/ProfessionalModule";
import UploadActivity from "../../../components/UploadActivity";
import API_BASE from "../../../api";
function Seminars({ onBack, facultyId, mode = "upload" }) {

  return (
    <ProfessionalModule
      title="Seminars"
      category="Seminar"
      facultyId={facultyId}
      fetchUrl={`${API_BASE}/uploads/category`}
      UploadComponent={(props) => (
        <UploadActivity
          category="Seminar"
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

export default Seminars;