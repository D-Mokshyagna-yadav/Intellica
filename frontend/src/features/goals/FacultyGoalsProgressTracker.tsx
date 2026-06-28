import { useState, useEffect } from 'react';
import { Target, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function FacultyGoalsProgressTracker() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', targetDate: '', category: '' });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/goals').catch(() => []);
        setGoals(data || []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load goals' });
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.targetDate) {
      showToast({ type: 'warning', message: 'Please fill all required fields' });
      return;
    }

    try {
      await apiFetch('/goals', {
        method: 'POST',
        body: JSON.stringify(newGoal),
      });
      showToast({ type: 'success', message: 'Goal created successfully' });
      setNewGoal({ title: '', description: '', targetDate: '', category: '' });
      setShowNewGoal(false);
      // Refresh goals
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to create goal' });
    }
  };

  if (loading) return <LoadingState message="Loading goals..." />;

  const overallProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <Target className="text-primary" /> Goals & Progress Tracker
        </h1>
        <p className="text-on-surface-variant">Track your professional goals and monitor progress</p>
      </div>

      {/* Overall Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-subtle p-4">
          <p className="text-on-surface-variant text-sm font-medium">Total Goals</p>
          <p className="text-3xl font-bold text-on-surface">{goals.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4">
          <p className="text-on-surface-variant text-sm font-medium">Completed</p>
          <p className="text-3xl font-bold text-success">{goals.filter(g => g.completed).length}</p>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4">
          <p className="text-on-surface-variant text-sm font-medium">In Progress</p>
          <p className="text-3xl font-bold text-primary">{goals.filter(g => !g.completed && g.progress > 0).length}</p>
        </div>
        <div className="bg-white rounded-lg border border-subtle p-4">
          <p className="text-on-surface-variant text-sm font-medium">Overall Progress</p>
          <p className="text-3xl font-bold text-primary">{overallProgress}%</p>
        </div>
      </div>

      <button onClick={() => setShowNewGoal(!showNewGoal)} className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
        + Add New Goal
      </button>

      {showNewGoal && (
        <div className="bg-white rounded-lg border border-subtle p-6 space-y-4">
          <input type="text" placeholder="Goal Title" value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" />
          <textarea placeholder="Description" value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" />
          <select value={newGoal.category} onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle bg-white focus:outline-none focus:border-primary">
            <option value="">Select Category</option>
            <option value="research">Research</option>
            <option value="teaching">Teaching</option>
            <option value="publication">Publication</option>
            <option value="development">Professional Development</option>
          </select>
          <input type="date" value={newGoal.targetDate} onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle focus:outline-none focus:border-primary" />
          <div className="flex gap-2">
            <button onClick={handleCreateGoal} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
              Create Goal
            </button>
            <button onClick={() => setShowNewGoal(false)} className="flex-1 px-4 py-2 border border-subtle rounded-lg font-medium hover:bg-surface-container-low">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal._id} className="bg-white rounded-lg border border-subtle p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-on-surface text-lg">{goal.title}</h3>
                <p className="text-sm text-on-surface-variant">{goal.description}</p>
              </div>
              {goal.completed && <CheckCircle className="text-success" size={24} />}
            </div>
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-on-surface">Progress</span>
                <span className="text-sm text-on-surface-variant">{goal.progress || 0}%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2">
                <div style={{ width: `${goal.progress || 0}%` }} className="bg-primary h-2 rounded-full transition-all" />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-on-surface-variant">
              <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold">{goal.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
