import { useState, useEffect } from 'react';
import { Activity, AlertCircle, TrendingUp, Database, Users, Zap } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function SystemHealthMonitoring() {
  const [health, setHealth] = useState({
    status: 'healthy',
    uptime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    databaseConnections: 0,
    activeUsers: 0,
    requestsPerSecond: 0,
    errors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/system/health').catch(() => ({}));
        setHealth(data);
        const logsData = await apiFetch('/system/logs').catch(() => []);
        setLogs(logsData || []);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load system health' });
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingState message="Loading system health..." />;

  const getStatusColor = (status) => {
    if (status === 'healthy') return 'text-success bg-success/10';
    if (status === 'warning') return 'text-yellow-600 bg-yellow-100';
    return 'text-danger bg-danger/10';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <Activity className="text-primary" /> System Health Monitoring
        </h1>
        <p className="text-on-surface-variant">Real-time monitoring of system performance and health</p>
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg p-6 text-white ${health.status === 'healthy' ? 'bg-success' : health.status === 'warning' ? 'bg-yellow-500' : 'bg-danger'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold capitalize">System Status: {health.status}</h2>
            <p className="text-white/80">Uptime: {Math.floor(health.uptime / 3600)} hours</p>
          </div>
          <Activity size={48} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-on-surface-variant">CPU Usage</span>
            <span className={`text-2xl font-bold ${health.cpuUsage > 80 ? 'text-danger' : health.cpuUsage > 60 ? 'text-yellow-600' : 'text-success'}`}>{health.cpuUsage}%</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-2">
            <div style={{ width: `${health.cpuUsage}%` }} className={`h-2 rounded-full ${health.cpuUsage > 80 ? 'bg-danger' : health.cpuUsage > 60 ? 'bg-yellow-600' : 'bg-success'}`} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-on-surface-variant">Memory Usage</span>
            <span className={`text-2xl font-bold ${health.memoryUsage > 80 ? 'text-danger' : health.memoryUsage > 60 ? 'text-yellow-600' : 'text-success'}`}>{health.memoryUsage}%</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-2">
            <div style={{ width: `${health.memoryUsage}%` }} className={`h-2 rounded-full ${health.memoryUsage > 80 ? 'bg-danger' : health.memoryUsage > 60 ? 'bg-yellow-600' : 'bg-success'}`} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-on-surface-variant">Requests/sec</span>
            <span className="text-2xl font-bold text-primary">{health.requestsPerSecond}</span>
          </div>
          <p className="text-xs text-on-surface-variant">Current rate</p>
        </div>

        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-on-surface-variant">DB Connections</span>
            <span className="text-2xl font-bold text-primary">{health.databaseConnections}</span>
          </div>
          <p className="text-xs text-on-surface-variant">Active connections</p>
        </div>

        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-on-surface-variant">Active Users</span>
            <span className="text-2xl font-bold text-primary">{health.activeUsers}</span>
          </div>
          <p className="text-xs text-on-surface-variant">Online now</p>
        </div>

        <div className="bg-white rounded-lg border border-subtle p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-on-surface-variant">Errors (24h)</span>
            <span className={`text-2xl font-bold ${health.errors > 10 ? 'text-danger' : 'text-success'}`}>{health.errors}</span>
          </div>
          <p className="text-xs text-on-surface-variant">Last 24 hours</p>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <h2 className="text-xl font-bold text-on-surface mb-4">Recent System Logs</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
          {logs.slice(0, 20).map((log, idx) => (
            <div key={idx} className={`p-2 rounded ${log.level === 'error' ? 'bg-danger/10 text-danger' : log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-surface-container text-on-surface-variant'}`}>
              [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
