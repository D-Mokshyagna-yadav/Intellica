import ProfessionalModule from "../../../components/ProfessionalModule";
import UploadActivity from "../../../components/UploadActivity";
import API_BASE from "../../../api";
function Books({ onBack, mode = "upload", facultyId = null }) {
  const [year, setYear] = useState("");
  const UploadComponent = (props) => (
    <UploadActivity category="Book"year={year}setYear={setYear}{...props} />
  );

  return (
    <ProfessionalModule
      title="Books"
      category="Book"
      fetchUrl={`${API_BASE}/uploads/category`}
      facultyId={facultyId}
      UploadComponent={UploadComponent}
      mode={mode}
      onBack={onBack}
      roleMode={facultyId ? "faculty" : "hod"}
    />
  );

}

export default Books;