import { useEffect, useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { fetchProfile, updateProfile } from "@/api";
import ResourcePageHero from "@/components/ResourcePageHero";
import {
  PAGE_WRAP,
  SPINNER_CLASS,
  YELLOW_BUTTON_CLASS,
  YELLOW_BUTTON_MD,
  OUTLINE_BUTTON_CLASS,
  SEARCH_INPUT_CLASS,
  CARD_CLASS,
} from "@/lib/resourcePageStyles";
import { User, Mail, School, GraduationCap, Settings, ImagePlus } from "lucide-react";

function formatLabel(key) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const HIDDEN_DETAIL_KEYS = ["firstName", "lastName", "school", "level", "profileImageUrl", "password"];

export default function Profile() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState(user);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", school: "", level: "" });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
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
          firstName: freshProfile.firstName || "",
          lastName: freshProfile.lastName || "",
          school: freshProfile.school || "",
          level: freshProfile.level || "",
        });
        setProfileImagePreview(freshProfile.profileImageUrl || "");
        setProfileImageFile(null);
      } catch (fetchError) {
        setError(fetchError.message ?? "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!profileImageFile) return;
    const previewUrl = URL.createObjectURL(profileImageFile);
    setProfileImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [profileImageFile]);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("firstName", profileForm.firstName);
      formData.append("lastName", profileForm.lastName);
      formData.append("school", profileForm.school);
      formData.append("level", profileForm.level);
      if (profileImageFile) formData.append("profileImage", profileImageFile);

      const updatedProfile = await updateProfile(formData);
      await refreshUser();
      setProfile((current) => ({ ...current, ...updatedProfile }));
      if (updatedProfile.profileImageUrl) setProfileImagePreview(updatedProfile.profileImageUrl);
      setProfileImageFile(null);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setProfileSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const displayName =
    [profileForm.firstName, profileForm.lastName].filter(Boolean).join(" ") ||
    profile?.email?.split("@")[0] ||
    "Student";

  const details = profile
    ? Object.entries(profile)
        .filter(
          ([key, value]) =>
            value !== undefined && value !== null && value !== "" && !HIDDEN_DETAIL_KEYS.includes(key),
        )
        .sort(([a], [b]) => a.localeCompare(b))
    : [];

  const inputClass = SEARCH_INPUT_CLASS.replace("pl-9 ", "");

  return (
    <div className={PAGE_WRAP}>
      <ResourcePageHero
        icon={User}
        title="My Profile"
        subtitle="Manage your account details, school information, and profile photo."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link to="/settings" className={OUTLINE_BUTTON_CLASS}>
          <Settings className="h-4 w-4" />
          Account settings
        </Link>
        <Link to="/dashboard" className={OUTLINE_BUTTON_CLASS}>
          View dashboard
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className={SPINNER_CLASS} />
        </div>
      ) : error && !profile ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">{error}</div>
      ) : (
        <div className={`${CARD_CLASS} p-6 sm:p-8`}>
          <div className="mb-8 flex flex-col gap-6 border-b border-blue-100 pb-8 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="h-28 w-28 overflow-hidden rounded-2xl border-4 border-yellow-300 bg-blue-50 shadow-md">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-yellow-100">
                    <User className="h-12 w-12 text-blue-400" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <label
                className={`absolute -bottom-2 -right-2 cursor-pointer ${YELLOW_BUTTON_MD} !rounded-full !p-2`}
                title="Upload photo"
              >
                <ImagePlus className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setProfileImageFile(file);
                  }}
                />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-poppins text-2xl font-bold text-blue-950">{displayName}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-blue-900/70">
                <Mail className="h-4 w-4" />
                {profile?.email}
              </p>
              {profileForm.level && (
                <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-900">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {profileForm.level}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleProfileSave}
              disabled={profileSaving}
              className={`${YELLOW_BUTTON_CLASS} shrink-0 px-5 py-2.5 text-sm disabled:opacity-50`}
            >
              {profileSaving ? "Saving…" : profileSaved ? "Saved ✓" : "Save changes"}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-800">First name</span>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-800">Last name</span>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-800">
                <School className="h-3.5 w-3.5" /> School
              </span>
              <input
                type="text"
                value={profileForm.school}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, school: e.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-800">Level</span>
              <select
                value={profileForm.level}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, level: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select level</option>
                <option value="PSLC">PSLC</option>
                <option value="JCE">JCE</option>
                <option value="MSCE">MSCE</option>
              </select>
            </label>
          </div>

          {details.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 font-poppins text-sm font-bold uppercase tracking-wide text-blue-950">
                Account details
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {details.map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-800/60">
                      {formatLabel(key)}
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-blue-950">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
