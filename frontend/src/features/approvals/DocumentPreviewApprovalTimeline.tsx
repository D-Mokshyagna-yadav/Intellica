import { useState, useEffect } from 'react';
import { FileCheck, Clock, Eye, Download, MessageCircle } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function DocumentPreviewApprovalTimeline() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/approvals/documents').catch(() => []);
        setDocuments(data || []);
        if (data?.length > 0) setSelectedDoc(data[0]);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load documents' });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      if (!selectedDoc) return;
      try {
        const data = await apiFetch(`/approvals/documents/${selectedDoc._id}/comments`).catch(() => []);
        setComments(data || []);
      } catch (error) {
        // Silent fail
      }
    };

    fetchComments();
  }, [selectedDoc]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedDoc) return;

    try {
      await apiFetch(`/approvals/documents/${selectedDoc._id}/comment`, {
        method: 'POST',
        body: JSON.stringify({ text: newComment }),
      });
      showToast({ type: 'success', message: 'Comment added' });
      setNewComment('');
      // Refresh comments
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to add comment' });
    }
  };

  if (loading) return <LoadingState message="Loading documents..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <FileCheck className="text-primary" /> Document Preview & Approval Timeline
        </h1>
        <p className="text-on-surface-variant">Review, preview, and approve documents with timeline tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold text-on-surface mb-4">Pending Documents</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {documents.map((doc) => (
              <button
                key={doc._id}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${selectedDoc?._id === doc._id ? 'bg-primary/10 border-primary' : 'border-subtle hover:bg-surface-container-low'}`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-on-surface text-sm">{doc.title}</p>
                    <p className="text-xs text-on-surface-variant">{doc.submittedBy}</p>
                    <div className="flex gap-1 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${doc.status === 'approved' ? 'bg-success/10 text-success' : doc.status === 'rejected' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Document Preview & Comments */}
        <div className="lg:col-span-2">
          {selectedDoc ? (
            <div className="space-y-4">
              {/* Document Header */}
              <div className="bg-white rounded-lg border border-subtle p-6">
                <h2 className="text-2xl font-bold text-on-surface mb-3">{selectedDoc.title}</h2>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-on-surface-variant">Submitted By</p>
                    <p className="font-bold text-on-surface">{selectedDoc.submittedBy}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant">Submitted Date</p>
                    <p className="font-bold text-on-surface">{new Date(selectedDoc.submittedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant">Status</p>
                    <p className={`font-bold ${selectedDoc.status === 'approved' ? 'text-success' : selectedDoc.status === 'rejected' ? 'text-danger' : 'text-primary'}`}>
                      {selectedDoc.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant">Document Type</p>
                    <p className="font-bold text-on-surface">{selectedDoc.type}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors">
                    <Eye size={16} /> Preview
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors">
                    <Download size={16} /> Download
                  </button>
                </div>
              </div>

              {/* Approval Timeline */}
              <div className="bg-white rounded-lg border border-subtle p-6">
                <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                  <Clock size={20} /> Approval Timeline
                </h3>
                <div className="space-y-4">
                  {selectedDoc.timeline?.map((event, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${event.status === 'completed' ? 'bg-success' : 'bg-primary'}`} />
                        {idx < (selectedDoc.timeline?.length || 0) - 1 && <div className="w-0.5 h-12 bg-subtle" />}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-sm">{event.action}</p>
                        <p className="text-xs text-on-surface-variant">{event.message}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-lg border border-subtle p-6">
                <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                  <MessageCircle size={20} /> Comments & Notes
                </h3>
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {comments.map((comment, idx) => (
                    <div key={idx} className="p-3 bg-surface-container-low rounded">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-on-surface text-sm">{comment.author}</p>
                        <p className="text-xs text-on-surface-variant">{new Date(comment.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-on-surface-variant">{comment.text}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="w-full px-3 py-2 rounded-lg border border-subtle bg-white focus:outline-none focus:border-primary text-sm" rows={3} />
                  <button onClick={handleAddComment} className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors">
                    Post Comment
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedDoc.status === 'pending' && (
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-success hover:bg-success/90 text-white rounded-lg font-medium transition-colors">
                    Approve
                  </button>
                  <button className="flex-1 px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-lg font-medium transition-colors">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-subtle">
              <FileCheck size={40} className="mx-auto text-on-surface-variant mb-3 opacity-50" />
              <p className="text-on-surface-variant">Select a document to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
