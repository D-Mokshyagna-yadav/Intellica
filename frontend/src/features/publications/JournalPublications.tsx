import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Download } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function JournalPublications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPublication, setShowNewPublication] = useState(false);
  const [newPub, setNewPub] = useState({ title: '', authors: '', journal: '', year: '', doi: '', url: '' });

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/publications').catch(() => []);
        setPublications(data || []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load publications' });
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  const handleAddPublication = async () => {
    if (!newPub.title || !newPub.journal) {
      showToast({ type: 'warning', message: 'Please fill required fields' });
      return;
    }

    try {
      await apiFetch('/publications', {
        method: 'POST',
        body: JSON.stringify(newPub),
      });
      showToast({ type: 'success', message: 'Publication added successfully' });
      setNewPub({ title: '', authors: '', journal: '', year: '', doi: '', url: '' });
      setShowNewPublication(false);
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to add publication' });
    }
  };

  if (loading) return <LoadingState message="Loading publications..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <BookOpen className="text-primary" /> Journal Publications
        </h1>
        <p className="text-on-surface-variant">Manage your research publications and journal articles</p>
      </div>

      <button onClick={() => setShowNewPublication(!showNewPublication)} className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
        <Plus size={18} /> Add Publication
      </button>

      {showNewPublication && (
        <div className="bg-white rounded-lg border border-subtle p-6 space-y-4">
          <input type="text" placeholder="Publication Title" value={newPub.title} onChange={(e) => setNewPub({ ...newPub, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" required />
          <input type="text" placeholder="Authors" value={newPub.authors} onChange={(e) => setNewPub({ ...newPub, authors: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Journal Name" value={newPub.journal} onChange={(e) => setNewPub({ ...newPub, journal: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" required />
            <input type="number" placeholder="Year" value={newPub.year} onChange={(e) => setNewPub({ ...newPub, year: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" />
          </div>
          <input type="text" placeholder="DOI" value={newPub.doi} onChange={(e) => setNewPub({ ...newPub, doi: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" />
          <input type="url" placeholder="Publication URL" value={newPub.url} onChange={(e) => setNewPub({ ...newPub, url: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" />
          <div className="flex gap-2">
            <button onClick={handleAddPublication} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
              Add Publication
            </button>
            <button onClick={() => setShowNewPublication(false)} className="flex-1 px-4 py-2 border border-subtle rounded-lg font-medium hover:bg-surface-container-low">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Publications List */}
      <div className="space-y-4">
        {publications.map((pub) => (
          <div key={pub._id} className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-on-surface mb-1">{pub.title}</h3>
                <p className="text-sm text-on-surface-variant mb-2">{pub.authors}</p>
                <p className="text-sm text-on-surface-variant">
                  <strong>{pub.journal}</strong> ({pub.year})
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-surface-container rounded">
                  <Edit2 size={18} className="text-primary" />
                </button>
                <button className="p-2 hover:bg-surface-container rounded">
                  <Trash2 size={18} className="text-danger" />
                </button>
              </div>
            </div>
            {pub.doi && <p className="text-sm text-primary mb-2">DOI: {pub.doi}</p>}
            {pub.url && (
              <button className="flex items-center gap-2 text-primary font-medium text-sm hover:underline">
                <Download size={16} /> View Publication
              </button>
            )}
          </div>
        ))}
      </div>

      {publications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-subtle">
          <BookOpen size={40} className="mx-auto text-on-surface-variant mb-3 opacity-50" />
          <p className="text-on-surface-variant">No publications yet</p>
        </div>
      )}
    </div>
  );
}
