/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   subject: string;
 *   level: string;
 *   description?: string;
 *   scheduled_at?: string;
 *   members?: string[];
 *   banned_members?: string[];
 *   mentor_email?: string;
 * }} StudyGroup
 *
/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   subject: string;
 *   level: string;
 *   description?: string;
 *   scheduled_at?: string;
 *   members?: string[];
 *   banned_members?: string[];
 *   mentor_email?: string;
 * }} StudyGroup
 *
 * @typedef {{
 *   id: string;
 *   content: string;
 *   author_name: string;
 *   author_email: string;
 *   created_at?: string;
 * }} StudyGroupMessage
 */

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { fetchStudyGroups, fetchStudyGroupMessages, updateStudyGroup, createStudyGroupMessage, createStudyGroup, deleteStudyGroup } from "@/api";
import RequireAccount from '@/components/RequireAccount';
import ResourceForm from '@/components/teachersdashboard/ResourceForm';
import { Users, MessageSquare, Send, Loader2, Calendar, ChevronLeft, Trash } from "lucide-react";

const LEVEL_COLORS = {
  PSLC: "bg-emerald-100 text-emerald-700",
  JCE: "bg-blue-100 text-blue-700",
  MSCE: "bg-purple-100 text-purple-700",
};

export default function StudyGroups() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [form, setForm] = useState(null);
  const [groups, setGroups] = useState(/** @type {StudyGroup[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(/** @type {StudyGroup | null} */ (null));
  const [messages, setMessages] = useState(/** @type {StudyGroupMessage[]} */ ([]));
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [pendingDeletes, setPendingDeletes] = useState([]);
  const pendingTimers = useRef({});

  useEffect(() => {
    let active = true;
    const loadGroups = async () => {
      if (!isAuthenticated) {
        if (active) {
          setGroups([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const response = await fetchStudyGroups();
        if (!active) return;
        setGroups(Array.isArray(response) ? response : response?.data ?? []);
      } catch (error) {
        if (active) setGroups([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadGroups();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!activeGroup) {
      setMessages([]);
      return;
    }

    let active = true;
    const loadMessages = async () => {
      try {
        const response = await fetchStudyGroupMessages({ groupId: activeGroup.id });
        if (!active) return;
        setMessages(Array.isArray(response) ? response : response?.data ?? []);
      } catch (error) {
        if (active) setMessages([]);
      }
    };

    loadMessages();
    return () => {
      active = false;
    };
  }, [activeGroup]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  /** @param {StudyGroup} group */
  const joinGroup = async (group) => {
    if (!user?.email) return;
    const members = group.members || [];
    const banned = group.banned_members || [];
    if (banned.includes(user.email)) {
      alert('You have been removed from this group and cannot rejoin.');
      setActiveGroup(group);
      return;
    }

    // If current user is a Teacher and group has no mentor, make teacher the mentor when joining.
    if (user.role === 'Teacher') {
      const payload = {};
      // Teachers joining a group become the mentor (overwrite existing mentor)
      payload.mentor_email = user.email;
      payload.mentor_name = user.full_name || user.email.split('@')[0];
      if (!members.includes(user.email)) {
        payload.members = [...members, user.email];
      }
      const updated = await updateStudyGroup(group.id, payload);
      setGroups((prev) => prev.map((g) => (g.id === group.id ? updated : g)));
      setActiveGroup(updated);
      return;
    }

    if (!members.includes(user.email)) {
      const updated = await updateStudyGroup(group.id, { members: [...members, user.email] });
      setGroups((prev) => prev.map((g) => (g.id === group.id ? updated : g)));
      setActiveGroup(updated);
    } else {
      setActiveGroup(group);
    }
  };

  const handleDelete = async (group) => {
    if (!confirm(`Delete study group "${group.name}"? You can undo within 5 seconds.`)) return;

    // Optimistically remove from UI and schedule server delete
    setGroups((prev) => prev.filter((g) => g.id !== group.id));
    if (activeGroup?.id === group.id) setActiveGroup(null);

    setPendingDeletes((prev) => [...prev, { id: group.id, name: group.name, data: group }]);

    const timer = setTimeout(async () => {
      try {
        await deleteStudyGroup(group.id);
      } catch (err) {
        // if server delete fails, re-add the group
        setGroups((prev) => [group, ...prev]);
      } finally {
        setPendingDeletes((prev) => prev.filter((p) => p.id !== group.id));
        delete pendingTimers.current[group.id];
      }
    }, 5000);

    pendingTimers.current[group.id] = timer;
  };

  const undoDelete = (pending) => {
    const { id, data } = pending;
    const timer = pendingTimers.current[id];
    if (timer) {
      clearTimeout(timer);
      delete pendingTimers.current[id];
    }
    setPendingDeletes((prev) => prev.filter((p) => p.id !== id));
    // restore to list
    setGroups((prev) => [data, ...prev]);
  }

  /** @param {import('react').FormEvent<HTMLFormElement>} e */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim() || !activeGroup || !user?.email) return;

    const isMentor = activeGroup.mentor_email === user?.email;
    const isMember = (activeGroup.members || []).includes(user.email);
    const isBanned = (activeGroup.banned_members || []).includes(user.email);

    if (!isMentor && (!isMember || isBanned)) {
      alert('You no longer have permission to post in this study group.');
      return;
    }

    setSending(true);
    try {
      const created = await createStudyGroupMessage({
        group_id: activeGroup.id,
        content: msgText.trim(),
        author_name: user.full_name || user.email.split("@")[0],
        author_email: user.email,
      });
      setMessages((prev) => [...prev, created]);
      setMsgText("");
    } finally {
      setSending(false);
    }
  };

  const FIELDS = [
    { key: "name", label: "Group Name", required: true },
    { key: "subject", label: "Subject", required: true },
    { key: "level", label: "Level", type: "select", required: true, options: [
      { value: "PSLC", label: "PSLC" }, { value: "JCE", label: "JCE" }, { value: "MSCE", label: "MSCE" }
    ]},
    { key: "description", label: "Description", type: "textarea" },
    { key: "mentor_email", label: "Mentor Email" },
    { key: "scheduled_at", label: "Scheduled Date/Time" },
  ];

  const handleCreate = async (data) => {
    const prepared = {
      ...data,
      mentor_email: data.mentor_email?.trim() || user?.email,
      mentor_name: data.mentor_name?.trim?.() || user?.full_name || user?.email?.split('@')[0],
    };
    await createStudyGroup(prepared);
    setForm(null);
    try {
      const response = await fetchStudyGroups();
      setGroups(Array.isArray(response) ? response : response?.data ?? []);
    } catch (e) { }
  };

  if (isLoadingAuth || loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  }

  if (!isAuthenticated) {
    return <RequireAccount resourceName="Study Groups" />;
  }

  if (activeGroup) {
    const isMentor = activeGroup.mentor_email === user?.email;
    const isMember = (activeGroup.members || []).includes(user?.email ?? '');
    const isBanned = (activeGroup.banned_members || []).includes(user?.email ?? '');
    const allowedToSend = isMentor || isMember;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col h-[80vh]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setActiveGroup(null)} className="p-2 rounded-xl bg-muted hover:bg-primary/10">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="font-poppins font-bold text-foreground">{activeGroup.name}</h2>
            <p className="text-xs text-muted-foreground">
              {activeGroup.subject} · {activeGroup.level} · {(activeGroup.members || []).length} members {isMentor && "· You are the mentor"}
              {isBanned && !isMentor && " · You were removed from this group"}
            </p>
          </div>
        </div>

        <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isBanned && !isMentor && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                You were removed from this group and can no longer send messages here.
              </div>
            )}

            {messages.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-10">No messages yet. Start the conversation!</p>
            )}
            {messages.map(msg => {
              const isMe = msg.author_email === user?.email;
              const isMsgMentor = msg.author_email === activeGroup.mentor_email;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-2.5 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {!isMe && (
                      <p className={`text-xs font-semibold mb-1 ${isMsgMentor ? "text-amber-600" : "text-primary"}`}>
                        {msg.author_name} {isMsgMentor && "⭐ Mentor"}
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="p-3 border-t border-border flex gap-2">
            <input
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              placeholder="Type a message…"
              disabled={!allowedToSend}
              className="flex-1 bg-muted rounded-xl px-4 py-2 text-sm outline-none text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button type="submit" disabled={sending || !msgText.trim() || !allowedToSend}
              className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 rounded-xl p-2"><Users className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="font-poppins text-2xl font-bold text-foreground">Study Groups</h1>
          <p className="text-muted-foreground text-sm">Join a study room and collaborate with peers.</p>
          {user?.role === 'Student' && (
            <div className="mt-3">
              <button onClick={() => setForm({})} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-xl text-sm font-semibold">Add New Group</button>
            </div>
          )}
        </div>
        
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground">No study groups yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Create a new study group to invite classmates and start collaborating.</p>
          {user?.role === 'Student' && (
            <div className="mt-4">
              <button onClick={() => setForm({})} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-xl text-sm font-semibold">Create Group</button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => {
            const joined = (group.members || []).includes(user?.email ?? "");
            const levelClass = LEVEL_COLORS[/** @type {keyof typeof LEVEL_COLORS} */ (group.level)] || "bg-muted";
            return (
              <div key={group.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${levelClass}`}>{group.level}</span>
                  {joined && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Joined</span>}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{group.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">{group.subject}</p>
                {group.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{group.description}</p>}
                {group.scheduled_at && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{group.scheduled_at}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground">{(group.members || []).length} members</span>
                  {group.mentor_email && <span className="text-xs text-amber-600 font-medium">⭐ Has mentor</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => joinGroup(group)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all bg-primary text-primary-foreground hover:opacity-90">
                    <MessageSquare className="h-4 w-4" />
                    {joined ? "Open Discussion" : "Join & Discuss"}
                  </button>
                  {user?.role === 'Student' && group.creator_email === user?.email && (
                    <button onClick={() => handleDelete(group)} title="Delete group" className="p-2 rounded-xl border border-border text-rose-600 hover:bg-rose-50">
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Undo toasts for pending deletes */}
      <div className="fixed left-4 bottom-6 space-y-2 z-50">
        {pendingDeletes.map(p => (
          <div key={p.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-md">
            <div className="text-sm">Deleted "{p.name}"</div>
            <div className="ml-2">
              <button onClick={() => undoDelete(p)} className="text-sm font-semibold text-primary">Undo</button>
            </div>
          </div>
        ))}
      </div>
      {form && (
        <ResourceForm
          fields={FIELDS}
          initial={form}
          onSave={handleCreate}
          onCancel={() => setForm(null)}
          title="Create Study Group"
        />
      )}
    </div>
  );
}