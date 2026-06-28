import { useState, useEffect } from 'react';
import { Settings, Save, Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function InstitutionalSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    institutionName: '',
    institutionCode: '',
    academicYear: '',
    semester: '',
    hostelCode: '',
    hostelName: '',
    principalName: '',
    principalEmail: '',
    registrarName: '',
    registrarEmail: '',
    accreditationStatus: '',
    accreditationBody: '',
    naacScore: '',
    systemSettings: {
      emailNotifications: true,
      twoFactorAuth: false,
      maintenanceMode: false,
      allowManualUserCreation: true,
      requireFacultyApproval: true,
      autoGenerateCredits: false,
    },
    creditSettings: {
      publicationMinCredits: 1,
      publicationMaxCredits: 5,
      conferenceMinCredits: 1,
      conferenceMaxCredits: 3,
      workshopMinCredits: 1,
      workshopMaxCredits: 2,
    },
  });

  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/settings');
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      showToast({ type: 'success', message: 'Settings saved successfully' });
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleToggle = (section, field) => {
    handleNestedChange(section, field, !settings[section][field]);
  };

  if (loading) {
    return <LoadingState message="Loading settings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Institutional Settings</h1>
          <p className="text-on-surface-variant">Configure system-wide parameters and institutional information</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white rounded-lg font-medium transition-colors"
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap bg-surface-container-low/30 p-2 rounded-lg border border-subtle">
        {[
          { id: 'general', label: 'General Information' },
          { id: 'system', label: 'System Settings' },
          { id: 'credits', label: 'Credit Configuration' },
          { id: 'accreditation', label: 'Accreditation' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-on-surface hover:bg-surface-container-high'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Information Tab */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg border border-subtle p-6 space-y-6">
          <h2 className="text-xl font-bold text-on-surface">General Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Institution Name</label>
              <input
                type="text"
                value={settings.institutionName}
                onChange={(e) => handleInputChange('institutionName', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Institution Code</label>
              <input
                type="text"
                value={settings.institutionCode}
                onChange={(e) => handleInputChange('institutionCode', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Academic Year</label>
              <input
                type="text"
                placeholder="e.g., 2024-2025"
                value={settings.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Semester</label>
              <select
                value={settings.semester}
                onChange={(e) => handleInputChange('semester', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">Select Semester</option>
                <option value="ODD">Odd</option>
                <option value="EVEN">Even</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Hostel Code</label>
              <input
                type="text"
                value={settings.hostelCode}
                onChange={(e) => handleInputChange('hostelCode', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Hostel Name</label>
              <input
                type="text"
                value={settings.hostelName}
                onChange={(e) => handleInputChange('hostelName', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Principal & Registrar Info */}
          <div className="border-t border-subtle pt-6">
            <h3 className="font-bold text-on-surface mb-4">Principal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Principal Name</label>
                <input
                  type="text"
                  value={settings.principalName}
                  onChange={(e) => handleInputChange('principalName', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Principal Email</label>
                <input
                  type="email"
                  value={settings.principalEmail}
                  onChange={(e) => handleInputChange('principalEmail', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Registrar Info */}
          <div className="border-t border-subtle pt-6">
            <h3 className="font-bold text-on-surface mb-4">Registrar Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Registrar Name</label>
                <input
                  type="text"
                  value={settings.registrarName}
                  onChange={(e) => handleInputChange('registrarName', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Registrar Email</label>
                <input
                  type="email"
                  value={settings.registrarEmail}
                  onChange={(e) => handleInputChange('registrarEmail', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-lg border border-subtle p-6 space-y-6">
          <h2 className="text-xl font-bold text-on-surface">System Settings</h2>

          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Enable Email Notifications', desc: 'Send email notifications to users' },
              { key: 'twoFactorAuth', label: 'Enable 2-Factor Authentication', desc: 'Require 2FA for login' },
              { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Restrict access for maintenance' },
              { key: 'allowManualUserCreation', label: 'Allow Manual User Creation', desc: 'Allow admins to manually create users' },
              { key: 'requireFacultyApproval', label: 'Require Faculty Approval', desc: 'Faculty accounts must be approved by HOD' },
              { key: 'autoGenerateCredits', label: 'Auto-generate Credits', desc: 'Automatically calculate credits based on rules' },
            ].map(setting => (
              <div key={setting.key} className="flex items-center justify-between p-4 border border-subtle rounded-lg hover:bg-surface-container-low transition-colors">
                <div>
                  <h4 className="font-medium text-on-surface">{setting.label}</h4>
                  <p className="text-sm text-on-surface-variant">{setting.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle('systemSettings', setting.key)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    settings.systemSettings[setting.key] ? 'bg-success' : 'bg-surface-container-high'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.systemSettings[setting.key] ? 'translate-x-6' : 'translate-x-1'
                    } top-1`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit Settings Tab */}
      {activeTab === 'credits' && (
        <div className="bg-white rounded-lg border border-subtle p-6 space-y-6">
          <h2 className="text-xl font-bold text-on-surface">Credit Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(settings.creditSettings).map(([key, value]) => {
              const isMin = key.endsWith('MinCredits');
              const isMax = key.endsWith('MaxCredits');
              const category = key.replace(/(MinCredits|MaxCredits)$/, '').replace(/([A-Z])/g, ' $1').trim();

              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">
                    {category} - {isMin ? 'Minimum' : 'Maximum'} Credits
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => handleNestedChange('creditSettings', key, parseFloat(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Accreditation Tab */}
      {activeTab === 'accreditation' && (
        <div className="bg-white rounded-lg border border-subtle p-6 space-y-6">
          <h2 className="text-xl font-bold text-on-surface">Accreditation Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Accreditation Status</label>
              <select
                value={settings.accreditationStatus}
                onChange={(e) => handleInputChange('accreditationStatus', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">Select Status</option>
                <option value="ACCREDITED">Accredited</option>
                <option value="RE_ACCREDITATION_PENDING">Re-accreditation Pending</option>
                <option value="UNACCREDITED">Unaccredited</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Accreditation Body</label>
              <input
                type="text"
                placeholder="e.g., NAAC, NBA"
                value={settings.accreditationBody}
                onChange={(e) => handleInputChange('accreditationBody', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">NAAC Score</label>
              <input
                type="number"
                min="0"
                max="4"
                step="0.1"
                value={settings.naacScore}
                onChange={(e) => handleInputChange('naacScore', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-white text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
