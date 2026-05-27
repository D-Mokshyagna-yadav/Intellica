import ProfessionalModule from "../../../components/ProfessionalModule";
import UploadActivity from "../../../components/UploadActivity";
import API_BASE from "../../../api";
function FDP({ onBack, facultyId, mode = "upload" }) {

  return (
    <ProfessionalModule
      title="Faculty Development Programs (FDP)"
      category="FDP"
      facultyId={facultyId}
      fetchUrl={`${API_BASE}/uploads/category`}
      UploadComponent={(props) => (
        <UploadActivity
          category="FDP"
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

export default FDP;