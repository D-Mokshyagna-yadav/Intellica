import { useState, useEffect } from 'react';
import { Shield, Lock, Key, Smartphone, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function SecurityAccountSettings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    lastPasswordChange: null,
    activeSessions: [],
    loginHistory: [],
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/settings/security').catch(() => ({}));
        setSettings(prev => ({ ...prev, ...data }));
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load security settings' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast({ type: 'warning', message: 'Passwords do not match' });
      return;
    }

    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      showToast({ type: 'success', message: 'Password changed successfully' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to change password' });
    }
  };

  if (loading) return <LoadingState message="Loading security settings..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <Shield className="text-primary" /> Security & Account Settings
        </h1>
        <p className="text-on-surface-variant">Manage your account security and privacy settings</p>
      </div>

      {/* Password Management */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <Key size={24} /> Password Management
        </h2>
        {!showChangePassword ? (
          <div>
            <p className="text-on-surface-variant mb-4">Last changed: {settings.lastPasswordChange ? new Date(settings.lastPasswordChange).toLocaleDateString() : 'Never'}</p>
            <button onClick={() => setShowChangePassword(true)} className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
              Change Password
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle bg-white focus:outline-none focus:border-primary" />
            <input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle bg-white focus:outline-none focus:border-primary" />
            <input type="password" placeholder="Confirm Password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-subtle bg-white focus:outline-none focus:border-primary" />
            <div className="flex gap-2">
              <button onClick={handleChangePassword} className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
                Update Password
              </button>
              <button onClick={() => setShowChangePassword(false)} className="flex-1 px-4 py-2 border border-subtle text-on-surface rounded-lg font-medium hover:bg-surface-container-low transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <Smartphone size={24} /> Two-Factor Authentication
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-on-surface-variant">Enhance your account security with 2FA</p>
            <p className="text-sm text-on-surface-variant mt-1">Status: {settings.twoFactorEnabled ? '✓ Enabled' : '✗ Disabled'}</p>
          </div>
          <button className={`w-12 h-7 rounded-full transition-colors ${settings.twoFactorEnabled ? 'bg-success' : 'bg-surface-container-high'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'} top-1 relative`} />
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <h2 className="text-xl font-bold text-on-surface mb-4">Active Sessions</h2>
        {settings.activeSessions?.length > 0 ? (
          <div className="space-y-3">
            {settings.activeSessions.map((session, idx) => (
              <div key={idx} className="p-3 border border-subtle rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface">{session.device || 'Device'}</p>
                  <p className="text-sm text-on-surface-variant">{session.ip || 'Unknown IP'}</p>
                </div>
                <button className="text-sm text-danger font-medium hover:underline">Logout</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant">Only current session active</p>
        )}
      </div>

      {/* Login History */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <h2 className="text-xl font-bold text-on-surface mb-4">Recent Login Activity</h2>
        <div className="space-y-2 text-sm">
          {settings.loginHistory?.slice(0, 5).map((login, idx) => (
            <div key={idx} className="flex justify-between text-on-surface-variant">
              <span>{login.device || 'Unknown'}</span>
              <span>{new Date(login.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
