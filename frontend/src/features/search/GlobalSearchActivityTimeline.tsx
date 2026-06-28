import { useState, useEffect } from 'react';
import { Search, Clock, User, Eye, Download } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function GlobalSearchActivityTimeline() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await apiFetch('/activity-timeline').catch(() => []);
        setActivityTimeline(data || []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load activity' });
      }
    };

    fetchActivity();
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await apiFetch(`/search?q=${encodeURIComponent(query)}`).catch(() => []);
      setSearchResults(results || []);
    } catch (error) {
      showToast({ type: 'error', message: 'Search failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <Search className="text-primary" /> Global Search & Activity Timeline
        </h1>
        <p className="text-on-surface-variant">Search across the platform and track activities</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-subtle">
        <button onClick={() => setActiveTab('search')} className={`px-6 py-3 font-medium border-b-2 ${activeTab === 'search' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>
          Search
        </button>
        <button onClick={() => setActiveTab('timeline')} className={`px-6 py-3 font-medium border-b-2 ${activeTab === 'timeline' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>
          Activity Timeline
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div>
          <div className="relative mb-6">
            <Search size={18} className="absolute left-3 top-3 text-on-surface-variant" />
            <input type="text" placeholder="Search achievements, documents, faculty, announcements..." value={searchQuery} onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }} className="w-full pl-10 pr-4 py-3 rounded-lg border border-subtle bg-white focus:outline-none focus:border-primary" />
          </div>

          {loading && <LoadingState message="Searching..." />}

          {searchResults.length > 0 && (
            <div className="space-y-4">
              {searchResults.map((result, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-subtle p-4 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-on-surface mb-1">{result.title}</h3>
                      <p className="text-sm text-on-surface-variant mb-2">{result.description}</p>
                      <div className="flex gap-3 text-xs text-on-surface-variant">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded">{result.type}</span>
                        {result.createdAt && <span>{new Date(result.createdAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    {result.type === 'document' && (
                      <button className="p-2 hover:bg-surface-container rounded">
                        <Download size={18} className="text-primary" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-lg border border-subtle">
              <Search size={40} className="mx-auto text-on-surface-variant mb-3 opacity-50" />
              <p className="text-on-surface-variant">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {activityTimeline.map((activity, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-subtle p-4 relative">
              <div className="flex gap-4">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  {idx < activityTimeline.length - 1 && <div className="absolute left-1/2 top-2 w-0.5 h-12 bg-subtle transform -translate-x-1/2" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-on-surface">{activity.action}</h3>
                      <p className="text-sm text-on-surface-variant">{activity.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 justify-end">
                        <Clock size={14} /> {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-on-surface-variant flex items-center gap-1">
                    <User size={14} /> {activity.user}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
