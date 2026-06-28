import { useState, useEffect } from 'react';
import { Globe, User, Award, Share2 } from 'lucide-react';
import { apiFetch } from '../../api';
import { showToast } from '../../utils/toast';
import LoadingState from '../../components/LoadingState';

export default function PublicAcademicProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/faculty/public-profile').catch(() => ({}));
        setProfile(data);
        setIsPublic(data?.isPublic || false);
      } catch (error) {
        showToast({ type: 'error', message: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <LoadingState message="Loading profile..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <Globe className="text-primary" /> Public Academic Profile
        </h1>
        <p className="text-on-surface-variant">Manage your public academic profile and visibility</p>
      </div>

      {/* Profile Visibility */}
      <div className="bg-white rounded-lg border border-subtle p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Profile Visibility</h2>
            <p className="text-sm text-on-surface-variant">Control who can view your public profile</p>
          </div>
          <button className={`w-12 h-7 rounded-full transition-colors ${isPublic ? 'bg-success' : 'bg-surface-container-high'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'} top-1 relative`} />
          </button>
        </div>
        {isPublic && <p className="text-sm text-success">Your profile is publicly visible</p>}
      </div>

      {profile && (
        <>
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary to-primary/50 rounded-lg p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                <User size={48} />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{profile.name}</h2>
                <p className="text-white/80">{profile.designation} • {profile.department}</p>
                <p className="text-white/80">Faculty ID: {profile.employeeId}</p>
              </div>
            </div>
          </div>

          {/* Bio & Research */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-subtle p-6">
              <h3 className="text-xl font-bold text-on-surface mb-3">Professional Bio</h3>
              <p className="text-on-surface-variant text-sm">{profile.bio || 'No bio added yet'}</p>
            </div>

            <div className="bg-white rounded-lg border border-subtle p-6">
              <h3 className="text-xl font-bold text-on-surface mb-3">Research Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.researchInterests?.map((interest, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements & Publications */}
          <div className="bg-white rounded-lg border border-subtle p-6">
            <h3 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <Award /> Key Achievements
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-subtle">
                <span className="text-on-surface-variant">Total Credits</span>
                <span className="font-bold text-primary text-lg">{profile.totalCredits || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-subtle">
                <span className="text-on-surface-variant">Publications</span>
                <span className="font-bold text-primary text-lg">{profile.publications || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Awards & Recognitions</span>
                <span className="font-bold text-primary text-lg">{profile.awards || 0}</span>
              </div>
            </div>
          </div>

          {/* Share Profile */}
          <div className="bg-white rounded-lg border border-subtle p-6">
            <h3 className="text-lg font-bold text-on-surface mb-4">Share Your Profile</h3>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
                <Share2 size={18} /> Copy Link
              </button>
              <button className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors">
                Share on Social
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
