import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Download, Filter, Calendar, TrendingUp, PieChart, LineChart } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function ReportsAnalytics() {
  const [reportType, setReportType] = useState('faculty-summary');
  const [dateRange, setDateRange] = useState('all-time');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [deptsData, catsData] = await Promise.all([
          apiFetch('/departments'),
          apiFetch('/constants/categories'),
        ]);
        setDepartments(deptsData || []);
        setCategories(catsData || []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load filter options' });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch report data based on selected report type
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        let url = '';
        const params = new URLSearchParams();

        if (dateRange !== 'all-time') params.append('period', dateRange);
        if (filterDepartment !== 'all') params.append('department', filterDepartment);
        if (filterCategory !== 'all') params.append('category', filterCategory);

        switch (reportType) {
          case 'faculty-summary':
            url = '/reports/faculty-summary';
            break;
          case 'department-performance':
            url = '/reports/department-performance';
            break;
          case 'category-analysis':
            url = '/reports/category-analysis';
            break;
          case 'credit-distribution':
            url = '/reports/credit-distribution';
            break;
          case 'institutional-overview':
            url = '/reports/institutional-overview';
            break;
          default:
            url = '/reports/faculty-summary';
        }

        if (params.toString()) url += `?${params.toString()}`;

        const data = await apiFetch(url);
        setReportData(data || {});
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load report' });
        setReportData({});
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [reportType, dateRange, filterDepartment, filterCategory]);

  const handleDownloadReport = async (format = 'pdf') => {
    try {
      const params = new URLSearchParams({
        type: reportType,
        format: format,
        ...(dateRange !== 'all-time' && { period: dateRange }),
        ...(filterDepartment !== 'all' && { department: filterDepartment }),
        ...(filterCategory !== 'all' && { category: filterCategory }),
      });

      const response = await fetch(`/api/reports/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();

      showToast({ type: 'success', message: 'Report downloaded successfully' });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to download report' });
    }
  };

  if (loading) {
    return <LoadingState message="Loading analytics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-on-surface mb-2">Reports & Analytics</h1>
        <p className="text-on-surface-variant">Comprehensive insights into institutional achievements and performance</p>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <h2 className="text-lg font-bold text-on-surface mb-4">Select Report Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: 'faculty-summary', label: 'Faculty Summary', desc: 'Individual faculty achievements' },
            { id: 'department-performance', label: 'Department Performance', desc: 'Departmental metrics' },
            { id: 'category-analysis', label: 'Category Analysis', desc: 'Achievement breakdown' },
            { id: 'credit-distribution', label: 'Credit Distribution', desc: 'Credit allocation patterns' },
            { id: 'institutional-overview', label: 'Institutional Overview', desc: 'Institution-wide metrics' },
            { id: 'trend-analysis', label: 'Trend Analysis', desc: 'Performance trends over time' },
          ].map(report => (
            <button
              key={report.id}
              onClick={() => setReportType(report.id)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                reportType === report.id
                  ? 'border-primary bg-primary/5'
                  : 'border-subtle hover:border-primary/50'
              }`}
            >
              <div className="font-bold text-on-surface">{report.label}</div>
              <div className="text-xs text-on-surface-variant mt-1">{report.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <h2 className="text-lg font-bold text-on-surface mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all-time">All Time</option>
              <option value="this-month">This Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Year</option>
              <option value="last-year">Last Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.code} value={dept.code}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
              <Filter size={16} className="inline mr-2" /> Apply
            </button>
          </div>
        </div>
      </div>

      {/* Report Data Display */}
      {reportData && (
        <>
          {/* Summary Metrics */}
          {reportData.summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(reportData.summary).map(([key, value]) => (
                <div key={key} className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-shadow">
                  <div className="text-on-surface-variant text-sm font-medium mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-3xl font-bold text-primary">{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tables or Charts based on report type */}
          {reportData.data && Array.isArray(reportData.data) && (
            <div className="bg-white rounded-lg border border-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-container-low border-b border-subtle">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Name</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-on-surface">Value</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-on-surface">Percentage</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-on-surface">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle">
                    {reportData.data.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-4 font-medium text-on-surface">
                          {row.name || row.department || row.category || 'Item ' + (idx + 1)}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-primary">{row.value || row.count || 0}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 bg-surface-container-low rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${Math.min(((row.value || row.count || 0) / (reportData.summary?.total || 1)) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium text-on-surface-variant">
                              {((row.value || row.count || 0) / (reportData.summary?.total || 1) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {row.trend ? (
                            <span className={row.trend > 0 ? 'text-success' : 'text-danger'}>
                              {row.trend > 0 ? '↑' : '↓'} {Math.abs(row.trend).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-on-surface-variant">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Export Section */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <h2 className="text-lg font-bold text-on-surface mb-4">Export Report</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleDownloadReport('pdf')}
            className="flex items-center gap-2 px-6 py-2 bg-danger hover:bg-danger/90 text-white rounded-lg font-medium transition-colors"
          >
            <Download size={18} /> PDF
          </button>
          <button
            onClick={() => handleDownloadReport('excel')}
            className="flex items-center gap-2 px-6 py-2 bg-success hover:bg-success/90 text-white rounded-lg font-medium transition-colors"
          >
            <Download size={18} /> Excel
          </button>
          <button
            onClick={() => handleDownloadReport('csv')}
            className="flex items-center gap-2 px-6 py-2 bg-info hover:bg-info/90 text-white rounded-lg font-medium transition-colors"
          >
            <Download size={18} /> CSV
          </button>
        </div>
      </div>
    </div>
  );
}
