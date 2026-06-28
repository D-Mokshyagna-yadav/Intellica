import { useState, useEffect, useMemo } from 'react';
import { Award, Target, TrendingUp, Download, Eye, Filter, Search } from 'lucide-react';
import { apiFetch, getFileUrl } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function FacultyAchievementPortfolio() {
  const [faculty, setFaculty] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('credits-desc');
  const [filterYear, setFilterYear] = useState('all');

  const isOwnProfile = !localStorage.getItem('viewingFacultyId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch faculty profile
        const profileUrl = localStorage.getItem('viewingFacultyId')
          ? `/faculty/${localStorage.getItem('viewingFacultyId')}`
          : '/faculty/profile';
        
        const facultyData = await apiFetch(profileUrl);
        setFaculty(facultyData);

        // Fetch achievements
        const uploadsUrl = localStorage.getItem('viewingFacultyId')
          ? `/uploads/faculty/${localStorage.getItem('viewingFacultyId')}`
          : '/uploads/mine';

        const uploadsData = await apiFetch(uploadsUrl);
        const approved = uploadsData.filter(u => 
          (u.status || '').toUpperCase().includes('APPROVED')
        );
        setUploads(approved);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load achievements' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const categories = {};
    let totalCredits = 0;
    let totalAchievements = 0;

    uploads.forEach(upload => {
      const category = upload.category || 'Others';
      categories[category] = (categories[category] || 0) + 1;
      totalCredits += upload.credits || 0;
      totalAchievements += 1;
    });

    return {
      totalCredits,
      totalAchievements,
      categories: Object.entries(categories).sort((a, b) => b[1] - a[1]),
    };
  }, [uploads]);

  // Get unique years
  const years = useMemo(() => {
    const uniqueYears = new Set(
      uploads.map(u => new Date(u.createdAt).getFullYear())
    );
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [uploads]);

  // Filter and search
  const filteredAchievements = useMemo(() => {
    let result = uploads;

    if (selectedCategory !== 'all') {
      result = result.filter(u => u.category === selectedCategory);
    }

    if (filterYear !== 'all') {
      result = result.filter(u => new Date(u.createdAt).getFullYear() == filterYear);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u =>
        (u.title || '').toLowerCase().includes(query) ||
        (u.description || '').toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'credits-desc') return (b.credits || 0) - (a.credits || 0);
      if (sortBy === 'credits-asc') return (a.credits || 0) - (b.credits || 0);
      if (sortBy === 'date-new') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'date-old') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'name-asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'name-desc') return (b.title || '').localeCompare(a.title || '');
      return 0;
    });

    return result;
  }, [uploads, selectedCategory, searchQuery, sortBy, filterYear]);

  const handleDownloadCertificate = async (uploadId) => {
    try {
      showToast({ type: 'info', message: 'Generating certificate...' });
      // TODO: Implement certificate generation
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to download certificate' });
    }
  };

  if (loading) {
    return <LoadingState message="Loading achievement portfolio..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-on-surface mb-2">Achievement Portfolio</h1>
            <p className="text-on-surface-variant">Your professional achievements and credentials</p>
          </div>
          {faculty?.profileImage && (
            <img
              src={getFileUrl(faculty.profileImage)}
              alt={faculty.name}
              className="w-20 h-20 rounded-full border-2 border-white shadow-lg"
            />
          )}
        </div>

        {/* Faculty Info */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-on-surface">{faculty?.name}</h2>
          <p className="text-on-surface-variant">{faculty?.designations?.[0] || 'Faculty'}</p>
          <p className="text-sm text-on-surface-variant">{faculty?.department}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-on-surface-variant text-sm font-medium">Total Credits</h3>
            <TrendingUp size={24} className="text-primary" />
          </div>
          <div className="text-4xl font-bold text-primary">{stats.totalCredits}</div>
          <p className="text-xs text-on-surface-variant mt-2">Earned achievements</p>
        </div>

        <div className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-on-surface-variant text-sm font-medium">Total Achievements</h3>
            <Award size={24} className="text-success" />
          </div>
          <div className="text-4xl font-bold text-success">{stats.totalAchievements}</div>
          <p className="text-xs text-on-surface-variant mt-2">Verified submissions</p>
        </div>

        <div className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-on-surface-variant text-sm font-medium">Categories</h3>
            <Target size={24} className="text-info" />
          </div>
          <div className="text-4xl font-bold text-info">{stats.categories.length}</div>
          <p className="text-xs text-on-surface-variant mt-2">Active categories</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {stats.categories.length > 0 && (
        <div className="bg-white rounded-lg border border-subtle p-6">
          <h3 className="text-lg font-bold text-on-surface mb-4">Achievement Breakdown</h3>
          <div className="space-y-3">
            {stats.categories.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">{category}</span>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-surface-container-low rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${(count / stats.totalAchievements) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-on-surface font-bold w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-subtle bg-white text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Categories</option>
            {stats.categories.map(([cat]) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="credits-desc">Highest Credits</option>
            <option value="credits-asc">Lowest Credits</option>
            <option value="date-new">Newest First</option>
            <option value="date-old">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Achievements Grid */}
      <div>
        <h3 className="text-lg font-bold text-on-surface mb-4">Achievements</h3>
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-subtle">
            <Award size={40} className="mx-auto text-on-surface-variant mb-3 opacity-50" />
            <p className="text-on-surface-variant">No achievements found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <div key={achievement._id} className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg hover:border-primary/50 transition-all group">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-2">
                      {achievement.category}
                    </span>
                    <h4 className="font-bold text-on-surface line-clamp-2">{achievement.title}</h4>
                  </div>
                </div>

                {/* Description */}
                {achievement.description && (
                  <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">
                    {achievement.description}
                  </p>
                )}

                {/* Credits and Date */}
                <div className="flex items-center justify-between text-sm text-on-surface-variant mb-4">
                  <span className="font-bold text-primary">{achievement.credits} Credits</span>
                  <span>{new Date(achievement.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                {isOwnProfile && (
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <Eye size={16} /> View
                    </button>
                    <button
                      onClick={() => handleDownloadCertificate(achievement._id)}
                      className="flex-1 px-3 py-2 bg-success/10 hover:bg-success/20 text-success rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={16} /> Certificate
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
