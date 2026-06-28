import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Target, Clock, BarChart3, Brain } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function AIInsightsPersonalization() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [personalizationSettings, setPersonalizationSettings] = useState({
    enableAIRecommendations: true,
    focusAreas: [],
    learningPreferences: 'balanced',
    goalDifficulty: 'medium',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [insightsData, recData, settingsData] = await Promise.all([
          apiFetch('/ai/insights').catch(() => []),
          apiFetch('/ai/recommendations').catch(() => []),
          apiFetch('/ai/settings').catch(() => ({})),
        ]);
        setInsights(insightsData || []);
        setRecommendations(recData || []);
        setPersonalizationSettings(prev => ({ ...prev, ...settingsData }));
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load AI insights' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingState message="Loading AI insights..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <Sparkles className="text-primary" /> AI-Powered Insights & Personalization
        </h1>
        <p className="text-on-surface-variant">Personalized recommendations powered by machine learning</p>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.slice(0, 6).map((insight, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3">
              <Brain className="text-primary" size={24} />
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-bold">{insight.confidence}%</span>
            </div>
            <h3 className="font-bold text-on-surface mb-2">{insight.title}</h3>
            <p className="text-sm text-on-surface-variant mb-3">{insight.description}</p>
            <div className="text-xs text-on-surface-variant">Impact: {insight.impact || 'Medium'}</div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <h2 className="text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <Target /> Recommended Focus Areas
        </h2>
        <div className="space-y-4">
          {recommendations.slice(0, 5).map((rec, idx) => (
            <div key={idx} className="p-4 border border-subtle rounded-lg hover:bg-surface-container-low transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-on-surface">{rec.category}</h3>
                <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full font-bold">{rec.potential}% potential</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-3">{rec.reason}</p>
              <button className="text-sm text-primary font-medium hover:underline">Start → </button>
            </div>
          ))}
        </div>
      </div>

      {/* Personalization Settings */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <h2 className="text-2xl font-bold text-on-surface mb-6">Personalization Settings</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-on-surface">Enable AI Recommendations</h3>
              <p className="text-sm text-on-surface-variant">Get personalized insights based on your profile</p>
            </div>
            <button className={`w-12 h-7 rounded-full transition-colors ${personalizationSettings.enableAIRecommendations ? 'bg-success' : 'bg-surface-container-high'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${personalizationSettings.enableAIRecommendations ? 'translate-x-6' : 'translate-x-1'} top-1 relative`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-3">Learning Style Preference</label>
            <select className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary">
              <option>Balanced (Recommended)</option>
              <option>Theory-focused</option>
              <option>Practical-focused</option>
              <option>Self-paced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-3">Goal Difficulty</label>
            <select className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary">
              <option>Beginner</option>
              <option selected>Intermediate</option>
              <option>Advanced</option>
              <option>Expert</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
