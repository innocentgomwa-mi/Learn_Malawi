// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchStudyGroups,
  fetchStudyGroupMessages,
  updateStudyGroup,
  createStudyGroupMessage,
  createStudyGroup,
  deleteStudyGroup,
} from "@/api";
import RequireAccount from "@/components/RequireAccount";
import ConfirmModal from "@/components/ui/ConfirmModal";
import StudyGroupForm from "@/components/StudyGroupForm";
import ResourcePageHero from "@/components/ResourcePageHero";
import {
  PAGE_WRAP,
  LEVEL_INFO,
  CARD_CLASS,
  SPINNER_CLASS,
  YELLOW_BUTTON_CLASS,
  YELLOW_BUTTON_MD,
  YELLOW_BUTTON_SM,
  OUTLINE_BUTTON_CLASS,
} from "@/lib/resourcePageStyles";
import {
  Users,
  MessageSquare,
  Send,
  Calendar,
  ChevronLeft,
  Trash,
  Plus,
  Star,
  LogOut,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const getGroupIconUrl = (group) => {
  const raw = group?.icon_url || group?.iconUrl;
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${API_BASE_URL}${raw}`;
};

function GroupIcon({ group, className = "h-full w-full object-cover" }) {
  const src = getGroupIconUrl(group);
  if (src) {
    return <img src={src} alt="" className={className} />;
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-yellow-100">
      <Users className="h-10 w-10 text-blue-400" strokeWidth={1.5} />
    </div>
  );
}

export default function StudyGroups() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [form, setForm] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const [pendingDeletes, setPendingDeletes] = useState([]);
  const pendingTimers = useRef({});
  const [dialog, setDialog] = useState(null);
  const location = useLocation();

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
      } catch {
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
    if (activeGroup) return;
    const params = new URLSearchParams(location.search);
    const groupId = params.get("groupId");
    if (!groupId || groups.length === 0) return;

    const match = groups.find(
      (group) => String(group.id) === groupId || String(group.id) === decodeURIComponent(groupId)
    );
    if (match) setActiveGroup(match);
  }, [groups, location.search, activeGroup]);

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
      } catch {
        if (active) setMessages([]);
      }
    };
    loadMessages();
    return () => {
      active = false;
    };
  }, [activeGroup]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinGroup = async (group) => {
    if (!user?.email) return;
    const members = group.members || [];
    const banned = group.banned_members || [];
    if (banned.includes(user.email)) {
      setDialog({
        title: "Access Denied",
        message: "You have been removed from this group and cannot rejoin.",
        confirmLabel: "OK",
        onConfirm: () => {},
      });
      setActiveGroup(group);
      return;
    }
    const isMember = members.includes(user.email);
    if (isMember) {
      setActiveGroup(group);
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

  const leaveGroup = async (group) => {
    if (!user?.email) return;
    const members = group.members || [];
    if (!members.includes(user.email)) return;
    setDialog({
      title: "Leave group",
      message: `Leave study group "${group.name}"?`,
      confirmLabel: "Leave",
      danger: true,
      onConfirm: async () => {
        const updatedMembers = (group.members || []).filter((m) => m !== user.email);
        try {
          const updated = await updateStudyGroup(group.id, { members: updatedMembers });
          setGroups((prev) => prev.map((g) => (g.id === group.id ? updated : g)));
          setActiveGroup(null);
        } catch (err) {
          setDialog({
            title: "Error",
            message: err?.message || "Failed to leave group",
            confirmLabel: "OK",
            onConfirm: () => {},
          });
        }
      },
    });
  };

  const handleDelete = async (group) => {
    setDialog({
      title: "Delete study group",
      message: `Delete "${group.name}"? You can undo within 5 seconds.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => {
        setGroups((prev) => prev.filter((g) => g.id !== group.id));
        if (activeGroup?.id === group.id) setActiveGroup(null);
        setPendingDeletes((prev) => [...prev, { id: group.id, name: group.name, data: group }]);
        const timer = setTimeout(async () => {
          try {
            await deleteStudyGroup(group.id);
          } catch {
            setGroups((prev) => [group, ...prev]);
          } finally {
            setPendingDeletes((prev) => prev.filter((p) => p.id !== group.id));
            delete pendingTimers.current[group.id];
          }
        }, 5000);
        pendingTimers.current[group.id] = timer;
      },
    });
  };

  const undoDelete = (pending) => {
    const { id, data } = pending;
    const timer = pendingTimers.current[id];
    if (timer) {
      clearTimeout(timer);
      delete pendingTimers.current[id];
    }
    setPendingDeletes((prev) => prev.filter((p) => p.id !== id));
    setGroups((prev) => [data, ...prev]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim() || !activeGroup || !user?.email) return;
    const isMentor = activeGroup.mentor_email === user?.email;
    const isMember = (activeGroup.members || []).includes(user.email);
    const isBanned = (activeGroup.banned_members || []).includes(user.email);
    if (!isMentor && (!isMember || isBanned)) {
      setDialog({
        title: "Permission Denied",
        message: "You no longer have permission to post in this study group.",
        confirmLabel: "OK",
        onConfirm: () => {},
      });
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

  const handleCreate = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name.trim());
    formData.append("subject", data.subject.trim());
    formData.append("level", data.level);
    if (data.description?.trim()) {
      formData.append("description", data.description.trim());
    }
    const mentorEmail = data.mentor_email?.trim();
    if (!mentorEmail) {
      throw new Error("Please select a teacher mentor.");
    }
    formData.append("mentor_email", mentorEmail);
    if (data.mentor_name) formData.append("mentor_name", data.mentor_name);
    if (data.scheduled_date) {
      formData.append("scheduled_at", `${data.scheduled_date}T${data.scheduled_time || "00:00"}`);
    } else if (data.scheduled_time) {
      formData.append("scheduled_at", `${new Date().toISOString().slice(0, 10)}T${data.scheduled_time}`);
    }
    if (data.iconFile) {
      formData.append("icon", data.iconFile);
    }
    await createStudyGroup(formData);
    setForm(null);
    try {
      const response = await fetchStudyGroups();
      setGroups(Array.isArray(response) ? response : response?.data ?? []);
    } catch {
      /* keep current list */
    }
  };

  if (isLoadingAuth || loading) {
    return (
      <div className={`${PAGE_WRAP} flex justify-center py-24`}>
        <div className={SPINNER_CLASS} />
      </div>
    );
  }

  if (!isAuthenticated) return <RequireAccount resourceName="Study Groups" />;

  if (activeGroup) {
    const isMentor = activeGroup.mentor_email === user?.email;
    const isMember = (activeGroup.members || []).includes(user?.email ?? "");
    const isBanned = (activeGroup.banned_members || []).includes(user?.email ?? "");
    const allowedToSend = isMentor || (isMember && !isBanned);

    return (
      <div className={`${PAGE_WRAP} mx-auto flex max-w-3xl flex-col`} style={{ minHeight: "calc(100vh - 8rem)" }}>
        <div className="mb-4 flex flex-wrap items-start gap-3">
          <button
            type="button"
            onClick={() => setActiveGroup(null)}
            className={YELLOW_BUTTON_SM}
            aria-label="Back to groups"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 border-blue-200">
            <GroupIcon group={activeGroup} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-poppins text-xl font-bold text-blue-950">{activeGroup.name}</h2>
            <p className="text-xs text-blue-900/70">
              {activeGroup.subject} · {activeGroup.level} · {(activeGroup.members || []).length} members
              {isMentor && (
                <span className="ml-1 inline-flex items-center gap-0.5 text-yellow-700">
                  · <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" /> Mentor
                </span>
              )}
              {isBanned && !isMentor && " · Removed from group"}
            </p>
            {activeGroup.description && (
              <p className="mt-2 text-sm leading-relaxed text-blue-900/80">{activeGroup.description}</p>
            )}
            {user?.role === "Teacher" &&
              (activeGroup.members_names || (activeGroup.members || []).length > 0) && (
                <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2 text-sm text-blue-900/80">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-800">
                    Members
                  </div>
                  <ul className="list-inside list-disc text-sm">
                    {(activeGroup.members_names || activeGroup.members || []).map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
          {!isMember && !isBanned && (
            <button
              type="button"
              onClick={() => joinGroup(activeGroup)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
            >
              <MessageSquare className="h-4 w-4" /> Join group
            </button>
          )}
          {isMember && (
            <button
              type="button"
              onClick={() => leaveGroup(activeGroup)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" /> Exit
            </button>
          )}
        </div>

        <div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border border-blue-200/80 bg-white shadow-sm">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {isBanned && !isMentor && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                You were removed from this group and can no longer send messages here.
              </div>
            )}
            {messages.length === 0 && (
              <p className="py-10 text-center text-sm text-blue-900/60">
                No messages yet. Start the conversation!
              </p>
            )}
            {messages.map((msg) => {
              const isMe = msg.author_email === user?.email;
              const isMsgMentor = msg.author_email === activeGroup.mentor_email;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-2.5 md:max-w-sm ${
                      isMe
                        ? "border border-yellow-300 bg-yellow-400 text-blue-950"
                        : "border border-blue-200 bg-blue-50 text-blue-950"
                    }`}
                  >
                    {!isMe && (
                      <p
                        className={`mb-1 flex items-center gap-1 text-xs font-semibold ${
                          isMsgMentor ? "text-yellow-700" : "text-blue-700"
                        }`}
                      >
                        {msg.author_name}
                        {isMsgMentor && (
                          <>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" /> Mentor
                          </>
                        )}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <form
            onSubmit={sendMessage}
            className="flex gap-2 border-t border-blue-200 bg-blue-50/30 p-3"
          >
            <input
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="Type a message…"
              disabled={!allowedToSend}
              className="flex-1 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-blue-950 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !msgText.trim() || !allowedToSend}
              className={`${YELLOW_BUTTON_CLASS} p-2.5 disabled:opacity-40`}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />
      </div>
    );
  }

  const canCreate = user?.role === "Student";

  return (
    <div className={PAGE_WRAP}>
      <ResourcePageHero
        icon={Users}
        title="Study Groups"
        subtitle="Join a study room and collaborate with peers on your subjects."
      />

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-blue-200/80 bg-white py-20 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-blue-400" />
          <p className="font-medium text-blue-950">No study groups yet</p>
          <p className="mt-1 text-sm text-blue-900/70">
            Create a group to invite classmates and start collaborating.
          </p>
          {canCreate && (
            <button type="button" onClick={() => setForm({})} className={`${YELLOW_BUTTON_MD} mx-auto mt-4`}>
              <Plus className="h-4 w-4" /> Create study group
            </button>
          )}
        </div>
      ) : (
        <>
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const joined = (group.members || []).includes(user?.email ?? "");
            const levelClass =
              LEVEL_INFO[group.level]?.color || "bg-blue-50 text-blue-800 border border-blue-200";

            return (
              <div
                key={group.id}
                onClick={() => setActiveGroup(group)}
                className={`${CARD_CLASS} flex flex-col overflow-hidden p-0 cursor-pointer transition-shadow hover:shadow-lg`}
              >
                <div className="h-32 w-full shrink-0 border-b border-blue-100">
                  <GroupIcon group={group} />
                </div>
                <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${levelClass}`}>
                    {group.level}
                  </span>
                  {joined && (
                    <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800">
                      Joined
                    </span>
                  )}
                  {group.mentor_name && (
                    <span
                      className="inline-flex max-w-full items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800"
                      title={group.mentor_email || ""}
                    >
                      <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-500" />
                      <span className="truncate">Mentor: {group.mentor_name}</span>
                    </span>
                  )}
                </div>
                <h3 className="mb-1 font-semibold text-blue-950">{group.name}</h3>
                <p className="mb-1 text-xs text-blue-900/70">{group.subject}</p>
                {group.description && (
                  <p className="mb-3 line-clamp-2 text-xs text-blue-900/60">{group.description}</p>
                )}
                {group.scheduled_at && (
                  <div className="mb-3 flex items-center gap-1.5 text-xs text-blue-900/70">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <span>{group.scheduled_at}</span>
                  </div>
                )}
                <p className="mb-4 text-xs text-blue-900/60">
                  {(group.members || []).length} member{(group.members || []).length === 1 ? "" : "s"}
                </p>
                <div className="mt-auto flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      joinGroup(group);
                    }}
                    className={`${YELLOW_BUTTON_CLASS} min-w-0 flex-1 gap-2 py-2.5 text-sm`}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    {joined ? "Open discussion" : "Join & discuss"}
                  </button>
                  {joined && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        leaveGroup(group);
                      }}
                      title="Exit group"
                      className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  )}
                  {group.creator_email === user?.email && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(group);
                      }}
                      title="Delete group"
                      className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
                </div>
              </div>
            );
          })}
        </div>
        {canCreate && (
          <div className="mb-8">
            <button type="button" onClick={() => setForm({})} className={YELLOW_BUTTON_MD}>
              <Plus className="h-4 w-4" /> Create study group
            </button>
          </div>
        )}
        </>
      )}

      <div className="fixed bottom-6 left-4 z-50 space-y-2">
        {pendingDeletes.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-xl border border-blue-200 bg-white px-4 py-3 shadow-lg"
          >
            <div className="text-sm text-blue-950">
              Deleted &quot;{p.name}&quot;
            </div>
            <button
              type="button"
              onClick={() => undoDelete(p)}
              className="text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              Undo
            </button>
          </div>
        ))}
      </div>

      <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />
      {form && (
        <StudyGroupForm
          initial={form}
          onSave={handleCreate}
          onCancel={() => setForm(null)}
          title="Create Study Group"
          showScheduleFields={user?.role !== "Student"}
        />
      )}
    </div>
  );
}
