import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, BarChart3, LineChart } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function InsightsDashboard() {
  const [insights, setInsights] = useState({
    topPerformers: [],
    trendingAchievements: [],
    departmentAnalytics: [],
    facultyMetrics: [],
    recommendations: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/insights/dashboard').catch(() => ({}));
        setInsights(data);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load insights' });
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) return <LoadingState message="Loading insights..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <Brain className="text-primary" /> Insights Dashboard
        </h1>
        <p className="text-on-surface-variant">Data-driven insights and analytics for institutional growth</p>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <TrendingUp size={24} /> Top Performing Faculty
        </h2>
        <div className="space-y-3">
          {insights.topPerformers?.slice(0, 5).map((performer, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-surface-container-low rounded">
              <div>
                <p className="font-medium text-on-surface">{idx + 1}. {performer.name}</p>
                <p className="text-sm text-on-surface-variant">{performer.department}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{performer.credits || 0} credits</p>
                <p className="text-xs text-on-surface-variant">{performer.achievements || 0} achievements</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Achievements */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <TrendingUp size={24} /> Trending Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.trendingAchievements?.slice(0, 6).map((achievement, idx) => (
            <div key={idx} className="p-4 border border-subtle rounded-lg hover:shadow-lg transition-all">
              <p className="font-bold text-on-surface mb-2">{achievement.title}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">{achievement.count || 0} submissions</span>
                <span className="text-primary font-bold">↑ {achievement.trend || 0}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-subtle p-6">
          <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
            <BarChart3 size={24} /> Department Performance
          </h2>
          <div className="space-y-3">
            {insights.departmentAnalytics?.slice(0, 5).map((dept, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-on-surface">{dept.name}</span>
                  <span className="text-sm text-on-surface-variant">{dept.score || 0}%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div style={{ width: `${dept.score || 0}%` }} className="bg-primary h-2 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-subtle p-6">
          <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
            <LineChart size={24} /> Key Metrics
          </h2>
          <div className="space-y-3">
            {insights.facultyMetrics?.slice(0, 5).map((metric, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 border-b border-subtle last:border-0">
                <span className="text-on-surface-variant">{metric.label}</span>
                <span className="font-bold text-primary">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <Target size={24} /> Actionable Recommendations
        </h2>
        <div className="space-y-3">
          {insights.recommendations?.slice(0, 4).map((rec, idx) => (
            <div key={idx} className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-bold text-on-surface mb-1">{rec.title}</h3>
              <p className="text-sm text-on-surface-variant mb-2">{rec.description}</p>
              <button className="text-sm text-primary font-medium hover:underline">
                Learn more →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
