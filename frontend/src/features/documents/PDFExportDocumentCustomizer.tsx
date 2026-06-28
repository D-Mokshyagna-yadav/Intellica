import { useState, useEffect } from 'react';
import { FileDown, Settings, Download, Eye } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function PDFExportDocumentCustomizer() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customizationSettings, setCustomizationSettings] = useState({
    includeProfilePhoto: true,
    includeCertificates: true,
    includePublications: true,
    includeAchievements: true,
    colorScheme: 'blue',
    pageSize: 'A4',
  });
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/documents').catch(() => []);
        setDocuments(data || []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load documents' });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleExport = async (format = 'pdf') => {
    try {
      const response = await apiFetch('/documents/export', {
        method: 'POST',
        body: JSON.stringify({ ...customizationSettings, format }),
      });
      showToast({ type: 'success', message: `Document exported as ${format.toUpperCase()}` });
    } catch (error) {
      showToast({ type: 'error', message: 'Export failed' });
    }
  };

  if (loading) return <LoadingState message="Loading documents..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <FileDown className="text-primary" /> PDF Export & Document Customizer
        </h1>
        <p className="text-on-surface-variant">Customize and export your documents in multiple formats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold text-on-surface mb-4">Available Documents</h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <button
                key={doc._id}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${selectedDoc?._id === doc._id ? 'bg-primary/10 border-primary' : 'border-subtle hover:bg-surface-container-low'}`}
              >
                <p className="font-medium text-on-surface text-sm">{doc.title}</p>
                <p className="text-xs text-on-surface-variant">{doc.type}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Customization Panel */}
        <div className="lg:col-span-2">
          {selectedDoc ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-subtle p-6">
                <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                  <Settings /> Customization Options
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-on-surface">Include Profile Photo</label>
                    <button className={`w-12 h-7 rounded-full transition-colors ${customizationSettings.includeProfilePhoto ? 'bg-success' : 'bg-surface-container-high'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${customizationSettings.includeProfilePhoto ? 'translate-x-6' : 'translate-x-1'} top-1 relative`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-on-surface">Include Certificates</label>
                    <button className={`w-12 h-7 rounded-full transition-colors ${customizationSettings.includeCertificates ? 'bg-success' : 'bg-surface-container-high'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${customizationSettings.includeCertificates ? 'translate-x-6' : 'translate-x-1'} top-1 relative`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-on-surface">Include Publications</label>
                    <button className={`w-12 h-7 rounded-full transition-colors ${customizationSettings.includePublications ? 'bg-success' : 'bg-surface-container-high'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${customizationSettings.includePublications ? 'translate-x-6' : 'translate-x-1'} top-1 relative`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-on-surface">Include Achievements</label>
                    <button className={`w-12 h-7 rounded-full transition-colors ${customizationSettings.includeAchievements ? 'bg-success' : 'bg-surface-container-high'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${customizationSettings.includeAchievements ? 'translate-x-6' : 'translate-x-1'} top-1 relative`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Color Scheme</label>
                    <select value={customizationSettings.colorScheme} onChange={(e) => setCustomizationSettings({ ...customizationSettings, colorScheme: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle bg-white focus:outline-none focus:border-primary">
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="red">Red</option>
                      <option value="purple">Purple</option>
                      <option value="grayscale">Grayscale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Page Size</label>
                    <select value={customizationSettings.pageSize} onChange={(e) => setCustomizationSettings({ ...customizationSettings, pageSize: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle bg-white focus:outline-none focus:border-primary">
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                      <option value="A3">A3</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button onClick={() => handleExport('pdf')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
                    <Download size={18} /> Export PDF
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors">
                    <Eye size={18} /> Preview
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-subtle">
              <FileDown size={40} className="mx-auto text-on-surface-variant mb-3 opacity-50" />
              <p className="text-on-surface-variant">Select a document to customize</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
