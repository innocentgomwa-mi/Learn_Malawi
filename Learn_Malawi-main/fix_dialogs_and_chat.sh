#!/usr/bin/env bash
# =============================================================================
#  fix_dialogs_and_chat.sh
#
#  Run from your project root:
#    cd ~/Projects/LM/Learn_Malawi/Learn_Malawi-main
#    bash fix_dialogs_and_chat.sh
#
#  What it does:
#   1. Creates a shared ConfirmModal component used everywhere
#   2. Replaces every browser confirm() across all 8 affected files with
#      the new UI modal — covers study groups, students, quizzes, notes,
#      tutorials, past papers, career resources, learning paths
#   3. Renames "Enter Group" → "Start Chat" in StudyGroupsAdmin
# =============================================================================
set -euo pipefail
ROOT="$(pwd)"
UI="$ROOT/Frontend/src/components/ui"
TD="$ROOT/Frontend/src/components/teachersdashboard"
TC="$ROOT/Frontend/src/components/teacher"
PG="$ROOT/Frontend/src/pages"

die() { echo "❌  $*" >&2; exit 1; }
bak() { cp "$1" "$1.bak.$(date +%s)"; }

[[ -d "$UI" ]]  || die "Cannot find Frontend/src/components/ui — are you in the project root?"
[[ -d "$TD" ]]  || die "Cannot find Frontend/src/components/teachersdashboard"
[[ -d "$TC" ]]  || die "Cannot find Frontend/src/components/teacher"
[[ -d "$PG" ]]  || die "Cannot find Frontend/src/pages"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Learn Malawi — UI Dialogs + Start Chat Fix         ║"
echo "╚══════════════════════════════════════════════════════╝"

# =============================================================================
# STEP 1 — Create shared ConfirmModal component
# =============================================================================
echo ""
echo "1/10  Writing shared ConfirmModal component…"

cat > "$UI/ConfirmModal.jsx" << 'MODAL'
/**
 * ConfirmModal — replaces browser confirm() everywhere in the app.
 *
 * Usage:
 *   const [dialog, setDialog] = useState(null);
 *
 *   // trigger:
 *   setDialog({
 *     title: "Delete quiz",
 *     message: "Are you sure you want to delete this quiz? This cannot be undone.",
 *     confirmLabel: "Delete",       // optional, default "Confirm"
 *     danger: true,                 // optional — makes confirm button red
 *     onConfirm: () => doDelete(),
 *   });
 *
 *   // render (anywhere in return):
 *   <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />
 */
import { useEffect, useRef } from "react";
import { AlertTriangle, Info } from "lucide-react";

export default function ConfirmModal({ dialog, onClose }) {
  const cancelRef = useRef(null);

  /* auto-focus cancel on open so pressing Enter doesn't accidentally confirm */
  useEffect(() => {
    if (dialog) cancelRef.current?.focus();
  }, [dialog]);

  /* close on Escape */
  useEffect(() => {
    if (!dialog) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dialog, onClose]);

  if (!dialog) return null;

  const { title, message, confirmLabel = "Confirm", danger = false, onConfirm } = dialog;

  const handleConfirm = () => {
    onClose();
    onConfirm?.();
  };

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* icon + title */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`shrink-0 flex items-center justify-center rounded-full w-9 h-9 ${danger ? "bg-red-100" : "bg-amber-100"}`}>
            {danger
              ? <AlertTriangle className="h-4 w-4 text-red-600" />
              : <Info className="h-4 w-4 text-amber-600" />
            }
          </div>
          <div>
            <p className="font-semibold text-foreground leading-tight">{title}</p>
            {message && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{message}</p>}
          </div>
        </div>

        {/* actions */}
        <div className="flex gap-2 justify-end mt-5">
          <button
            ref={cancelRef}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
              danger
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
MODAL
echo "   ✅  ConfirmModal.jsx created"

# =============================================================================
# STEP 2 — StudyGroupsAdmin: rename "Enter Group" → "Start Chat"
#          AND replace all confirm() calls with ConfirmModal
# =============================================================================
echo "2/10  Patching StudyGroupsAdmin.jsx (Start Chat + modal dialogs)…"
bak "$TC/StudyGroupsAdmin.jsx"

python3 - "$TC/StudyGroupsAdmin.jsx" << 'PY'
import sys, re
path = sys.argv[1]
src  = open(path).read()

# 1. rename button label
src = src.replace('<MessageSquare className="h-3.5 w-3.5" /> Enter Group', '<MessageSquare className="h-3.5 w-3.5" /> Start Chat')

# 2. Add ConfirmModal import after the last existing import line
old_import_anchor = "} from \"lucide-react\";"
new_import_block  = "} from \"lucide-react\";\nimport ConfirmModal from '@/components/ui/ConfirmModal';"
assert old_import_anchor in src, "lucide import anchor not found"
src = src.replace(old_import_anchor, new_import_block, 1)

# 3. Add dialog state after the first useState inside StudyGroupsAdmin
old_state = "  const [groups,      setGroups]      = useState([]);"
new_state = "  const [groups,      setGroups]      = useState([]);\n  const [dialog,      setDialog]      = useState(null);"
assert old_state in src, "groups state not found"
src = src.replace(old_state, new_state, 1)

# 4. Replace each confirm() call — StudyGroupsAdmin has 4
replacements = [
  # join as mentor
  (
    "    if (!confirm(`Join \"${group.name}\" as mentor?`)) return;",
    """    setDialog({ title: "Join as mentor", message: `Join "${group.name}" as mentor?`, confirmLabel: "Join", onConfirm: async () => {
      setProcessing(group.id + "-join");
      try {
        const members = group.members || [];
        await updateStudyGroup(group.id, {
          mentor_email: user.email,
          mentor_name:  user.full_name || user.email.split("@")[0],
          members: members.includes(user.email) ? members : [...members, user.email],
        });
        await load();
      } catch (e) { alert(e?.message || "Failed to join group"); }
      finally { setProcessing(null); }
    }});
    return; // wait for modal"""
  ),
  # delete — not a member (join + delete)
  (
    '      if (!confirm(`You are not yet a member of "${group.name}". Join and delete?`)) return;',
    """      setDialog({ title: "Join and delete", message: `You are not yet a member of "${group.name}". Join the group and then delete it?`, confirmLabel: "Join & Delete", danger: true, onConfirm: async () => {
        setProcessing(group.id + "-delete");
        try {
          const members = group.members || [];
          await updateStudyGroup(group.id, {
            mentor_email: user.email,
            mentor_name:  user.full_name || user.email.split("@")[0],
            members: members.includes(user.email) ? members : [...members, user.email],
          });
          await deleteStudyGroup(group.id);
          if (activeGroup?.id === group.id) setActiveGroup(null);
          await load();
        } catch (e) { alert(e?.message || "Failed to delete group"); }
        finally { setProcessing(null); }
      }});
      return; // wait for modal"""
  ),
  # delete — is a member
  (
    '    if (!confirm(`Delete study group "${group.name}"? This cannot be undone.`)) return;',
    """    setDialog({ title: "Delete study group", message: `Delete "${group.name}"? This cannot be undone.`, confirmLabel: "Delete", danger: true, onConfirm: async () => {
      setProcessing(group.id + "-delete");
      try {
        await deleteStudyGroup(group.id);
        if (activeGroup?.id === group.id) setActiveGroup(null);
        await load();
      } catch (e) { alert(e?.message || "Failed to delete group"); }
      finally { setProcessing(null); }
    }});
    return; // wait for modal"""
  ),
]

for old, new in replacements:
    if old in src:
        src = src.replace(old, new, 1)
    else:
        print(f"   ⚠️  Could not find: {old[:60]}...")

# 5. Wire <ConfirmModal> into the JSX return — append before the last closing tag of main return
# Find the outer closing div of the list view
old_closing = "    </div>\n  );\n}\n"
new_closing  = "    <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />\n    </div>\n  );\n}\n"
if old_closing in src:
    # replace only the last occurrence
    idx = src.rfind(old_closing)
    src = src[:idx] + new_closing + src[idx+len(old_closing):]
else:
    print("   ⚠️  Could not wire ConfirmModal into JSX — add manually")

open(path, 'w').write(src)
print("   ✅  StudyGroupsAdmin.jsx")
PY

# =============================================================================
# STEP 3 — StudyGroups.jsx (student page)
# =============================================================================
echo "3/10  Patching StudyGroups.jsx…"
bak "$PG/StudyGroups.jsx"

python3 - "$PG/StudyGroups.jsx" << 'PY'
import sys
path = sys.argv[1]
src  = open(path).read()

# Add import
old_import = "import RequireAccount from '@/components/RequireAccount';"
new_import  = "import RequireAccount from '@/components/RequireAccount';\nimport ConfirmModal from '@/components/ui/ConfirmModal';"
assert old_import in src
src = src.replace(old_import, new_import, 1)

# Add state after pendingTimers ref
old_state = "  const pendingTimers = useRef({});"
new_state  = "  const pendingTimers = useRef({});\n  const [dialog, setDialog] = useState(null);"
assert old_state in src
src = src.replace(old_state, new_state, 1)

# Replace leaveGroup confirm
old_leave = "    if (!confirm(`Leave study group \"${group.name}\"?`)) return;"
new_leave  = """    setDialog({ title: "Leave group", message: `Leave study group "${group.name}"?`, confirmLabel: "Leave", danger: true, onConfirm: async () => {
      const updatedMembers = (group.members || []).filter((m) => m !== user.email);
      const payload = { members: updatedMembers };
      if (group.mentor_email === user.email) { payload.mentor_email = null; payload.mentor_name = null; }
      try {
        const updated = await updateStudyGroup(group.id, payload);
        setGroups((prev) => prev.map((g) => (g.id === group.id ? updated : g)));
        setActiveGroup(null);
      } catch (err) { alert(err?.message || 'Failed to leave group'); }
    }});
    return;"""
assert old_leave in src, "leaveGroup confirm not found"
# Remove the original logic that runs after confirm (it's now inside onConfirm above)
# The original code after the confirm line needs to be removed
old_leave_body = """    if (!confirm(`Leave study group \"${group.name}\"?`)) return;
    const updatedMembers = members.filter((m) => m !== user.email);
    const payload = { members: updatedMembers };
    if (group.mentor_email === user.email) { payload.mentor_email = null; payload.mentor_name = null; }
    try {
      const updated = await updateStudyGroup(group.id, payload);
      setGroups((prev) => prev.map((g) => (g.id === group.id ? updated : g)));
      setActiveGroup(null);
    } catch (err) { alert(err?.message || 'Failed to leave group'); }"""
if old_leave_body in src:
    src = src.replace(old_leave_body, new_leave, 1)
else:
    src = src.replace(old_leave, new_leave, 1)

# Replace handleDelete confirm
old_del = "    if (!confirm(`Delete study group \"${group.name}\"? You can undo within 5 seconds.`)) return;"
new_del  = """    setDialog({ title: "Delete study group", message: `Delete "${group.name}"? You can undo within 5 seconds.`, confirmLabel: "Delete", danger: true, onConfirm: () => {
      setGroups((prev) => prev.filter((g) => g.id !== group.id));
      if (activeGroup?.id === group.id) setActiveGroup(null);
      setPendingDeletes((prev) => [...prev, { id: group.id, name: group.name, data: group }]);
      const timer = setTimeout(async () => {
        try { await deleteStudyGroup(group.id); }
        catch (err) { setGroups((prev) => [group, ...prev]); }
        finally { setPendingDeletes((prev) => prev.filter((p) => p.id !== group.id)); delete pendingTimers.current[group.id]; }
      }, 5000);
      pendingTimers.current[group.id] = timer;
    }});
    return;"""
# Remove old body too
old_del_body = """    if (!confirm(`Delete study group \"${group.name}\"? You can undo within 5 seconds.`)) return;
    setGroups((prev) => prev.filter((g) => g.id !== group.id));
    if (activeGroup?.id === group.id) setActiveGroup(null);
    setPendingDeletes((prev) => [...prev, { id: group.id, name: group.name, data: group }]);
    const timer = setTimeout(async () => {
      try { await deleteStudyGroup(group.id); }
      catch (err) { setGroups((prev) => [group, ...prev]); }
      finally { setPendingDeletes((prev) => prev.filter((p) => p.id !== group.id)); delete pendingTimers.current[group.id]; }
    }, 5000);
    pendingTimers.current[group.id] = timer;"""
if old_del_body in src:
    src = src.replace(old_del_body, new_del, 1)
else:
    src = src.replace(old_del, new_del, 1)

# Add ConfirmModal to JSX — before the closing </div> of the outer return
target = "      {form && <ResourceForm"
src = src.replace(target, "      <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />\n      " + target, 1)

open(path, 'w').write(src)
print("   ✅  StudyGroups.jsx")
PY

# =============================================================================
# STEP 4 — TeachersStudents.jsx
# =============================================================================
echo "4/10  Patching TeachersStudents.jsx…"
bak "$TC/TeachersStudents.jsx" 2>/dev/null || bak "$TD/TeachersStudents.jsx" 2>/dev/null || true
TARGET_TS="$TC/TeachersStudents.jsx"
[[ -f "$TARGET_TS" ]] || TARGET_TS="$TD/TeachersStudents.jsx"

python3 - "$TARGET_TS" << 'PY'
import sys
path = sys.argv[1]
src  = open(path).read()

# import
old_imp = "import { fetchStudyGroups, updateStudyGroup, createAnnouncement } from '@/api';"
new_imp  = "import { fetchStudyGroups, updateStudyGroup, createAnnouncement } from '@/api';\nimport ConfirmModal from '@/components/ui/ConfirmModal';"
assert old_imp in src
src = src.replace(old_imp, new_imp, 1)

# add dialog state after processing state
old_state = "  const [processing, setProcessing] = useState(false);"
new_state  = "  const [processing, setProcessing] = useState(false);\n  const [dialog,     setDialog]     = useState(null);"
assert old_state in src
src = src.replace(old_state, new_state, 1)

# replace confirm
old_conf = "    if (!confirm(`Remove ${studentEmail} from ${groupName}?`)) return;"
new_conf  = """    setDialog({ title: "Remove student", message: `Remove ${studentEmail} from ${groupName}? They will be banned from rejoining.`, confirmLabel: "Remove", danger: true, onConfirm: async () => {
      setProcessing(true);
      try {
        const group = groups.find((item) => item.id === groupId);
        if (!group) return;
        const updatedMembers = (group.members || []).filter((email) => email !== studentEmail);
        const updatedBanned = Array.from(new Set([...(group.banned_members || []), studentEmail]));
        await updateStudyGroup(groupId, { members: updatedMembers, banned_members: updatedBanned });
        await createAnnouncement({ title: \`Removed from \${group.name}\`, body: \`\${studentEmail} has been removed from the study group "\${group.name}".\`, targetAudience: 'students', isPublished: true });
      } catch (error) { console.error(error); alert('Unable to remove student. Please try again.'); }
      finally { setProcessing(false); await loadStudents(); }
    }});
    return;"""
# strip old body
old_body = """    if (!confirm(`Remove ${studentEmail} from ${groupName}?`)) return;
    setProcessing(true);
    try {
      const group = groups.find((item) => item.id === groupId);
      if (!group) return;

      const updatedMembers = (group.members || []).filter((email) => email !== studentEmail);
      const updatedBanned = Array.from(new Set([...(group.banned_members || []), studentEmail]));

      await updateStudyGroup(groupId, {
        members: updatedMembers,
        banned_members: updatedBanned,
      });

      await createAnnouncement({
        title: `Removed from ${group.name}`,
        body: `${studentEmail} has been removed from the study group \"${group.name}\" and will no longer be able to post in that group.`,
        targetAudience: 'students',
        isPublished: true,
      });
    } catch (error) {
      console.error(error);
      alert('Unable to remove student from group. Please try again.');
    } finally {
      setProcessing(false);
      await loadStudents();
    }"""
if old_body in src:
    src = src.replace(old_body, new_conf, 1)
else:
    src = src.replace(old_conf, new_conf, 1)

# wire into JSX — before the last closing </div>
old_close = "  );\n}\n"
idx = src.rfind(old_close)
src = src[:idx] + "      <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />\n  " + old_close + src[idx+len(old_close):]

open(path, 'w').write(src)
print("   ✅  TeachersStudents.jsx")
PY

# =============================================================================
# STEP 5 — QuizzesAdmin.jsx
# =============================================================================
echo "5/10  Patching QuizzesAdmin.jsx…"
bak "$TD/QuizzesAdmin.jsx"

python3 - "$TD/QuizzesAdmin.jsx" << 'PY'
import sys
path = sys.argv[1]
src  = open(path).read()

old_imp = "import { filterByTeacher, sortByLatest } from './teacherUtils';"
new_imp  = "import { filterByTeacher, sortByLatest } from './teacherUtils';\nimport ConfirmModal from '@/components/ui/ConfirmModal';"
src = src.replace(old_imp, new_imp, 1)

old_state = "  const [modal, setModal] = useState({ open: false, existing: null });"
new_state  = "  const [modal,  setModal]  = useState({ open: false, existing: null });\n  const [dialog, setDialog] = useState(null);"
src = src.replace(old_state, new_state, 1)

old_del = """  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    await deleteQuiz(id);
    load();
  };"""
new_del  = """  const handleDelete = (id) => {
    setDialog({ title: "Delete quiz", message: "Are you sure you want to delete this quiz? This cannot be undone.", confirmLabel: "Delete", danger: true, onConfirm: async () => { await deleteQuiz(id); load(); } });
  };"""
assert old_del in src
src = src.replace(old_del, new_del, 1)

# wire before closing QuizModal
src = src.replace("      <QuizModal", "      <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />\n      <QuizModal", 1)

open(path, 'w').write(src)
print("   ✅  QuizzesAdmin.jsx")
PY

# =============================================================================
# STEP 6 — StudyNotesAdmin.jsx
# =============================================================================
echo "6/10  Patching StudyNotesAdmin.jsx…"
bak "$TD/StudyNotesAdmin.jsx"

python3 - "$TD/StudyNotesAdmin.jsx" << 'PY'
import sys
path = sys.argv[1]
src  = open(path).read()

old_imp = "import { filterByTeacher, sortByLatest } from './teacherUtils';"
new_imp  = "import { filterByTeacher, sortByLatest } from './teacherUtils';\nimport ConfirmModal from '@/components/ui/ConfirmModal';"
src = src.replace(old_imp, new_imp, 1)

old_state = "  const [modal, setModal] = useState({ open: false, existing: null });"
new_state  = "  const [modal,  setModal]  = useState({ open: false, existing: null });\n  const [dialog, setDialog] = useState(null);"
src = src.replace(old_state, new_state, 1)

old_del = """  const handleDelete = async (id) => {
    if (!confirm('Delete this study note?')) return;
    await deleteStudyNote(id);
    load();
  };"""
new_del  = """  const handleDelete = (id) => {
    setDialog({ title: "Delete study note", message: "Are you sure you want to delete this study note? This cannot be undone.", confirmLabel: "Delete", danger: true, onConfirm: async () => { await deleteStudyNote(id); load(); } });
  };"""
assert old_del in src
src = src.replace(old_del, new_del, 1)

src = src.replace("      <ResourceModal", "      <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />\n      <ResourceModal", 1)

open(path, 'w').write(src)
print("   ✅  StudyNotesAdmin.jsx")
PY

# =============================================================================
# STEP 7 — TutorialsAdmin.jsx
# =============================================================================
echo "7/10  Patching TutorialsAdmin.jsx…"
bak "$TD/TutorialsAdmin.jsx"

python3 - "$TD/TutorialsAdmin.jsx" << 'PY'
import sys
path = sys.argv[1]
src  = open(path).read()

old_imp = "import { filterByTeacher, sortByLatest } from './teacherUtils';"
new_imp  = "import { filterByTeacher, sortByLatest } from './teacherUtils';\nimport ConfirmModal from '@/components/ui/ConfirmModal';"
src = src.replace(old_imp, new_imp, 1)

old_state = "  const [modal, setModal] = useState({ open: false, existing: null });"
new_state  = "  const [modal,  setModal]  = useState({ open: false, existing: null });\n  const [dialog, setDialog] = useState(null);"
src = src.replace(old_state, new_state, 1)

old_del = """  const handleDelete = async (id) => {
    if (!confirm('Delete this tutorial?')) return;
    await deleteTutorial(id);
    load();
  };"""
new_del  = """  const handleDelete = (id) => {
    setDialog({ title: "Delete tutorial", message: "Are you sure you want to delete this tutorial? This cannot be undone.", confirmLabel: "Delete", danger: true, onConfirm: async () => { await deleteTutorial(id); load(); } });
  };"""
assert old_del in src
src = src.replace(old_del, new_del, 1)

src = src.replace("      <ResourceModal", "      <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />\n      <ResourceModal", 1)

open(path, 'w').write(src)
print("   ✅  TutorialsAdmin.jsx")
PY

# =============================================================================
# STEP 8 — PastPapersAdmin.jsx
# =============================================================================
echo "8/10  Patching PastPapersAdmin.jsx…"
bak "$TD/PastPapersAdmin.jsx"

python3 - "$TD/PastPapersAdmin.jsx" << 'PY'
import sys
path = sys.argv[1]
src  = open(path).read()

old_imp = "import { filterByTeacher, sortByLatest } from './teacherUtils';"
new_imp  = "import { filterByTeacher, sortByLatest } from './teacherUtils';\nimport ConfirmModal from '@/components/ui/ConfirmModal';"
src = src.replace(old_imp, new_imp, 1)

old_state = "  const [modal, setModal] = useState(/** @type {{ open: boolean; existing: PastPaperItem | null }} */ ({ open: false, existing: null }));"
new_state  = "  const [modal,  setModal]  = useState(/** @type {{ open: boolean; existing: PastPaperItem | null }} */ ({ open: false, existing: null }));\n  const [dialog, setDialog] = useState(null);"
src = src.replace(old_state, new_state, 1)

old_del = """  /** @param {string} id */
  const handleDelete = async (id) => {
    if (!confirm('Delete this past paper?')) return;
    await deletePastPaper(id);
    load();
  };"""
new_del  = """  /** @param {string} id */
  const handleDelete = (id) => {
    setDialog({ title: "Delete past paper", message: "Are you sure you want to delete this past paper? This cannot be undone.", confirmLabel: "Delete", danger: true, onConfirm: async () => { await deletePastPaper(id); load(); } });
  };"""
assert old_del in src
src = src.replace(old_del, new_del, 1)

src = src.replace("      <ResourceModal", "      <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />\n      <ResourceModal", 1)

open(path, 'w').write(src)
print("   ✅  PastPapersAdmin.jsx")
PY

# =============================================================================
# STEP 9 — CareerResourcesAdmin.jsx
# =============================================================================
echo "9/10  Patching CareerResourcesAdmin.jsx…"
bak "$TD/CareerResourcesAdmin.jsx"

python3 - "$TD/CareerResourcesAdmin.jsx" << 'PY'
import sys
path = sys.argv[1]
src  = open(path).read()

old_imp = "import { Button } from '@/components/ui/button';"
new_imp  = "import { Button } from '@/components/ui/button';\nimport ConfirmModal from '@/components/ui/ConfirmModal';"
assert old_imp in src
src = src.replace(old_imp, new_imp, 1)

old_state = "  const [form, setForm] = useState(initialForm);"
new_state  = "  const [form,   setForm]   = useState(initialForm);\n  const [dialog, setDialog] = useState(null);"
src = src.replace(old_state, new_state, 1)

old_del = """  const handleDelete = async (resource) => {
    if (!confirm('Delete this career resource?')) return;
    try {
      await deleteCareerResource(resource.id);
      await loadResources();
    } catch (error) {
      console.error(error);
    }
  };"""
new_del  = """  const handleDelete = (resource) => {
    setDialog({ title: "Delete career resource", message: `Delete "${resource.title}"? This cannot be undone.`, confirmLabel: "Delete", danger: true, onConfirm: async () => { try { await deleteCareerResource(resource.id); await loadResources(); } catch (error) { console.error(error); } } });
  };"""
assert old_del in src
src = src.replace(old_del, new_del, 1)

# wire before closing </div> of the outer return
old_close = "\n    </div>\n  );\n}\n"
idx = src.rfind(old_close)
src = src[:idx] + "\n      <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />" + old_close + src[idx+len(old_close):]

open(path, 'w').write(src)
print("   ✅  CareerResourcesAdmin.jsx")
PY

# =============================================================================
# STEP 10 — LearningPathsAdmin.jsx  (both the admin component and the student page)
# =============================================================================
echo "10/10  Patching LearningPathsAdmin.jsx + LearningPaths.jsx…"
bak "$TC/LearningPathsAdmin.jsx"

python3 - "$TC/LearningPathsAdmin.jsx" << 'PY'
import sys
path = sys.argv[1]
src  = open(path).read()

old_imp = "import { fetchLearningPaths,"
new_imp  = "import ConfirmModal from '@/components/ui/ConfirmModal';\nimport { fetchLearningPaths,"
src = src.replace(old_imp, new_imp, 1)

old_state = "  const [quizModal, setQuizModal] = useState({ open: false, milestoneIndex: null, existing: null });"
new_state  = "  const [quizModal, setQuizModal] = useState({ open: false, milestoneIndex: null, existing: null });\n  const [dialog,    setDialog]    = useState(null);"
assert old_state in src
src = src.replace(old_state, new_state, 1)

old_del = """  const handleDelete = async (id) => {
    if (!confirm(\"Delete this learning path?\")) return;
    try {
      await deleteLearningPath(id);
      await load();
    } catch (error) {
      console.error(error);
    }
  };"""
new_del  = """  const handleDelete = (id) => {
    setDialog({ title: "Delete learning path", message: "Are you sure you want to delete this learning path? All milestones will be lost.", confirmLabel: "Delete", danger: true, onConfirm: async () => { try { await deleteLearningPath(id); await load(); } catch (error) { console.error(error); } } });
  };"""
assert old_del in src
src = src.replace(old_del, new_del, 1)

# wire before last closing brace
old_close = "\n  );\n}\n"  # end of LearningPathsAdmin return
# find last occurrence
idx = src.rfind(old_close)
src = src[:idx] + "\n      <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />" + old_close + src[idx+len(old_close):]

open(path, 'w').write(src)
print("   ✅  LearningPathsAdmin.jsx")
PY

# student-facing LearningPaths.jsx
bak "$PG/LearningPaths.jsx"

python3 - "$PG/LearningPaths.jsx" << 'PY'
import sys
path = sys.argv[1]
src  = open(path).read()

if 'ConfirmModal' in src:
    print("   ℹ️   LearningPaths.jsx already patched — skipping")
    sys.exit(0)

# find a safe import anchor
for anchor in ["import { useState", "import React"]:
    if anchor in src:
        src = src.replace(anchor, "import ConfirmModal from '@/components/ui/ConfirmModal';\n" + anchor, 1)
        break

# add dialog state — find useState call
import re
m = re.search(r'const \[[\w]+,\s*set\w+\] = useState', src)
if m:
    insert_pos = src.rfind('\n', 0, m.start()) + 1
    src = src[:insert_pos] + "  const [dialog, setDialog] = useState(null);\n" + src[insert_pos:]

old_del = '    if (!confirm("Delete this learning path?")) return;'
new_del  = """    setDialog({ title: "Delete learning path", message: "Are you sure you want to delete this learning path?", confirmLabel: "Delete", danger: true, onConfirm: async () => { try { await deleteLearningPath(id); await load(); } catch(e){ console.error(e); } } });
    return;"""
if old_del in src:
    # also remove duplicate body lines after the confirm if present
    src = src.replace(old_del, new_del, 1)

# wire ConfirmModal before last return closing tag
old_close = "\n  );\n}"
idx = src.rfind(old_close)
if idx != -1:
    src = src[:idx] + "\n      <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />" + old_close + src[idx+len(old_close):]

open(path, 'w').write(src)
print("   ✅  LearningPaths.jsx")
PY

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅  All patches applied.                            ║"
echo "║                                                      ║"
echo "║  Restart the frontend dev server to see changes:     ║"
echo "║    cd Frontend && npm run dev                        ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
