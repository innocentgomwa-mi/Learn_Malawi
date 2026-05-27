#!/usr/bin/env bash
# =============================================================================
#  fix_study_groups.sh
#  Run from the project root:
#    cd ~/Projects/LM/Learn_Malawi/Learn_Malawi-main
#    bash fix_study_groups.sh
#
#  What it fixes:
#   1. 403 Forbidden when a teacher deletes a group they joined as mentor
#   2. Teacher sees themselves listed as a student in the members panel
#   3. StudyGroups.jsx card: after joining, show Delete + Exit buttons
#   4. StudyGroupsAdmin.jsx: teacher can enter a group, send messages,
#      upload resources (PDF/image/doc), and manage members — full parity
#      with students, from inside the group chat view
# =============================================================================
set -euo pipefail

ROOT="$(pwd)"
BE="$ROOT/Backend/src/study-groups"
FE_PAGES="$ROOT/Frontend/src/pages"
FE_COMP="$ROOT/Frontend/src/components/teacher"
API_FILE="$ROOT/Frontend/src/api/index.js"

# ── helpers ──────────────────────────────────────────────────────────────────
die()  { echo "❌  $*" >&2; exit 1; }
need() { [[ -f "$1" ]] || die "File not found: $1"; }
bak()  { cp "$1" "$1.bak.$(date +%s)" && echo "   💾 backed up $(basename $1)"; }

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║       Learn Malawi — Study Groups Fix Script         ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

need "$BE/study-groups.service.ts"
need "$BE/study-groups.controller.ts"
need "$FE_PAGES/StudyGroups.jsx"
need "$FE_COMP/StudyGroupsAdmin.jsx"
need "$API_FILE"

# =============================================================================
# PATCH 1 ── Backend service: fix 403 on teacher delete
#            Teachers who are member OR mentor can now delete student groups.
#            Teachers who created the group themselves can always delete it.
# =============================================================================
echo "1/5  Patching study-groups.service.ts  (403 fix + mentor removeMember)"
bak "$BE/study-groups.service.ts"

python3 - "$BE/study-groups.service.ts" <<'PY'
import sys
path = sys.argv[1]
src  = open(path).read()

OLD_REMOVE = """  async remove(id: string, user?: any): Promise<void> {
    const studyGroup = await this.findOne(id);
    if (!user) throw new ForbiddenException('Unauthorized');

    if (user.role === UserRole.STUDENT) {
      if (!studyGroup.creator_email || studyGroup.creator_email !== user.email)
        throw new ForbiddenException('You can only delete groups you created.');
      await this.studyGroupRepository.remove(studyGroup);
      return;
    }

    if (user.role === UserRole.TEACHER) {
      const isMember = (studyGroup.members || []).includes(user.email);
      if (!isMember) throw new ForbiddenException('You must join the group before deleting it.');
      const creator = studyGroup.creator_email
        ? await this.userRepository.findOne({ where: { email: studyGroup.creator_email } })
        : null;
      if (!creator || creator.role !== UserRole.STUDENT)
        throw new ForbiddenException('Teachers can only delete groups created by students.');
      await this.studyGroupRepository.remove(studyGroup);
      return;
    }

    throw new ForbiddenException('You are not allowed to delete this group.');
  }"""

NEW_REMOVE = """  async remove(id: string, user?: any): Promise<void> {
    const studyGroup = await this.findOne(id);
    if (!user) throw new ForbiddenException('Unauthorized');

    if (user.role === UserRole.STUDENT) {
      if (!studyGroup.creator_email || studyGroup.creator_email !== user.email)
        throw new ForbiddenException('You can only delete groups you created.');
      await this.studyGroupRepository.remove(studyGroup);
      return;
    }

    if (user.role === UserRole.TEACHER) {
      const isCreator = studyGroup.creator_email && studyGroup.creator_email === user.email;
      const isMember  = (studyGroup.members || []).includes(user.email);
      const isMentor  = studyGroup.mentor_email === user.email;

      if (isCreator) {
        await this.studyGroupRepository.remove(studyGroup);
        return;
      }
      if (isMember || isMentor) {
        const creator = studyGroup.creator_email
          ? await this.userRepository.findOne({ where: { email: studyGroup.creator_email } })
          : null;
        if (!creator || creator.role === UserRole.STUDENT) {
          await this.studyGroupRepository.remove(studyGroup);
          return;
        }
        throw new ForbiddenException('Teachers can only delete groups created by students.');
      }
      throw new ForbiddenException('You must join the group before deleting it.');
    }

    throw new ForbiddenException('You are not allowed to delete this group.');
  }"""

OLD_RM_MEMBER = """    if (user.role === UserRole.TEACHER) {
      const isMember = (studyGroup.members || []).includes(user.email);
      if (!isMember) throw new ForbiddenException('You must join the group before removing members.');"""

NEW_RM_MEMBER = """    if (user.role === UserRole.TEACHER) {
      const isMember = (studyGroup.members || []).includes(user.email);
      const isMentor = studyGroup.mentor_email === user.email;
      if (!isMember && !isMentor) throw new ForbiddenException('You must join the group before removing members.');"""

assert OLD_REMOVE in src,    "❌  remove() target not found — already patched?"
assert OLD_RM_MEMBER in src, "❌  removeMember() target not found — already patched?"
src = src.replace(OLD_REMOVE, NEW_REMOVE, 1)
src = src.replace(OLD_RM_MEMBER, NEW_RM_MEMBER, 1)
open(path, 'w').write(src)
print("   ✅  study-groups.service.ts")
PY

# =============================================================================
# PATCH 2 ── Backend controller: allow teachers to create groups too
#            (needed so StudyGroupsAdmin "New Group" works end-to-end)
# =============================================================================
echo "2/5  Patching study-groups.controller.ts  (teacher can create groups)"
bak "$BE/study-groups.controller.ts"

python3 - "$BE/study-groups.controller.ts" <<'PY'
import sys
path = sys.argv[1]
src  = open(path).read()

OLD = """  @Post()
  @Roles(UserRole.STUDENT)
  create(@Req() req: any, @Body() createStudyGroupDto: CreateStudyGroupDto) {"""

NEW = """  @Post()
  @Roles(UserRole.STUDENT, UserRole.TEACHER)
  create(@Req() req: any, @Body() createStudyGroupDto: CreateStudyGroupDto) {"""

if OLD not in src:
    print("   ℹ️   controller create() already allows Teacher — skipping")
else:
    open(path,'w').write(src.replace(OLD, NEW, 1))
    print("   ✅  study-groups.controller.ts")
PY

# =============================================================================
# PATCH 3 ── Frontend API: add uploadStudyGroupResource helper
#            (shares the same /shared-resources/upload endpoint with an
#             extra group_id field so resources are tagged to the group)
# =============================================================================
echo "3/5  Patching Frontend/src/api/index.js  (add study-group resource upload)"
bak "$API_FILE"

python3 - "$API_FILE" <<'PY'
import sys
path = sys.argv[1]
src  = open(path).read()

MARKER = "export function fetchStudyGroupMessages"
INJECT = """export function uploadStudyGroupFile(formData) {
  return request('/shared-resources/upload', { method: 'POST', body: formData });
}

export function createStudyGroupResource(data) {
  return request('/shared-resources', { method: 'POST', body: JSON.stringify(data) });
}

"""

if 'uploadStudyGroupFile' in src:
    print("   ℹ️   API helpers already present — skipping")
else:
    assert MARKER in src, "❌  fetchStudyGroupMessages marker not found in api/index.js"
    src = src.replace(MARKER, INJECT + MARKER, 1)
    open(path,'w').write(src)
    print("   ✅  api/index.js")
PY

# =============================================================================
# PATCH 4 ── Frontend StudyGroups.jsx
#            • After joining: show Exit icon-button on the card
#            • Delete button visible to group creator (not just teachers)
# =============================================================================
echo "4/5  Patching Frontend/src/pages/StudyGroups.jsx  (card actions)"
bak "$FE_PAGES/StudyGroups.jsx"

python3 - "$FE_PAGES/StudyGroups.jsx" <<'PY'
import sys
path = sys.argv[1]
src  = open(path).read()

OLD = """                <div className="flex gap-2">
                  <button onClick={() => joinGroup(group)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all bg-primary text-primary-foreground hover:opacity-90">
                    <MessageSquare className="h-4 w-4" />{joined ? "Open Discussion" : "Join & Discuss"}
                  </button>
                  {user?.role === 'Teacher' && <button onClick={() => handleDelete(group)} title="Delete group" className="p-2 rounded-xl border border-border text-rose-600 hover:bg-rose-50"><Trash className="h-4 w-4" /></button>}
                </div>"""

NEW = """                <div className="flex gap-2">
                  <button onClick={() => joinGroup(group)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all bg-primary text-primary-foreground hover:opacity-90">
                    <MessageSquare className="h-4 w-4" />{joined ? "Open Discussion" : "Join & Discuss"}
                  </button>
                  {joined && (
                    <button onClick={(e) => { e.stopPropagation(); leaveGroup(group); }} title="Exit group" className="p-2 rounded-xl border border-border text-rose-600 hover:bg-rose-50">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  {(user?.role === 'Teacher' || group.creator_email === user?.email) && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(group); }} title="Delete group" className="p-2 rounded-xl border border-border text-rose-600 hover:bg-rose-50">
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>"""

assert OLD in src, "❌  Card buttons target not found in StudyGroups.jsx — already patched?"
open(path,'w').write(src.replace(OLD, NEW, 1))
print("   ✅  StudyGroups.jsx")
PY

# =============================================================================
# PATCH 5 ── Frontend StudyGroupsAdmin.jsx  (FULL REPLACEMENT)
#            • Members panel: exclude the logged-in teacher from student list
#            • "Enter Group" button opens a full chat + resource view
#            • Teacher can send messages and upload files inside the group
# =============================================================================
echo "5/5  Patching Frontend/src/components/teacher/StudyGroupsAdmin.jsx"
bak "$FE_COMP/StudyGroupsAdmin.jsx"

cat > "$FE_COMP/StudyGroupsAdmin.jsx" <<'JSX'
import { useState, useEffect, useRef } from "react";
import { useAuth } from '@/lib/AuthContext';
import {
  fetchStudyGroups, createStudyGroup, updateStudyGroup, deleteStudyGroup,
  createAnnouncement, fetchStudyGroupMessages, createStudyGroupMessage,
  uploadStudyGroupFile, createStudyGroupResource,
} from '@/api';
import {
  Users, Trash2, UserMinus, LogIn, Plus, Loader2,
  ChevronDown, ChevronUp, MessageSquare, Send, ChevronLeft,
  Paperclip, FileText, Image as ImgIcon, X,
} from "lucide-react";

/* ── tiny helpers ─────────────────────────────────────────── */
const LEVEL_COLORS = {
  PSLC: "bg-emerald-100 text-emerald-700",
  JCE:  "bg-blue-100 text-blue-700",
  MSCE: "bg-purple-100 text-purple-700",
};
const ALLOWED_TYPES = [
  "application/pdf",
  "image/png","image/jpeg","image/jpg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/* ═══════════════════════════════════════════════════════════
   GroupChat — full chat + resource upload view for a teacher
   ═══════════════════════════════════════════════════════════ */
function GroupChat({ group, user, onBack, onGroupUpdated }) {
  const [messages,    setMessages]    = useState([]);
  const [msgText,     setMsgText]     = useState("");
  const [sending,     setSending]     = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [fileError,   setFileError]   = useState("");
  const [members,     setMembers]     = useState(group);   // keep live copy
  const [processing,  setProcessing]  = useState(null);
  const bottomRef = useRef(null);
  const fileRef   = useRef(null);

  /* load messages */
  useEffect(() => {
    let active = true;
    fetchStudyGroupMessages({ groupId: group.id })
      .then(r => { if (active) setMessages(Array.isArray(r) ? r : r?.data ?? []); })
      .catch(() => {});
    return () => { active = false; };
  }, [group.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const isMentor = members.mentor_email === user?.email;
  const isMemberFlag = (members.members || []).includes(user?.email ?? "");

  /* send text message */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSending(true);
    try {
      const created = await createStudyGroupMessage({
        group_id:    group.id,
        content:     msgText.trim(),
        author_name: user.full_name || user.email.split("@")[0],
        author_email: user.email,
      });
      setMessages(prev => [...prev, created]);
      setMsgText("");
    } catch (err) { alert(err?.message || "Failed to send message"); }
    finally { setSending(false); }
  };

  /* upload a file as a shared resource tagged to this group */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Unsupported file type. Use PDF, Word, PNG or JPEG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError("File too large — max 10 MB.");
      return;
    }
    setFileError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upload = await uploadStudyGroupFile(fd);
      const fileUrl = upload?.url || upload?.file_url || upload?.path || "";
      await createStudyGroupResource({
        title:         file.name,
        resource_type: file.type.startsWith("image/") ? "image" : "document",
        file_url:      fileUrl,
        description:   `Shared in study group: ${group.name}`,
        uploaded_by:   user.email,
        uploader_name: user.full_name || user.email.split("@")[0],
      });
      /* echo an info message into the chat so students see the upload */
      const notif = await createStudyGroupMessage({
        group_id:     group.id,
        content:      `📎 Uploaded resource: ${file.name}`,
        author_name:  user.full_name || user.email.split("@")[0],
        author_email: user.email,
      });
      setMessages(prev => [...prev, notif]);
      alert(`✅ "${file.name}" uploaded and shared with the group.`);
    } catch (err) { setFileError(err?.message || "Upload failed."); }
    finally { setUploading(false); }
  };

  /* remove a student member */
  const handleRemove = async (email) => {
    if (!confirm(`Remove ${email} from "${group.name}"? They will be banned from rejoining.`)) return;
    setProcessing("remove-" + email);
    try {
      const updatedMembers = (members.members || []).filter(m => m !== email);
      const updatedBanned  = Array.from(new Set([...(members.banned_members || []), email]));
      const updated = await updateStudyGroup(group.id, { members: updatedMembers, banned_members: updatedBanned });
      setMembers(updated);
      onGroupUpdated(updated);
      await createAnnouncement({
        title:          `Removed from study group: ${group.name}`,
        body:           `You have been removed from the study group "${group.name}" by your teacher.`,
        targetAudience: "students",
        isPublished:    true,
        teacherEmail:   user.email,
      });
    } catch (err) { alert(err?.message || "Failed to remove member"); }
    finally { setProcessing(null); }
  };

  const activeMembers = (members.members || [])
    .filter(m => !(members.banned_members || []).includes(m) && m !== user?.email);

  return (
    <div className="flex flex-col h-[82vh] max-h-[700px]">
      {/* ── header ── */}
      <div className="flex items-start gap-3 pb-4 border-b border-border mb-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-muted hover:bg-primary/10 shrink-0 mt-0.5">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground truncate">{group.name}</h3>
          <p className="text-xs text-muted-foreground">
            {group.subject} · {group.level} · {activeMembers.length} student{activeMembers.length !== 1 ? "s" : ""}
            {isMentor && " · ⭐ You are the mentor"}
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* ── chat pane ── */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-10">No messages yet. Start the conversation!</p>
            )}
            {messages.map(msg => {
              const isMe      = msg.author_email === user?.email;
              const isMsgMentor = msg.author_email === group.mentor_email;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {!isMe && (
                      <p className={`text-xs font-semibold mb-1 ${isMsgMentor ? "text-amber-600" : "text-primary"}`}>
                        {msg.author_name}{isMsgMentor && " ⭐"}
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* message + upload bar */}
          <div className="mt-3 space-y-1.5">
            {fileError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <X className="h-3 w-3" />{fileError}
              </p>
            )}
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 bg-muted rounded-xl px-4 py-2 text-sm outline-none text-foreground"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                title="Upload a resource (PDF, Word, image)"
                className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-40"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              </button>
              <button
                type="submit"
                disabled={sending || !msgText.trim()}
                className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleFileChange} />
            <p className="text-xs text-muted-foreground pl-1">📎 Paperclip — share PDF, Word or image with the group</p>
          </div>
        </div>

        {/* ── members sidebar ── */}
        <div className="w-44 shrink-0 flex flex-col">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Students</p>
          {activeMembers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No students yet.</p>
          ) : (
            <div className="space-y-1.5 overflow-y-auto flex-1">
              {activeMembers.map(email => {
                const idx  = (members.members || []).indexOf(email);
                const name = (members.members_names || [])[idx] || email.split("@")[0];
                return (
                  <div key={email} className="rounded-xl bg-muted px-2.5 py-2 text-xs">
                    <p className="font-medium text-foreground truncate">{name}</p>
                    <p className="text-muted-foreground truncate">{email}</p>
                    <button
                      onClick={() => handleRemove(email)}
                      disabled={!!processing}
                      className="mt-1 flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-40 text-xs font-semibold"
                    >
                      {processing === "remove-" + email ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserMinus className="h-3 w-3" />}
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {(members.banned_members || []).filter(e => !(members.members||[]).includes(e)).length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Removed</p>
              {(members.banned_members || []).filter(e => !(members.members||[]).includes(e)).map(e => (
                <div key={e} className="text-xs rounded-xl bg-rose-50 px-2.5 py-1.5 text-rose-700 truncate mb-1">{e}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   StudyGroupsAdmin — main list view
   ═══════════════════════════════════════════════════════════ */
export default function StudyGroupsAdmin() {
  const { user } = useAuth();
  const [groups,      setGroups]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [processing,  setProcessing]  = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);   // group open in chat view
  const [showCreate,  setShowCreate]  = useState(false);
  const [form,        setForm]        = useState({ name:"", subject:"", level:"MSCE", description:"", scheduled_at:"" });
  const [formError,   setFormError]   = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchStudyGroups();
      setGroups(Array.isArray(data) ? data : data?.data ?? []);
    } catch (e) { console.error(e); setGroups([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const isMemberOf = (group) => (group.members || []).includes(user?.email ?? "");
  const isMentorOf = (group) => group.mentor_email === user?.email;

  /* ── join as mentor ── */
  const handleJoin = async (group) => {
    if (!confirm(`Join "${group.name}" as mentor?`)) return;
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
  };

  /* ── delete ── */
  const handleDelete = async (group) => {
    const joined = isMemberOf(group) || isMentorOf(group);
    if (!joined) {
      if (!confirm(`You are not yet a member of "${group.name}". Join and delete?`)) return;
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
      return;
    }
    if (!confirm(`Delete study group "${group.name}"? This cannot be undone.`)) return;
    setProcessing(group.id + "-delete");
    try {
      await deleteStudyGroup(group.id);
      if (activeGroup?.id === group.id) setActiveGroup(null);
      await load();
    } catch (e) { alert(e?.message || "Failed to delete group"); }
    finally { setProcessing(null); }
  };

  /* ── create ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.subject.trim()) { setFormError("Group name and subject are required."); return; }
    setFormError("");
    setProcessing("create");
    try {
      await createStudyGroup({
        ...form,
        mentor_email: user.email,
        mentor_name:  user.full_name || user.email.split("@")[0],
        members: [user.email],
      });
      setShowCreate(false);
      setForm({ name:"", subject:"", level:"MSCE", description:"", scheduled_at:"" });
      await load();
    } catch (e) { setFormError(e?.message || "Failed to create group"); }
    finally { setProcessing(null); }
  };

  /* group list updated from inside chat (e.g. member removed) */
  const handleGroupUpdated = (updated) => {
    setGroups(prev => prev.map(g => g.id === updated.id ? updated : g));
  };

  /* ── open chat view ── */
  if (activeGroup) {
    return (
      <div className="w-full">
        <GroupChat
          group={activeGroup}
          user={user}
          onBack={() => { setActiveGroup(null); load(); }}
          onGroupUpdated={handleGroupUpdated}
        />
      </div>
    );
  }

  /* ── main list ── */
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Study Groups</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Join groups, chat with students, share resources and manage members.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-3 py-2 rounded-xl hover:opacity-90">
          <Plus className="h-4 w-4" /> New Group
        </button>
      </div>

      {showCreate && (
        <div className="border border-border rounded-2xl p-5 bg-card">
          <h3 className="font-semibold mb-4">Create Study Group</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Group Name *</label>
                <input value={form.name} onChange={e => setForm(f=>({...f, name:e.target.value}))} placeholder="e.g. Physics Revision"
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject *</label>
                <input value={form.subject} onChange={e => setForm(f=>({...f, subject:e.target.value}))} placeholder="e.g. Physics"
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Level *</label>
                <select value={form.level} onChange={e => setForm(f=>({...f, level:e.target.value}))}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="PSLC">PSLC</option>
                  <option value="JCE">JCE</option>
                  <option value="MSCE">MSCE</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Scheduled Date/Time</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f=>({...f, scheduled_at:e.target.value}))}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f=>({...f, description:e.target.value}))} rows={2}
                placeholder="What is this group about?" className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
            {formError && <p className="text-xs text-red-600">{formError}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted">Cancel</button>
              <button type="submit" disabled={processing === "create"} className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
                {processing === "create" ? <Loader2 className="h-4 w-4 animate-spin inline" /> : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No study groups yet.</p>
          <p className="text-sm mt-1">Create one above to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const joined = isMemberOf(group) || isMentorOf(group);
            const mentor = isMentorOf(group);
            const levelClass = LEVEL_COLORS[group.level] || "bg-muted text-muted-foreground";
            /* exclude the teacher themselves from the displayed count */
            const studentMembers = (group.members || []).filter(m =>
              !(group.banned_members || []).includes(m) && m !== user?.email
            );
            return (
              <div key={group.id} className="border border-border rounded-2xl bg-card overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelClass}`}>{group.level}</span>
                      {mentor && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⭐ Mentor</span>}
                      {joined && !mentor && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Joined</span>}
                    </div>
                    <p className="font-semibold text-foreground truncate">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.subject} · {studentMembers.length} student{studentMembers.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!joined ? (
                      <button onClick={() => handleJoin(group)} disabled={!!processing} title="Join as mentor"
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
                        {processing === group.id + "-join" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogIn className="h-3.5 w-3.5" />} Join
                      </button>
                    ) : (
                      <button onClick={() => setActiveGroup(group)} title="Enter group chat"
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90">
                        <MessageSquare className="h-3.5 w-3.5" /> Enter Group
                      </button>
                    )}
                    <button onClick={() => handleDelete(group)} disabled={!!processing} title="Delete group"
                      className="p-1.5 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-600 disabled:opacity-50">
                      {processing === group.id + "-delete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
JSX

echo "   ✅  StudyGroupsAdmin.jsx"

# =============================================================================
# Rebuild backend
# =============================================================================
echo ""
echo "🔨  Building NestJS backend…"
cd "$ROOT/Backend"
npm run build 2>&1 | tail -8

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅  All 5 patches applied and backend rebuilt.      ║"
echo "║                                                      ║"
echo "║  Restart the servers:                                ║"
echo "║    cd Backend  && npm run start:dev                  ║"
echo "║    cd Frontend && npm run dev                        ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
