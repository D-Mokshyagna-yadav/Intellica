import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, User, ThumbsUp, Reply } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function ApprovalDiscussionReviewSystem() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/discussions?status=${filterStatus}`).catch(() => []);
        setDiscussions(data || []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load discussions' });
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [filterStatus]);

  const handleReply = async () => {
    if (!replyText.trim()) {
      showToast({ type: 'warning', message: 'Please enter a message' });
      return;
    }

    try {
      await apiFetch(`/discussions/${selectedDiscussion._id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ text: replyText }),
      });
      showToast({ type: 'success', message: 'Reply posted successfully' });
      setReplyText('');
      // Refresh discussion
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to post reply' });
    }
  };

  if (loading) return <LoadingState message="Loading discussions..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <MessageSquare className="text-primary" /> Approval Discussion & Review System
        </h1>
        <p className="text-on-surface-variant">Collaborate on approvals with discussion threads and comments</p>
      </div>

      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary">
        <option value="all">All Discussions</option>
        <option value="pending">Pending Decision</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discussions List */}
        <div className="lg:col-span-1 space-y-2">
          {discussions.map((disc) => (
            <button
              key={disc._id}
              onClick={() => setSelectedDiscussion(disc)}
              className={`w-full p-3 rounded-lg border text-left transition-all ${selectedDiscussion?._id === disc._id ? 'bg-primary/10 border-primary' : 'border-subtle hover:bg-surface-container-low'}`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="font-bold text-on-surface text-sm">{disc.subject}</p>
                  <p className="text-xs text-on-surface-variant">{disc.commentsCount} comments</p>
                </div>
                {disc.status === 'approved' && <CheckCircle size={16} className="text-success flex-shrink-0" />}
              </div>
            </button>
          ))}
        </div>

        {/* Discussion Detail */}
        <div className="lg:col-span-2">
          {selectedDiscussion ? (
            <div className="bg-white rounded-lg border border-subtle p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-on-surface mb-2">{selectedDiscussion.subject}</h2>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-3">
                  <User size={16} /> {selectedDiscussion.initiator} • <Clock size={16} /> {new Date(selectedDiscussion.createdAt).toLocaleDateString()}
                </div>
                <p className="text-on-surface">{selectedDiscussion.description}</p>
              </div>

              <div className="bg-surface-container-low p-3 rounded text-sm text-on-surface-variant">
                Status: <span className={`font-bold ${selectedDiscussion.status === 'approved' ? 'text-success' : selectedDiscussion.status === 'rejected' ? 'text-danger' : 'text-primary'}`}>{selectedDiscussion.status}</span>
              </div>

              {/* Comments */}
              <div className="border-t border-subtle pt-4">
                <h3 className="font-bold text-on-surface mb-3">Discussion ({selectedDiscussion.comments?.length || 0})</h3>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {selectedDiscussion.comments?.map((comment, idx) => (
                    <div key={idx} className="p-3 bg-surface-container-low rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-on-surface text-sm">{comment.author}</span>
                        <span className="text-xs text-on-surface-variant">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant">{comment.text}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 rounded-lg border border-subtle bg-white focus:outline-none focus:border-primary text-sm"
                    rows={3}
                  />
                  <button
                    onClick={handleReply}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  >
                    <Reply size={16} /> Post Comment
                  </button>
                </div>
              </div>

              {/* Decision Buttons */}
              {selectedDiscussion.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-subtle">
                  <button className="flex-1 px-4 py-2 bg-success hover:bg-success/90 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button className="flex-1 px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-lg font-medium transition-colors">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-subtle">
              <MessageSquare size={40} className="mx-auto text-on-surface-variant mb-3 opacity-50" />
              <p className="text-on-surface-variant">Select a discussion to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
