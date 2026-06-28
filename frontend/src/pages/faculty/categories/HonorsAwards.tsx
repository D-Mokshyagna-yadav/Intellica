import ProfessionalModule from "../../../components/ProfessionalModule";
import UploadActivity from "../../../components/UploadActivity";
import API_BASE from "../../../api";
function HonorsAwards({ onBack, facultyId, mode = "upload" }) {

  return (
    <ProfessionalModule
      title="Honors & Awards"
      category="HonorsAwards"
      facultyId={facultyId}
      fetchUrl={`${API_BASE}/uploads/category`}
      UploadComponent={(props) => (
        <UploadActivity
          category="HonorsAwards"
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

export default HonorsAwards;