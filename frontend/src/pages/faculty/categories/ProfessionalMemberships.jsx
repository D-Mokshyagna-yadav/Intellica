import ProfessionalModule from "../../../components/ProfessionalModule";
import UploadActivity from "../../../components/UploadActivity";
import API_BASE from "../../../api";
function ProfessionalMembership({ onBack, facultyId, mode = "upload" }) {

  return (
    <ProfessionalModule
      title="Professional Membership"
      category="ProfessionalMembership"
      facultyId={facultyId}
      fetchUrl={`${API_BASE}/uploads/category`}
      UploadComponent={(props) => (
        <UploadActivity
          category="ProfessionalMembership"
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

export default ProfessionalMembership;