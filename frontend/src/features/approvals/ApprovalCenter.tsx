import { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, XCircle, MessageCircle, Clock, AlertCircle, Search, Filter, ChevronDown } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function ApprovalCenter() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [sortBy, setSortBy] = useState('date-desc');

  const userRole = localStorage.getItem('user_role');
  const isHOD = userRole === 'HOD';
  const isAdmin = userRole === 'ADMIN';

  // Fetch pending approvals
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        let url = '/uploads/pending';
        
        if (isHOD) {
          url += '?status=HOD_PENDING';
        } else if (isAdmin) {
          url += '?status=ADMIN_PENDING';
        }
        
        const data = await apiFetch(url);
        setUploads(Array.isArray(data) ? data : []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load approvals' });
        setUploads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, [isHOD, isAdmin]);

  // Filter and search logic
  const filteredUploads = useMemo(() => {
    let result = uploads;

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(u => {
        const status = (u.status || '').toUpperCase();
        if (filterStatus === 'pending') return status.includes('PENDING');
        if (filterStatus === 'approved') return status.includes('APPROVED');
        if (filterStatus === 'rejected') return status.includes('REJECTED');
        if (filterStatus === 'commented') return status.includes('COMMENT');
        return true;
      });
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u =>
        (u.facultyName || '').toLowerCase().includes(query) ||
        (u.category || '').toLowerCase().includes(query) ||
        (u.title || '').toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'name') return (a.facultyName || '').localeCompare(b.facultyName || '');
      if (sortBy === 'credits-high') return (b.credits || 0) - (a.credits || 0);
      if (sortBy === 'credits-low') return (a.credits || 0) - (b.credits || 0);
      return 0;
    });

    return result;
  }, [uploads, filterStatus, searchQuery, sortBy]);

  const handleApprove = async (uploadId) => {
    try {
      await apiFetch(`/uploads/${uploadId}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ status: isHOD ? 'HOD_APPROVED' : 'ADMIN_APPROVED' }),
      });
      showToast({ type: 'success', message: 'Upload approved successfully' });
      setUploads(u => u.filter(x => x._id !== uploadId));
      setSelectedUpload(null);
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to approve' });
    }
  };

  const handleReject = async (uploadId) => {
    if (!comment.trim()) {
      showToast({ type: 'warning', message: 'Please provide a reason for rejection' });
      return;
    }

    try {
      setSubmittingComment(true);
      await apiFetch(`/uploads/${uploadId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: isHOD ? 'HOD_REJECTED' : 'ADMIN_REJECTED',
          comments: comment 
        }),
      });
      showToast({ type: 'success', message: 'Upload rejected' });
      setUploads(u => u.filter(x => x._id !== uploadId));
      setSelectedUpload(null);
      setComment('');
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to reject' });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddComment = async (uploadId) => {
    if (!comment.trim()) {
      showToast({ type: 'warning', message: 'Please enter a comment' });
      return;
    }

    try {
      setSubmittingComment(true);
      await apiFetch(`/uploads/${uploadId}/comment`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: isHOD ? 'HOD_COMMENT' : 'ADMIN_COMMENT',
          comment 
        }),
      });
      showToast({ type: 'success', message: 'Comment added' });
      
      // Update local state
      setUploads(u => u.map(x => 
        x._id === uploadId 
          ? { ...x, status: isHOD ? 'HOD_COMMENT' : 'ADMIN_COMMENT', comments: [comment] }
          : x
      ));
      
      setComment('');
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to add comment' });
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper.includes('PENDING')) {
      return <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium"><Clock size={14} /> Pending</div>;
    }
    if (statusUpper.includes('APPROVED')) {
      return <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium"><CheckCircle2 size={14} /> Approved</div>;
    }
    if (statusUpper.includes('REJECTED')) {
      return <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium"><XCircle size={14} /> Rejected</div>;
    }
    if (statusUpper.includes('COMMENT')) {
      return <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium"><MessageCircle size={14} /> Commented</div>;
    }
    return <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">Unknown</div>;
  };

  const stats = useMemo(() => ({
    total: uploads.length,
    pending: uploads.filter(u => (u.status || '').toUpperCase().includes('PENDING')).length,
    approved: uploads.filter(u => (u.status || '').toUpperCase().includes('APPROVED')).length,
    rejected: uploads.filter(u => (u.status || '').toUpperCase().includes('REJECTED')).length,
  }), [uploads]);

  if (loading) {
    return <LoadingState message="Loading approvals..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Approval Center</h1>
        <p className="text-on-surface-variant">Manage faculty submission reviews and approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="text-2xl font-bold text-on-surface">{stats.total}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Total Submissions</div>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Pending Review</div>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Approved</div>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by faculty name, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-subtle bg-white text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="commented">Commented</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name">Faculty Name</option>
          <option value="credits-high">Highest Credits</option>
          <option value="credits-low">Lowest Credits</option>
        </select>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredUploads.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-subtle">
            <AlertCircle size={40} className="mx-auto text-on-surface-variant mb-3 opacity-50" />
            <p className="text-on-surface-variant">No submissions to review</p>
          </div>
        ) : (
          filteredUploads.map((upload) => (
            <div
              key={upload._id}
              className="bg-white rounded-lg border border-subtle p-4 hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => setSelectedUpload(selectedUpload?._id === upload._id ? null : upload)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-on-surface">{upload.facultyName}</h3>
                    {getStatusBadge(upload.status)}
                  </div>
                  <p className="text-sm text-on-surface-variant mb-2">{upload.title || 'Untitled'}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant">
                    <div>Category: <span className="font-medium text-on-surface">{upload.category}</span></div>
                    <div>Credits: <span className="font-medium text-on-surface">{upload.credits}</span></div>
                    <div>Submitted: <span className="font-medium text-on-surface">{new Date(upload.createdAt).toLocaleDateString()}</span></div>
                  </div>
                </div>
                <ChevronDown size={20} className={`text-on-surface-variant transition-transform ${selectedUpload?._id === upload._id ? 'rotate-180' : ''}`} />
              </div>

              {/* Expanded Details */}
              {selectedUpload?._id === upload._id && (
                <div className="mt-6 pt-6 border-t border-subtle space-y-4">
                  {upload.description && (
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface mb-2">Description</h4>
                      <p className="text-sm text-on-surface-variant">{upload.description}</p>
                    </div>
                  )}

                  {upload.comments && upload.comments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface mb-2">Comments</h4>
                      <div className="space-y-2">
                        {upload.comments.map((c, idx) => (
                          <div key={idx} className="bg-surface-container-low p-2 rounded text-sm text-on-surface-variant">
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {(upload.status || '').toUpperCase().includes('PENDING') || (upload.status || '').toUpperCase().includes('COMMENT') ? (
                    <div className="space-y-3 pt-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(upload._id)}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={16} /> Approve
                        </button>
                        <button
                          onClick={() => {/* TODO: show reject form */ }}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-on-surface-variant mb-1 block">Add Comment</label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Enter your feedback or request for revision..."
                          className="w-full px-3 py-2 rounded-lg border border-subtle bg-white text-on-surface placeholder-on-surface-variant text-sm focus:outline-none focus:border-primary resize-none"
                          rows={3}
                        />
                        <button
                          onClick={() => handleAddComment(upload._id)}
                          disabled={submittingComment}
                          className="mt-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white rounded-lg font-medium text-sm transition-colors"
                        >
                          {submittingComment ? 'Submitting...' : 'Add Comment'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
