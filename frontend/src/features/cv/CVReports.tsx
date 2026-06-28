import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Filter, Search } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function CVReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterFormat, setFilterFormat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/cv-reports').catch(() => []);
        setReports(data || []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load CV reports' });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter(report =>
    (filterFormat === 'all' || report.format === filterFormat) &&
    (report.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  if (loading) return <LoadingState message="Loading CV reports..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">CV & Reports</h1>
        <p className="text-on-surface-variant">Generate and download your CV in multiple formats</p>
      </div>

      <div className="bg-white rounded-lg border border-subtle p-6 mb-6">
        <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
          + Generate New CV Report
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-on-surface-variant" />
          <input type="text" placeholder="Search CV reports..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-subtle bg-white focus:outline-none focus:border-primary" />
        </div>
        <select value={filterFormat} onChange={(e) => setFilterFormat(e.target.value)} className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary">
          <option value="all">All Formats</option>
          <option value="pdf">PDF</option>
          <option value="word">Word</option>
          <option value="html">HTML</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <div key={report._id} className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <FileText size={32} className="text-primary" />
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-bold">{report.format?.toUpperCase()}</span>
            </div>
            <h3 className="font-bold text-on-surface mb-2">{report.title}</h3>
            <p className="text-sm text-on-surface-variant mb-4">Generated: {new Date(report.createdAt).toLocaleDateString()}</p>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded text-sm font-medium transition-colors">
                <Download size={16} /> Download
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-primary text-primary rounded hover:bg-primary/5 text-sm font-medium transition-colors">
                <Eye size={16} /> Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-subtle">
          <FileText size={40} className="mx-auto text-on-surface-variant mb-3 opacity-50" />
          <p className="text-on-surface-variant">No CV reports found</p>
        </div>
      )}
    </div>
  );
}
