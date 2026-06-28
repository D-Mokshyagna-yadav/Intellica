import { useState, useEffect } from 'react';
import { Award, Download, Share2, Filter, Search } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function CertificateDocumentGallery() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/certificates').catch(() => []);
        setCertificates(data || []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load certificates' });
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const filteredCerts = certificates.filter(cert =>
    (filterCategory === 'all' || cert.category === filterCategory) &&
    (cert.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  if (loading) return <LoadingState message="Loading certificates..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Certificate Gallery</h1>
        <p className="text-on-surface-variant">View and download your certificates and achievements</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-on-surface-variant" />
          <input type="text" placeholder="Search certificates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-subtle bg-white focus:outline-none focus:border-primary" />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary">
          <option value="all">All Categories</option>
          <option value="certification">Certifications</option>
          <option value="achievement">Achievements</option>
          <option value="participation">Participation</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCerts.map((cert) => (
          <div key={cert._id} className="bg-white rounded-lg border border-subtle overflow-hidden hover:shadow-lg transition-all">
            <div className="bg-gradient-to-r from-primary to-primary/50 h-32 flex items-center justify-center">
              <Award size={48} className="text-white" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-on-surface mb-1">{cert.title}</h3>
              <p className="text-sm text-on-surface-variant mb-3">{cert.issuedBy || 'Institution'}</p>
              <p className="text-xs text-on-surface-variant mb-4">Issued: {new Date(cert.issuedDate).toLocaleDateString()}</p>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded text-sm font-medium transition-colors">
                  <Download size={16} /> Download
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-primary text-primary rounded hover:bg-primary/5 text-sm font-medium transition-colors">
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCerts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-subtle">
          <Award size={40} className="mx-auto text-on-surface-variant mb-3 opacity-50" />
          <p className="text-on-surface-variant">No certificates found</p>
        </div>
      )}
    </div>
  );
}
