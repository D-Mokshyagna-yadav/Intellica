import { useState, useEffect, useMemo } from 'react';
import { Bell, Plus, Trash2, Edit2, Calendar, Pin, Search, Filter, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function AnnouncementsNoticeBoard() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'GENERAL',
    audience: 'ALL',
    isPinned: false,
  });

  const userRole = localStorage.getItem('user_role');
  const canManage = userRole === 'ADMIN' || userRole === 'HOD';

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/announcements');
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load announcements' });
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Filter and search
  const filteredAnnouncements = useMemo(() => {
    let result = announcements;

    if (filterType !== 'all') {
      result = result.filter(a => a.type === filterType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        (a.title || '').toLowerCase().includes(query) ||
        (a.content || '').toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      if (sortBy === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

    return result;
  }, [announcements, filterType, searchQuery, sortBy]);

  const handleCreateAnnouncement = async () => {
    if (!formData.title || !formData.content) {
      showToast({ type: 'warning', message: 'Please fill all required fields' });
      return;
    }

    try {
      const newAnnouncement = await apiFetch('/announcements', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setAnnouncements([newAnnouncement, ...announcements]);
      setFormData({
        title: '',
        content: '',
        type: 'GENERAL',
        audience: 'ALL',
        isPinned: false,
      });
      setShowCreateModal(false);
      showToast({ type: 'success', message: 'Announcement created successfully' });
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to create announcement' });
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await apiFetch(`/announcements/${announcementId}`, { method: 'DELETE' });
      setAnnouncements(announcements.filter(a => a._id !== announcementId));
      showToast({ type: 'success', message: 'Announcement deleted' });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to delete announcement' });
    }
  };

  const handleTogglePinned = async (announcementId) => {
    try {
      const announcement = announcements.find(a => a._id === announcementId);
      await apiFetch(`/announcements/${announcementId}`, {
        method: 'PUT',
        body: JSON.stringify({ isPinned: !announcement.isPinned }),
      });

      setAnnouncements(announcements.map(a =>
        a._id === announcementId ? { ...a, isPinned: !a.isPinned } : a
      ));
      showToast({ type: 'success', message: announcement.isPinned ? 'Unpinned' : 'Pinned' });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to update announcement' });
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'GENERAL': 'bg-blue-100 text-blue-800',
      'URGENT': 'bg-red-100 text-red-800',
      'EVENT': 'bg-green-100 text-green-800',
      'DEADLINE': 'bg-orange-100 text-orange-800',
      'MAINTENANCE': 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const stats = useMemo(() => ({
    total: announcements.length,
    pinned: announcements.filter(a => a.isPinned).length,
    urgent: announcements.filter(a => a.type === 'URGENT').length,
    events: announcements.filter(a => a.type === 'EVENT').length,
  }), [announcements]);

  if (loading) {
    return <LoadingState message="Loading announcements..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Announcements & Notice Board</h1>
          <p className="text-on-surface-variant">Stay informed with latest institutional updates</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={18} /> New Announcement
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="text-2xl font-bold text-on-surface">{stats.total}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Total Announcements</div>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="text-2xl font-bold text-primary">{stats.pinned}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Pinned</div>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Urgent</div>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="text-2xl font-bold text-green-600">{stats.events}</div>
          <div className="text-xs text-on-surface-variant font-medium mt-1">Events</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-subtle bg-white text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="all">All Types</option>
          <option value="GENERAL">General</option>
          <option value="URGENT">Urgent</option>
          <option value="EVENT">Event</option>
          <option value="DEADLINE">Deadline</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="title">By Title</option>
        </select>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-subtle">
            <Bell size={40} className="mx-auto text-on-surface-variant mb-3 opacity-50" />
            <p className="text-on-surface-variant">No announcements</p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <div
              key={announcement._id}
              className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-all ${
                announcement.isPinned ? 'border-primary/50 bg-primary/5' : 'border-subtle'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {announcement.isPinned && <Pin size={18} className="text-primary" />}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface">{announcement.title}</h3>
                </div>

                {canManage && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTogglePinned(announcement._id)}
                      className="p-2 hover:bg-primary/10 text-primary rounded transition-colors"
                      title={announcement.isPinned ? 'Unpin' : 'Pin'}
                    >
                      {announcement.isPinned ? <Pin size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <p className="text-on-surface-variant mb-4 line-clamp-3">{announcement.content}</p>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                </div>
                {announcement.audience && (
                  <span className="text-xs bg-surface-container-low px-2 py-1 rounded">
                    {announcement.audience === 'ALL' ? 'All Users' : announcement.audience}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && canManage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold text-on-surface">Create Announcement</h2>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Title *</label>
              <input
                type="text"
                placeholder="Announcement title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Content *</label>
              <textarea
                placeholder="Announcement content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary resize-none"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="GENERAL">General</option>
                  <option value="URGENT">Urgent</option>
                  <option value="EVENT">Event</option>
                  <option value="DEADLINE">Deadline</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Audience</label>
                <select
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="ALL">All Users</option>
                  <option value="FACULTY">Faculty Only</option>
                  <option value="HOD">HOD Only</option>
                  <option value="ADMIN">Admin Only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label className="text-sm font-medium text-on-surface">Pin this announcement</label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-subtle text-on-surface hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
