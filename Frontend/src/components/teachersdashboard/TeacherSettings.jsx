import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { updateProfile } from '@/api';

export default function TeacherSettings() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState(
    /** @type {{ full_name: string; school: string }} */ ({ full_name: '', school: '' }),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || user.firstName || '',
        school: user.school || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      await updateProfile({ school: form.school });
      await refreshUser();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : String(saveError);
      setError(message || 'Unable to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /** @param {import('react').ChangeEvent<HTMLInputElement>} event */
  const handleSchoolChange = (event) => {
    setForm((prev) => ({ ...prev, school: event.target.value }));
  };

  return (
    <div className="p-8 animate-fade-in max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile and preferences</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-bold">
            {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold">{user?.full_name || user?.firstName || 'Teacher'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full capitalize">
              {user?.role || 'teacher'}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Full Name</label>
          <input
            type="text"
            value={form.full_name}
            disabled
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 shadow-sm"
          />
          <p className="text-xs text-slate-500">Name is managed by your account and cannot be changed here.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">School / Institution</label>
          <input
            type="text"
            value={form.school}
            onChange={handleSchoolChange}
            placeholder="e.g. Kamuzu Academy"
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            '✓ Saved!'
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
}
