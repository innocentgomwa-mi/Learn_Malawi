import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { fetchProfile, updateProfile } from '@/api';

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Profile() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState(user);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', school: '', level: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const freshProfile = await fetchProfile();
        setProfile(freshProfile);
        setProfileForm({
          firstName: freshProfile.firstName || '',
          lastName: freshProfile.lastName || '',
          school: freshProfile.school || '',
          level: freshProfile.level || '',
        });
      } catch (fetchError) {
        setError(fetchError.message ?? 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setError(null);

    try {
      await updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        school: profileForm.school,
        level: profileForm.level,
      });
      await refreshUser();
      setProfile((current) => ({
        ...current,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        school: profileForm.school,
        level: profileForm.level,
      }));
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : String(saveError);
      setError(message || 'Unable to update profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const details = profile
    ? Object.entries(profile)
        .filter(([key, value]) => value !== undefined && value !== null && value !== '')
        .sort(([a], [b]) => a.localeCompare(b))
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your account information and keep your profile up to date.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading profile…
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Profile</h2>
              <p className="text-sm text-muted-foreground">Update your account information below.</p>
            </div>
            <button
              type="button"
              onClick={handleProfileSave}
              disabled={profileSaving}
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {profileSaving ? 'Saving...' : profileSaved ? 'Saved' : 'Save changes'}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-foreground">First Name</span>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, firstName: event.target.value }))}
                className="mt-2 block w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">Last Name</span>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, lastName: event.target.value }))}
                className="mt-2 block w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">School</span>
              <input
                type="text"
                value={profileForm.school}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, school: event.target.value }))}
                className="mt-2 block w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">Level</span>
              <select
                value={profileForm.level}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, level: event.target.value }))}
                className="mt-2 block w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="">Select level</option>
                <option value="PSLC">PSLC</option>
                <option value="JCE">JCE</option>
                <option value="MSCE">MSCE</option>
              </select>
            </label>
          </div>

          {details.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {details
                .filter(([key]) => !['firstName', 'lastName', 'school', 'level'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="rounded-3xl border border-border bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{formatLabel(key)}</p>
                    <p className="mt-2 break-words text-sm text-foreground">{String(value)}</p>
                  </div>
                ))}
            </div>
          )}

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        </div>
      )}
    </div>
  );
}
