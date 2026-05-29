import { useEffect, useMemo, useState } from "react";
import { apiFetch, getFileUrl } from "../../../api";
import LoadingState from "../../../components/LoadingState";
import { showToast } from "../../../utils/toast";
import ConfirmModal from "../../../components/ConfirmModal";

function ApproveUploads() {
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [discussionModalOpen, setDiscussionModalOpen] = useState(false);
  const [discussionUploadId, setDiscussionUploadId] = useState(null);

  const fetchPendingUploads = async () => {
    try {
      setLoading(true);
      const result = await apiFetch("/uploads/hod/pending");
      const flattened = (result || []).map((item) => ({
        ...item,
        metadata: item.metadata || {},
        displayTitle: getTitle(item),
        comment: item.hodComment || item.adminComment || "",
        changedFields: item.changedFields || [],
      }));
      setUploads(flattened);
    } catch (error) {
      setUploads([]);
      showToast({ type: "error", message: error.message || "Failed to fetch uploads" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUploads();
  }, []);

  const categories = useMemo(() => [...new Set(uploads.map((upload) => upload.category).filter(Boolean))], [uploads]);
  const faculties = useMemo(() => [...new Set(uploads.map((upload) => upload.faculty?.name).filter(Boolean))], [uploads]);

  const filteredUploads = uploads.filter((upload) => {
    if (categoryFilter && upload.category !== categoryFilter) return false;
    if (facultyFilter && upload.faculty?.name !== facultyFilter) return false;
    if (searchTitle && !upload.displayTitle.toLowerCase().includes(searchTitle.toLowerCase())) return false;
    return true;
  });

  const handleApprove = async (id) => {
    try {
      await apiFetch(`/uploads/hod/approve/${id}`, { method: "PUT" });
      showToast({ type: "success", message: "Upload approved" });
      fetchPendingUploads();
    } catch (error) {
      showToast({ type: "error", message: error.message || "Approval failed" });
    }
  };

  const openDiscussionModal = (id) => {
    setDiscussionUploadId(id);
    setDiscussionModalOpen(true);
  };

  const handleDiscussionConfirm = async (comment) => {
    if (!comment?.trim()) {
      showToast({ type: "error", message: "Comment required" });
      return;
    }
    setDiscussionModalOpen(false);

    try {
      await apiFetch(`/uploads/discussion/${discussionUploadId}`, {
        method: "PUT",
        body: JSON.stringify({ comment }),
      });
      showToast({ type: "success", message: "Discussion comment sent" });
      fetchPendingUploads();
    } catch (error) {
      showToast({ type: "error", message: error.message || "Discussion failed" });
    }
  };

  if (loading) {
    return <LoadingState message="Loading pending uploads..." />;
  }

  return (
    <div style={pageContainer}>
      <div style={headerSection}>
        <h1 style={title}>Approve Faculty Uploads</h1>
        <p style={subtitle}>Review submitted academic activities and assign credits.</p>
      </div>

      <div style={filterWrapper}>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} style={filterSelect}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>

        <select value={facultyFilter} onChange={(event) => setFacultyFilter(event.target.value)} style={filterSelect}>
          <option value="">All Faculty</option>
          {faculties.map((faculty) => (
            <option key={faculty}>{faculty}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by title..."
          value={searchTitle}
          onChange={(event) => setSearchTitle(event.target.value)}
          style={searchInput}
        />
      </div>

      <div style={scrollWrapper}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Faculty</th>
              <th style={th}>Category</th>
              <th style={th}>Title</th>
              <th style={th}>Credits</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUploads.map((upload) => (
              <tr key={upload._id}>
                <td style={td}>{upload.faculty?.name} ({upload.faculty?.employeeId})</td>
                <td style={td}>{upload.category}</td>
                <td style={td}>{upload.displayTitle}</td>
                <td style={td}>{upload.credits}</td>
                <td style={td}>{upload.status}</td>
                <td style={td}>
                  <div style={actionWrapper}>
                    <button style={viewBtn} onClick={() => setSelectedUpload(upload)}>View Details</button>
                    <button style={approveBtn} onClick={() => handleApprove(upload._id)}>Approve</button>
                    <button style={discussionBtn} onClick={() => openDiscussionModal(upload._id)}>Call for Discussion</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUpload && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2>{selectedUpload.displayTitle}</h2>
            <p><b>Faculty:</b> {selectedUpload.faculty?.name} ({selectedUpload.faculty?.employeeId})</p>
            <p><b>Category:</b> {selectedUpload.category}</p>
            <p><b>Status:</b> {selectedUpload.status}</p>
            <p><b>Credits:</b> {selectedUpload.credits}</p>

            {selectedUpload.comment && (
              <div style={{ background: "#fee2e2", border: "1px solid #f87171", padding: 10, borderRadius: 6, marginTop: 10 }}>
                <b>Comment</b>
                <p>{selectedUpload.comment}</p>
              </div>
            )}

            <hr />

            {Object.entries(selectedUpload.metadata || {}).map(([key, value]) => {
              if (!value) return null;
              return (
                <p
                  key={key}
                  style={{
                    background: (selectedUpload.changedFields || []).includes(key) ? "#fde68a" : "transparent",
                    padding: "4px 6px",
                    borderRadius: 4,
                  }}
                >
                  <b>{formatFieldName(key)}</b> : {String(value)}
                </p>
              );
            })}

            {selectedUpload.filePath && (
              <a href={getFileUrl(selectedUpload.filePath)} target="_blank" rel="noreferrer" style={pdfBtn}>
                View PDF
              </a>
            )}

            <br />
            <button style={closeBtn} onClick={() => setSelectedUpload(null)}>Close</button>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={discussionModalOpen}
        title="Request Discussion"
        message="Enter discussion comment for faculty upload:"
        type="prompt"
        placeholder="Reason for discussion"
        onConfirm={handleDiscussionConfirm}
        onCancel={() => setDiscussionModalOpen(false)}
      />
    </div>
  );
}

function getTitle(item) {
  const metadata = item.metadata || {};
  return (
    item.title ||
    metadata.title ||
    metadata.paperTitle ||
    metadata.conferenceTitle ||
    metadata.conferenceName ||
    metadata.workshopTitle ||
    metadata.fdpTitle ||
    metadata.bookTitle ||
    metadata.courseName ||
    metadata.awardName ||
    metadata.policyName ||
    metadata.projectTitle ||
    metadata.startupName ||
    metadata.organization ||
    metadata.topic ||
    "-"
  );
}

function formatFieldName(field) {
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}

export default ApproveUploads;

const pageContainer = { width: "100%", paddingTop: 20 };
const headerSection = { marginBottom: 30 };
const title = { fontSize: 26, fontWeight: 700, color: "#0F172A", marginBottom: 8 };
const subtitle = { fontSize: 14, color: "#334155" };
const filterWrapper = { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" };
const filterSelect = { padding: "8px 14px", borderRadius: 8, border: "1px solid #cbd5f5", backgroundColor: "#f8fafc", fontSize: 14, minWidth: 180 };
const searchInput = { padding: "8px 14px", borderRadius: 8, border: "1px solid #cbd5f5", fontSize: 14, minWidth: 240 };
const scrollWrapper = { overflowX: "auto" };
const table = { minWidth: "900px", borderCollapse: "collapse", backgroundColor: "white", borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.06)" };
const th = { padding: "18px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: 600 };
const td = { padding: "18px 20px", borderBottom: "1px solid #e2e8f0" };
const actionWrapper = { display: "flex", gap: 10 };
const viewBtn = { padding: "6px 12px", backgroundColor: "#2563eb", color: "white", borderRadius: 8, border: "none", cursor: "pointer" };
const approveBtn = { padding: "6px 16px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: 8, cursor: "pointer" };
const discussionBtn = { padding: "6px 16px", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: 8, cursor: "pointer" };
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center" };
const modalBox = { background: "white", padding: 25, borderRadius: 10, width: 500, maxHeight: "80vh", overflowY: "auto" };
const pdfBtn = { display: "inline-block", marginTop: 10, padding: "6px 12px", background: "#2563eb", color: "white", borderRadius: 6, textDecoration: "none" };
const closeBtn = { marginTop: 15, padding: "6px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: 6, cursor: "pointer" };
