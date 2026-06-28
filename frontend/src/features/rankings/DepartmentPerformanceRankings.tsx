import { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Award, Users, Download, Filter, Search } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function DepartmentPerformanceRankings() {
  const [rankings, setRankings] = useState([]);
  const [departmentStats, setDepartmentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('overall');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterMetric, setFilterMetric] = useState('credits');
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch department rankings
        const rankingsData = await apiFetch('/ranking/departments');
        setRankings(rankingsData || []);

        // Fetch departments for filter
        const deptsData = await apiFetch('/departments');
        setDepartments(deptsData || []);

        // Fetch department stats if available
        try {
          const statsData = await apiFetch('/ranking/department-stats');
          setDepartmentStats(statsData);
        } catch (e) {
          // Stats might not be available
        }
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load rankings' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter rankings
  const filteredRankings = useMemo(() => {
    let result = rankings;

    if (filterDepartment !== 'all') {
      result = result.filter(r => r.department === filterDepartment);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        (r.departmentName || '').toLowerCase().includes(query)
      );
    }

    // Sort by selected metric
    result.sort((a, b) => {
      if (filterMetric === 'credits') return (b.totalCredits || 0) - (a.totalCredits || 0);
      if (filterMetric === 'faculty') return (b.facultyCount || 0) - (a.facultyCount || 0);
      if (filterMetric === 'achievements') return (b.totalAchievements || 0) - (a.totalAchievements || 0);
      return 0;
    });

    return result;
  }, [rankings, filterDepartment, filterMetric, searchQuery]);

  // Calculate aggregate stats
  const aggregateStats = useMemo(() => {
    const stats = {
      totalDepartments: rankings.length,
      totalFaculty: 0,
      totalCredits: 0,
      totalAchievements: 0,
      averageCreditsPerFaculty: 0,
    };

    rankings.forEach(r => {
      stats.totalFaculty += r.facultyCount || 0;
      stats.totalCredits += r.totalCredits || 0;
      stats.totalAchievements += r.totalAchievements || 0;
    });

    if (stats.totalFaculty > 0) {
      stats.averageCreditsPerFaculty = (stats.totalCredits / stats.totalFaculty).toFixed(1);
    }

    return stats;
  }, [rankings]);

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '•';
  };

  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  if (loading) {
    return <LoadingState message="Loading department rankings..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-on-surface mb-2">Department Performance Rankings</h1>
        <p className="text-on-surface-variant">Monitor departmental achievements and faculty contributions</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-on-surface-variant text-sm font-medium">Total Departments</h3>
            <BarChart3 size={24} className="text-primary" />
          </div>
          <div className="text-3xl font-bold text-on-surface">{aggregateStats.totalDepartments}</div>
        </div>

        <div className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-on-surface-variant text-sm font-medium">Total Faculty</h3>
            <Users size={24} className="text-info" />
          </div>
          <div className="text-3xl font-bold text-on-surface">{aggregateStats.totalFaculty}</div>
        </div>

        <div className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-on-surface-variant text-sm font-medium">Total Credits</h3>
            <TrendingUp size={24} className="text-success" />
          </div>
          <div className="text-3xl font-bold text-on-surface">{aggregateStats.totalCredits}</div>
        </div>

        <div className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-on-surface-variant text-sm font-medium">Avg Credits/Faculty</h3>
            <Award size={24} className="text-warning" />
          </div>
          <div className="text-3xl font-bold text-on-surface">{aggregateStats.averageCreditsPerFaculty}</div>
        </div>
      </div>

      {/* View Type Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => setViewType('overall')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            viewType === 'overall'
              ? 'bg-primary text-white'
              : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
          }`}
        >
          Overall Rankings
        </button>
        <button
          onClick={() => setViewType('metrics')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            viewType === 'metrics'
              ? 'bg-primary text-white'
              : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
          }`}
        >
          Performance Metrics
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-subtle bg-white text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept.code} value={dept.code}>{dept.name}</option>
          ))}
        </select>
        {viewType === 'overall' && (
          <select
            value={filterMetric}
            onChange={(e) => setFilterMetric(e.target.value)}
            className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="credits">Sort by Credits</option>
            <option value="faculty">Sort by Faculty Count</option>
            <option value="achievements">Sort by Achievements</option>
          </select>
        )}
      </div>

      {/* Rankings Table */}
      {viewType === 'overall' && (
        <div className="bg-white rounded-lg border border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low border-b border-subtle">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Department</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-on-surface">Faculty</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-on-surface">Total Credits</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-on-surface">Achievements</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-on-surface">Avg Credits/Faculty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {filteredRankings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                      No rankings found
                    </td>
                  </tr>
                ) : (
                  filteredRankings.map((ranking, index) => (
                    <tr key={ranking._id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-2xl font-bold text-primary">
                          {getRankMedal(index + 1)}
                        </span>
                        <span className="ml-2 text-sm font-bold text-on-surface">#{index + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-on-surface">{ranking.departmentName}</div>
                          <div className="text-sm text-on-surface-variant">{ranking.department}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-on-surface">{ranking.facultyCount || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-primary text-lg">{ranking.totalCredits || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-success">{ranking.totalAchievements || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-on-surface">
                          {ranking.facultyCount ? ((ranking.totalCredits || 0) / ranking.facultyCount).toFixed(1) : 0}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Metrics Grid */}
      {viewType === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRankings.map((ranking) => (
            <div key={ranking._id} className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-on-surface mb-4 text-lg">{ranking.departmentName}</h3>

              <div className="space-y-4">
                {/* Credits Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-on-surface-variant">Total Credits</span>
                    <span className="font-bold text-primary">{ranking.totalCredits || 0}</span>
                  </div>
                  <div className="w-full bg-surface-container-low rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(((ranking.totalCredits || 0) / (aggregateStats.totalCredits || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Faculty Count */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-on-surface-variant">Faculty Members</span>
                    <span className="font-bold text-info">{ranking.facultyCount || 0}</span>
                  </div>
                  <div className="w-full bg-surface-container-low rounded-full h-2">
                    <div
                      className="bg-info h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(((ranking.facultyCount || 0) / (aggregateStats.totalFaculty || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-on-surface-variant">Achievements</span>
                    <span className="font-bold text-success">{ranking.totalAchievements || 0}</span>
                  </div>
                  <div className="w-full bg-surface-container-low rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(((ranking.totalAchievements || 0) / (aggregateStats.totalAchievements || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Average per Faculty */}
                <div className="bg-surface-container-low rounded-lg p-3 mt-4">
                  <div className="text-sm text-on-surface-variant">Average Credits per Faculty</div>
                  <div className="text-2xl font-bold text-on-surface">
                    {ranking.facultyCount ? ((ranking.totalCredits || 0) / ranking.facultyCount).toFixed(1) : 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
          <Download size={18} /> Export Report
        </button>
      </div>
    </div>
  );
}
