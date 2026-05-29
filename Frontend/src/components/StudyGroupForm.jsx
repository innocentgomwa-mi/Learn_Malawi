import { useEffect, useRef, useState } from "react";
import { X, ImagePlus, Users, GraduationCap, Loader2 } from "lucide-react";
import { fetchTeachers } from "@/api";
import {
  YELLOW_BUTTON_CLASS,
  YELLOW_BUTTON_MD,
  OUTLINE_BUTTON_CLASS,
  SEARCH_INPUT_CLASS,
} from "@/lib/resourcePageStyles";

const INPUT_CLASS = SEARCH_INPUT_CLASS;
const LABEL_CLASS = "mb-1 block text-xs font-medium text-blue-950";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function resolveIconPreview(url) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${API_BASE_URL}${url}`;
}

function teacherLabel(teacher) {
  const name = [teacher.firstName, teacher.lastName].filter(Boolean).join(" ").trim();
  return name || teacher.email?.split("@")[0] || teacher.email;
}

/**
 * @param {{
 *   initial?: Record<string, unknown>;
 *   onSave: (data: Record<string, unknown>) => Promise<void>;
 *   onCancel: () => void;
 *   title?: string;
 *   showScheduleFields?: boolean;
 * }} props
 */
export default function StudyGroupForm({
  initial = {},
  onSave,
  onCancel,
  title = "Create Study Group",
  showScheduleFields = false,
}) {
  const [data, setData] = useState({
    name: initial.name || "",
    subject: initial.subject || "",
    level: initial.level || "",
    description: initial.description || "",
    mentor_email: initial.mentor_email || "",
    mentor_name: initial.mentor_name || "",
    scheduled_date: initial.scheduled_date || "",
    scheduled_time: initial.scheduled_time || "",
  });
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(() =>
    resolveIconPreview(initial.icon_url || initial.iconUrl || ""),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoadingTeachers(true);
    fetchTeachers()
      .then((list) => {
        if (!active) return;
        setTeachers(Array.isArray(list) ? list : list?.data ?? []);
      })
      .catch(() => {
        if (active) setTeachers([]);
      })
      .finally(() => {
        if (active) setLoadingTeachers(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handle = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const handleMentorChange = (email) => {
    const teacher = teachers.find((t) => t.email === email);
    setData((prev) => ({
      ...prev,
      mentor_email: email,
      mentor_name: teacher ? teacherLabel(teacher) : "",
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (PNG, JPEG, or WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }
    setError("");
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const clearIcon = () => {
    setIconFile(null);
    setIconPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!data.name?.trim() || !data.subject?.trim() || !data.level) {
      setError("Name, subject, and level are required.");
      return;
    }
    if (!data.mentor_email) {
      setError("Please select a teacher mentor for your group.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave({ ...data, iconFile });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-blue-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-blue-200 bg-gradient-to-r from-blue-950 to-blue-900 px-5 py-4 text-white">
          <h3 className="font-poppins text-lg font-bold">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-blue-100 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div>
            <label className={LABEL_CLASS}>Group icon</label>
            <p className="mb-2 text-xs text-blue-900/60">
              This image appears on the group card so members can recognize your study room.
            </p>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/40 p-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-blue-200 bg-yellow-100">
                {iconPreview ? (
                  <img src={iconPreview} alt="Group icon preview" className="h-full w-full object-cover" />
                ) : (
                  <Users className="h-10 w-10 text-blue-400" strokeWidth={1.5} />
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className={YELLOW_BUTTON_MD}>
                  <ImagePlus className="h-4 w-4" />
                  {iconPreview ? "Change image" : "Upload image"}
                </button>
                {iconPreview && (
                  <button type="button" onClick={clearIcon} className={OUTLINE_BUTTON_CLASS}>
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleIconChange}
                className="sr-only"
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Group name *</label>
            <input
              value={data.name}
              onChange={(e) => handle("name", e.target.value)}
              required
              className={INPUT_CLASS}
              placeholder="e.g. MSCE Physics Revision"
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Subject *</label>
            <input
              value={data.subject}
              onChange={(e) => handle("subject", e.target.value)}
              required
              className={INPUT_CLASS}
              placeholder="e.g. Physics"
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Level *</label>
            <select
              value={data.level}
              onChange={(e) => handle("level", e.target.value)}
              required
              className={INPUT_CLASS}
            >
              <option value="">Select level…</option>
              <option value="PSLC">PSLC</option>
              <option value="JCE">JCE</option>
              <option value="MSCE">MSCE</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS}>Description</label>
            <textarea
              value={data.description}
              onChange={(e) => handle("description", e.target.value)}
              rows={4}
              className={`${INPUT_CLASS} resize-none`}
              placeholder="What will this group focus on?"
            />
          </div>

          <div>
            <label className={`${LABEL_CLASS} flex items-center gap-1.5`}>
              <GraduationCap className="h-3.5 w-3.5 text-blue-700" />
              Teacher mentor *
            </label>
            <p className="mb-2 text-xs text-blue-900/60">
              Choose a teacher to supervise your group. They can monitor activity, remove members, and delete the group if needed.
            </p>
            {loadingTeachers ? (
              <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/50 px-3 py-2.5 text-sm text-blue-800">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading teachers…
              </div>
            ) : teachers.length === 0 ? (
              <p className="text-sm text-red-600">No teachers are available. Please try again later.</p>
            ) : (
              <select
                value={data.mentor_email}
                onChange={(e) => handleMentorChange(e.target.value)}
                required
                className={INPUT_CLASS}
              >
                <option value="">Select a teacher…</option>
                {teachers.map((teacher) => (
                  <option key={teacher.email} value={teacher.email}>
                    {teacherLabel(teacher)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {showScheduleFields && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS}>Scheduled date</label>
                <input
                  type="date"
                  value={data.scheduled_date}
                  onChange={(e) => handle("scheduled_date", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Scheduled time</label>
                <input
                  type="time"
                  value={data.scheduled_time}
                  onChange={(e) => handle("scheduled_time", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onCancel} className={`${OUTLINE_BUTTON_CLASS} flex-1 py-2.5`}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loadingTeachers || teachers.length === 0}
              className={`${YELLOW_BUTTON_CLASS} flex-1 py-2.5 disabled:opacity-50`}
            >
              {saving ? "Saving…" : "Create group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
