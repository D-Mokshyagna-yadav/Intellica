import { useState, useEffect } from 'react';
import { FileText, Plus, Download, Edit2, Trash2 } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function NAACInstitutionalReportBuilder() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewReport, setShowNewReport] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    year: new Date().getFullYear(),
    sections: [],
    status: 'draft',
  });

  const naacSections = [
    'Curricular Aspects',
    'Teaching-Learning & Evaluation',
    'Research, Innovation & Extension',
    'Infrastructure & Learning Resources',
    'Student Support & Progression',
    'Governance, Leadership & Management',
    'Institutional Values & Best Practices',
  ];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/naac/reports').catch(() => []);
        setReports(data || []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load NAAC reports' });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleCreateReport = async () => {
    if (!newReport.title || newReport.sections.length === 0) {
      showToast({ type: 'warning', message: 'Please fill all fields' });
      return;
    }

    try {
      await apiFetch('/naac/reports', {
        method: 'POST',
        body: JSON.stringify(newReport),
      });
      showToast({ type: 'success', message: 'NAAC report created successfully' });
      setNewReport({ title: '', year: new Date().getFullYear(), sections: [], status: 'draft' });
      setShowNewReport(false);
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to create report' });
    }
  };

  if (loading) return <LoadingState message="Loading NAAC reports..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <FileText className="text-primary" /> NAAC Institutional Report Builder
        </h1>
        <p className="text-on-surface-variant">Build and manage NAAC accreditation institutional reports</p>
      </div>

      <button onClick={() => setShowNewReport(!showNewReport)} className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
        <Plus size={18} /> Create NAAC Report
      </button>

      {showNewReport && (
        <div className="bg-white rounded-lg border border-subtle p-6 space-y-4">
          <input type="text" placeholder="Report Title" value={newReport.title} onChange={(e) => setNewReport({ ...newReport, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" required />

          <div>
            <label className="block text-sm font-bold text-on-surface mb-3">Select NAAC Sections</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {naacSections.map((section) => (
                <div key={section} className="flex items-center">
                  <input type="checkbox" id={section} checked={newReport.sections.includes(section)} onChange={(e) => {
                    if (e.target.checked) {
                      setNewReport({ ...newReport, sections: [...newReport.sections, section] });
                    } else {
                      setNewReport({ ...newReport, sections: newReport.sections.filter(s => s !== section) });
                    }
                  }} className="rounded border-subtle" />
                  <label htmlFor={section} className="ml-2 text-sm text-on-surface">
                    {section}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">Year</label>
            <input type="number" value={newReport.year} onChange={(e) => setNewReport({ ...newReport, year: parseInt(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" />
          </div>

          <div className="flex gap-2">
            <button onClick={handleCreateReport} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
              Create Report
            </button>
            <button onClick={() => setShowNewReport(false)} className="flex-1 px-4 py-2 border border-subtle rounded-lg font-medium hover:bg-surface-container-low">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report._id} className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-on-surface mb-1">{report.title}</h3>
                <p className="text-sm text-on-surface-variant mb-2">Year: {report.year}</p>
                <div className="flex gap-2">
                  {report.sections.slice(0, 3).map((section, idx) => (
                    <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold">
                      {section.split(' ')[0]}
                    </span>
                  ))}
                  {report.sections.length > 3 && <span className="text-xs text-on-surface-variant">+{report.sections.length - 3} more</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.status === 'completed' ? 'bg-success/10 text-success' : report.status === 'review' ? 'bg-yellow-100 text-yellow-800' : 'bg-surface-container text-on-surface-variant'}`}>
                  {report.status}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded font-medium transition-colors">
                <Edit2 size={16} /> Edit
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm border border-primary text-primary rounded hover:bg-primary/5 font-medium transition-colors">
                <Download size={16} /> Export
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/5 rounded font-medium transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-subtle">
          <FileText size={40} className="mx-auto text-on-surface-variant mb-3 opacity-50" />
          <p className="text-on-surface-variant">No NAAC reports yet</p>
        </div>
      )}
    </div>
  );
}
