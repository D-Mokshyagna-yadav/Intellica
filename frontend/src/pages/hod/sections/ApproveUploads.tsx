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
    <div className="w-full">
      <div className="mb-8">
        <h2 className="font-hero-title text-hero-title text-on-surface">Approve Faculty Uploads</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Review submitted academic activities and assign credits.</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="bg-surface-container-low border border-subtle rounded-lg px-4 py-2 font-body-md text-on-surface focus:outline-none focus:border-primary-container"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>

        <select
          value={facultyFilter}
          onChange={(event) => setFacultyFilter(event.target.value)}
          className="bg-surface-container-low border border-subtle rounded-lg px-4 py-2 font-body-md text-on-surface focus:outline-none focus:border-primary-container"
        >
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
          className="bg-surface-container-low border border-subtle rounded-lg px-4 py-2 font-body-md text-on-surface focus:outline-none focus:border-primary-container min-w-[240px]"
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-md text-headline-md text-on-surface flex items-center">
          <span className="material-symbols-outlined mr-2 text-primary-container">pending_actions</span>
          Pending Approvals
        </h3>
        <span className="bg-surface-variant text-on-surface font-label-md text-label-md px-2.5 py-1 rounded-full border border-subtle">
          {filteredUploads.length} Items
        </span>
      </div>

      <div className="space-y-4">
        {filteredUploads.length === 0 ? (
          <div className="bg-glass-card rounded-xl p-8 text-center text-on-surface-variant font-body-lg">
            No pending approvals found.
          </div>
        ) : (
          filteredUploads.map((upload) => (
            <div key={upload._id} className="bg-glass-card rounded-xl p-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 group hover:border-primary-container/30 transition-colors duration-300">
              <div className="flex items-start space-x-4 w-full xl:w-auto flex-1">
                <div className="w-12 h-12 rounded-lg bg-surface-container-high border border-subtle flex items-center justify-center shrink-0 cursor-pointer hover:bg-surface-bright/20" onClick={() => setSelectedUpload(upload)}>
                  <span className="material-symbols-outlined text-tertiary-container text-2xl">description</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-headline-md text-body-lg font-semibold text-on-surface cursor-pointer hover:text-primary-container transition-colors" onClick={() => setSelectedUpload(upload)}>
                    {upload.faculty?.name} <span className="text-on-surface-variant text-sm font-normal">({upload.faculty?.employeeId})</span>
                  </h4>
                  <div className="flex flex-wrap items-center mt-1 gap-2 text-on-surface-variant">
                    <span className="bg-primary-container/10 text-primary-container font-label-sm text-label-sm px-2 py-0.5 rounded border border-primary-container/20 uppercase">
                      {upload.category}
                    </span>
                    <span className="font-body-md text-label-md text-on-surface-variant/70">•</span>
                    <span className="font-body-md text-label-md text-on-surface line-clamp-1">{upload.displayTitle}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                     <p className="font-body-md text-label-md text-on-surface-variant/70">
                        Requested Credits: <strong className="text-on-surface">{upload.credits}</strong>
                     </p>
                     {upload.status === "DISCUSSION" && (
                       <span className="text-accent-red font-label-md text-label-md">IN DISCUSSION</span>
                     )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0 pt-4 xl:pt-0 border-t xl:border-t-0 border-subtle xl:border-transparent">
                <button
                  onClick={() => openDiscussionModal(upload._id)}
                  className="btn-ghost font-label-md text-label-md px-4 py-2 rounded-lg text-on-surface flex-1 xl:flex-none hover:text-accent-red hover:border-accent-red/30"
                >
                  Discuss
                </button>
                <button
                  onClick={() => setSelectedUpload(upload)}
                  className="bg-surface-container-high hover:bg-surface-bright font-label-md text-label-md px-4 py-2 rounded-lg text-on-surface border border-subtle transition-colors flex-1 xl:flex-none"
                >
                  Review
                </button>
                <button
                  onClick={() => handleApprove(upload._id)}
                  className="btn-primary font-label-md text-label-md px-4 py-2 rounded-lg text-white flex-1 xl:flex-none"
                >
                  Approve
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-glass-modal rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-subtle shadow-2xl">
            <div className="p-6 border-b border-subtle flex justify-between items-center bg-surface-container-low/50">
              <h2 className="font-headline-md text-headline-md text-on-surface">{selectedUpload.displayTitle}</h2>
              <button onClick={() => setSelectedUpload(null)} className="text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 text-on-surface space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-glass-card p-4 rounded-xl">
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Faculty</p>
                  <p className="font-medium">{selectedUpload.faculty?.name} ({selectedUpload.faculty?.employeeId})</p>
                </div>
                <div className="bg-glass-card p-4 rounded-xl">
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Category & Credits</p>
                  <p className="font-medium">{selectedUpload.category} • {selectedUpload.credits} Cr</p>
                </div>
              </div>

              {selectedUpload.comment && (
                <div className="bg-accent-red/10 border border-accent-red/30 p-4 rounded-xl">
                  <p className="text-label-sm text-accent-red font-bold uppercase tracking-wider mb-1">Discussion Comment</p>
                  <p className="text-on-surface">{selectedUpload.comment}</p>
                </div>
              )}

              <div className="mt-6">
                 <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Submission Details</h3>
                 <div className="space-y-2">
                  {Object.entries(selectedUpload.metadata || {}).map(([key, value]) => {
                    if (!value) return null;
                    const isChanged = (selectedUpload.changedFields || []).includes(key);
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-lg flex justify-between items-center ${isChanged ? 'bg-primary-container/20 border border-primary-container/30' : 'bg-surface-bright/10 border border-subtle'}`}
                      >
                        <span className="text-on-surface-variant font-medium">{formatFieldName(key)}</span>
                        <span className="text-on-surface text-right break-words max-w-[60%]">{String(value)}</span>
                      </div>
                    );
                  })}
                 </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-subtle bg-surface-container-low/50 flex justify-between items-center">
               <div>
                  {selectedUpload.filePath && (
                    <div className="flex gap-4">
                      <a href={getFileUrl(selectedUpload.filePath)} target="_blank" rel="noreferrer" className="flex items-center text-primary-container hover:text-primary transition-colors font-medium text-sm">
                        <span className="material-symbols-outlined mr-1 text-sm">open_in_new</span>
                        Open in New Tab
                      </a>
                      <a href={getFileUrl(selectedUpload.filePath)} download target="_blank" rel="noreferrer" className="flex items-center text-accent-green hover:text-accent-green/80 transition-colors font-medium text-sm">
                        <span className="material-symbols-outlined mr-1 text-sm">download</span>
                        Download File
                      </a>
                    </div>
                  )}
               </div>
               <div className="flex gap-3">
                  <button onClick={() => setSelectedUpload(null)} className="btn-ghost px-4 py-2 rounded-lg text-sm text-on-surface">Close</button>
                  <button onClick={() => { setSelectedUpload(null); handleApprove(selectedUpload._id); }} className="btn-primary px-4 py-2 rounded-lg text-sm text-white">Approve Now</button>
               </div>
            </div>
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

