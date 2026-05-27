import ProfessionalModule from "../../../components/ProfessionalModule";
import UploadActivity from "../../../components/UploadActivity";
import API_BASE from "../../../api";
function DoctoralThesis({ onBack, facultyId, mode = "upload" }) {

  const UploadComponent = (props) => (
    <UploadActivity
      category="doctoralThesis"
      facultyId={facultyId}
      {...props}
    />
  );

  return (
    <ProfessionalModule
      title="Doctoral Thesis Guided / Guiding"
      category="doctoralThesis"
      facultyId={facultyId}
      fetchUrl={`${API_BASE}/uploads/category`}
      UploadComponent={UploadComponent}
      mode={mode}
      onBack={onBack}
      roleMode={facultyId ? "faculty" : "hod"}
    />
  );

}

export default DoctoralThesis;