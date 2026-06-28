import { useState, useEffect } from "react";
import { API_BASE, getFileUrl } from "../../../api";
import { showToast } from "../../../utils/toast";
import { CATEGORY_FILTER_OPTIONS, CATEGORY_LABELS } from "../../../constants/categories";
import ConfirmModal from "../../../components/ConfirmModal";
import { useDepartments } from "../../../hooks/useDepartments";
import { Search, Filter, CheckCircle, MessageSquareWarning, ExternalLink, FileText, X } from "lucide-react";

function ApproveHodUploads() {
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [deptFilter, setDeptFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [empFilter, setEmpFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [discussionModalOpen, setDiscussionModalOpen] = useState(false);
  const [discussionUploadId, setDiscussionUploadId] = useState(null);
  const { data: departments = [] } = useDepartments();

  const token = localStorage.getItem("token");

  const openDetails = (upload) => {
    setSelectedUpload(upload);
  };

  /* ================= FETCH PENDING ================= */
  const fetchUploads = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/pending-uploads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUploads(data);
    } catch (err) {
      showToast({ type: "error", message: err.message || "Failed to load uploads" });
    }
  };

  useEffect(() => { fetchUploads(); }, []);

  /* ================= APPROVE ================= */
  const approveUpload = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/approve-upload/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchUploads();
    } catch (err) {
      showToast({ type: "error", message: err.message || "Approval failed" });
    }
  };

  /* ================= DISCUSSION ================= */
  const openDiscussionModal = (id) => {
    setDiscussionUploadId(id);
    setDiscussionModalOpen(true);
  };

  const handleDiscussionConfirm = async (comment) => {
    if (!comment) return;
    setDiscussionModalOpen(false);
    try {
      const res = await fetch(`${API_BASE}/admin/discussion/${discussionUploadId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comment })
      });
      if (res.ok) fetchUploads();
    } catch (err) {
      showToast({ type: "error", message: err.message || "Discussion failed" });
    }
  };

  /* ================= HELPERS ================= */
  const getTitle = (item) => {
    const m = item.metadata || {};
    return (
      item.title || m.title || m.paperTitle || m.conferenceTitle || m.conferenceName ||
      m.workshopTitle || m.fdpTitle || m.bookTitle || m.courseName || m.awardName ||
      m.policyName || m.projectTitle || m.startupName || m.organization || m.topic ||
      m.schemeName || m.activityTitle || m.programTitle || "-"
    );
  };

  const getFaculty = (item) => item.faculty || item.facultyId || {};

  const filteredUploads = uploads.filter((item) => {
    const faculty = getFaculty(item);
    if (deptFilter && (item.department || "").toLowerCase() !== deptFilter.toLowerCase()) return false;
    if (categoryFilter && (item.category || "").toLowerCase() !== categoryFilter.trim().toLowerCase()) return false;
    if (empFilter && !(faculty.employeeId || "").toLowerCase().includes(empFilter.toLowerCase())) return false;
    if (nameFilter && !(faculty.name || "").toLowerCase().includes(nameFilter.toLowerCase())) return false;
    return true;
  });

  const inputClass = "w-full bg-surface-container-low border border-subtle text-on-surface rounded-xl pl-10 pr-4 py-2 outline-none focus:border-primary transition-all text-sm";
  const selectClass = "bg-surface-container-low border border-subtle text-on-surface rounded-xl px-4 py-2 outline-none focus:border-primary transition-all text-sm";

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-on-surface mb-2">Approve HOD Uploads</h1>
        <p className="text-on-surface-variant font-body-md">
          Review and approve achievements uploaded by Head of Departments.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-glass-card rounded-2xl p-6 border border-subtle mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm mr-2">
          <Filter size={16} /> Filters:
        </div>
        
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-on-surface-variant" />
          </div>
          <input
            placeholder="Search Employee ID"
            value={empFilter}
            onChange={(e) => setEmpFilter(e.target.value)}
            className={inputClass}
          />
        </div>
        
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-on-surface-variant" />
          </div>
          <input
            placeholder="Search Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className={inputClass}
          />
        </div>

        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className={selectClass}>
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.code} value={d.code}>{d.name}</option>
          ))}
        </select>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClass}>
          <option value="">All Categories</option>
          {CATEGORY_FILTER_OPTIONS.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filteredUploads.length === 0 ? (
        <div className="bg-glass-card rounded-2xl p-12 border border-subtle flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">All Caught Up!</h3>
          <p className="text-on-surface-variant">No HOD uploads match your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUploads.map((item) => {
            const faculty = getFaculty(item);
            return (
              <div key={item._id} className="bg-glass-card rounded-2xl p-6 border border-subtle flex flex-col">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/15 text-primary border border-primary/20 break-words line-clamp-1">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </span>
                  <span className="text-xs font-bold text-primary bg-surface-bright/50 px-2 py-1 rounded border border-subtle whitespace-nowrap">
                    {item.credits} Credits
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-on-surface mb-4 line-clamp-2" title={getTitle(item)}>
                  {getTitle(item)}
                </h3>
                
                <div className="bg-surface-bright/20 p-3 rounded-lg border border-subtle/50 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">HOD:</span>
                    <span className="font-medium text-on-surface truncate ml-2" title={faculty.name}>{faculty.name || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Dept:</span>
                    <span className="font-medium text-on-surface truncate ml-2">{item.department || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Emp ID:</span>
                    <span className="font-medium text-on-surface font-mono">{faculty.employeeId || "-"}</span>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => openDetails(item)}
                    className="col-span-2 bg-surface-bright/50 hover:bg-surface-bright text-on-surface font-medium rounded-xl py-2 transition-all border border-subtle flex items-center justify-center gap-2 text-sm"
                  >
                    <ExternalLink size={14} /> View Full Details
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => approveUpload(item._id)}
                    className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl py-2.5 transition-all border border-emerald-500/20 flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button
                    onClick={() => openDiscussionModal(item._id)}
                    className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-xl py-2.5 transition-all border border-amber-500/20 flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageSquareWarning size={16} /> Discuss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-glass-modal border border-subtle rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-subtle/50 bg-surface-container-low/30">
              <h2 className="text-2xl font-display font-bold text-on-surface pr-4 line-clamp-1">{getTitle(selectedUpload)}</h2>
              <button 
                onClick={() => setSelectedUpload(null)}
                className="p-2 rounded-full hover:bg-surface-bright/50 text-on-surface-variant transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-surface-bright/20 p-3 rounded-xl border border-subtle/50">
                  <p className="text-xs text-on-surface-variant mb-1 font-semibold">HOD</p>
                  <p className="font-medium text-on-surface">{getFaculty(selectedUpload).name || "-"}</p>
                </div>
                <div className="bg-surface-bright/20 p-3 rounded-xl border border-subtle/50">
                  <p className="text-xs text-on-surface-variant mb-1 font-semibold">Emp ID</p>
                  <p className="font-medium text-on-surface font-mono">{getFaculty(selectedUpload).employeeId || "-"}</p>
                </div>
                <div className="bg-surface-bright/20 p-3 rounded-xl border border-subtle/50">
                  <p className="text-xs text-on-surface-variant mb-1 font-semibold">Category</p>
                  <p className="font-medium text-on-surface">{CATEGORY_LABELS[selectedUpload.category] || selectedUpload.category}</p>
                </div>
                <div className="bg-surface-bright/20 p-3 rounded-xl border border-subtle/50">
                  <p className="text-xs text-on-surface-variant mb-1 font-semibold">Credits</p>
                  <p className="font-bold text-primary">{selectedUpload.credits}</p>
                </div>
              </div>

              {(selectedUpload.hodComment || selectedUpload.adminComment) && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mb-6">
                  <p className="font-bold text-amber-400 mb-1 flex items-center gap-2">
                    <MessageSquareWarning size={16} /> Discussion Comments
                  </p>
                  <p className="text-amber-200/80 text-sm">{selectedUpload.hodComment || selectedUpload.adminComment}</p>
                </div>
              )}

              <h3 className="text-lg font-bold text-on-surface mb-4">Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-6">
                {selectedUpload.metadata && Object.entries(selectedUpload.metadata)
                  .filter(([key, value]) =>
                    !["guidedDetails", "guidingDetails"].includes(key) &&
                    value !== "" && value !== null && value !== undefined &&
                    !(Array.isArray(value) && value.length === 0)
                  )
                  .map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
                    const isChanged = (selectedUpload.changedFields || []).map(f => f.toLowerCase().trim()).includes(key.toLowerCase().trim());
                    return (
                      <div key={key} className={`flex items-start gap-2 py-2 border-b border-subtle/30 ${isChanged ? "bg-warning-container/20 px-2 rounded -mx-2 border-transparent" : ""}`}>
                        <span className="text-on-surface-variant font-medium text-sm min-w-[120px]">{label}:</span>
                        <span className="text-on-surface text-sm break-words">{String(value)}</span>
                      </div>
                    );
                  })}
              </div>

              {selectedUpload.filePath && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                    <FileText size={18} /> Proof Document
                  </h3>
                  <div className="border border-subtle rounded-xl overflow-hidden bg-surface-container-low h-[400px]">
                    <iframe
                      title="Proof PDF"
                      src={getFileUrl(selectedUpload.filePath)}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex gap-4">
                    <a
                      href={getFileUrl(selectedUpload.filePath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                    >
                      <ExternalLink size={14} /> Open in New Tab
                    </a>
                    <a
                      href={getFileUrl(selectedUpload.filePath)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-accent-green hover:text-accent-green/80 font-medium text-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">download</span> Download File
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-subtle/50 bg-surface-container-low/30 flex justify-end">
              <button
                onClick={() => setSelectedUpload(null)}
                className="px-6 py-2 bg-surface-bright/50 hover:bg-surface-bright text-on-surface font-medium rounded-xl transition-all border border-subtle"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={discussionModalOpen}
        title="Request Discussion"
        message="Enter discussion comment for HOD upload:"
        type="prompt"
        placeholder="Reason for discussion"
        onConfirm={handleDiscussionConfirm}
        onCancel={() => setDiscussionModalOpen(false)}
      />
    </div>
  );
}

export default ApproveHodUploads;
