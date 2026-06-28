import { useState, useEffect } from 'react';
import { Users, Award, TrendingUp, Medal } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function FacultyLeaderboardRanking() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState('credits');
  const [timeframe, setTimeframe] = useState('semester');

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/ranking/faculty?type=${filterBy}&timeframe=${timeframe}`).catch(() => []);
        setRankings(data || []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load rankings' });
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [filterBy, timeframe]);

  if (loading) return <LoadingState message="Loading rankings..." />;

  const getMedalIcon = (rank) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return rank + 4;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <Medal className="text-primary" /> Faculty Leaderboard
        </h1>
        <p className="text-on-surface-variant">Institutional faculty rankings and performance metrics</p>
      </div>

      <div className="flex gap-4">
        <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary">
          <option value="credits">By Credits</option>
          <option value="achievements">By Achievements</option>
          <option value="publications">By Publications</option>
          <option value="rating">By Rating</option>
        </select>
        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary">
          <option value="semester">This Semester</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Top 3 Podium */}
      {rankings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {rankings.slice(0, 3).map((faculty, idx) => (
            <div key={faculty._id} className={`rounded-lg p-6 text-center ${idx === 0 ? 'border-2 border-yellow-500 bg-yellow-50' : idx === 1 ? 'border-2 border-gray-400 bg-gray-50' : 'border-2 border-orange-400 bg-orange-50'}`}>
              <div className="text-4xl mb-2">{getMedalIcon(idx)}</div>
              <h3 className="font-bold text-on-surface text-lg">{faculty.name}</h3>
              <p className="text-sm text-on-surface-variant mb-3">{faculty.department}</p>
              <p className="text-2xl font-bold text-primary">{faculty.score || 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="bg-white rounded-lg border border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container border-b border-subtle">
                <th className="px-6 py-3 text-left text-sm font-bold text-on-surface">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-on-surface">Faculty Name</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-on-surface">Department</th>
                <th className="px-6 py-3 text-right text-sm font-bold text-on-surface">{filterBy === 'credits' ? 'Credits' : filterBy === 'achievements' ? 'Achievements' : 'Score'}</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-on-surface">Progress</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((faculty, idx) => (
                <tr key={faculty._id} className="border-b border-subtle hover:bg-surface-container-low">
                  <td className="px-6 py-3 text-sm font-bold text-primary">{idx + 1}</td>
                  <td className="px-6 py-3 text-sm font-medium text-on-surface">{faculty.name}</td>
                  <td className="px-6 py-3 text-sm text-on-surface-variant">{faculty.department}</td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-on-surface">{faculty.score || 0}</td>
                  <td className="px-6 py-3">
                    <div className="w-20 mx-auto bg-surface-container rounded-full h-2">
                      <div style={{ width: `${Math.min((faculty.score || 0) / 10, 100)}%` }} className="bg-primary h-2 rounded-full" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rankings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-subtle">
          <Award size={40} className="mx-auto text-on-surface-variant mb-3 opacity-50" />
          <p className="text-on-surface-variant">No rankings available</p>
        </div>
      )}
    </div>
  );
}
