import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  fetchStudyGroups,
  deleteStudyGroup,
  createAnnouncement,
  fetchStudyGroupMessages,
  createStudyGroupMessage,
  removeStudyGroupMember,
} from "@/api";
import {
  Users,
  Trash2,
  UserMinus,
  Ban,
  Loader2,
  MessageSquare,
  Send,
  ChevronLeft,
  Shield,
} from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  YELLOW_BUTTON_SM,
  YELLOW_BUTTON_CLASS,
  CARD_CLASS,
  SPINNER_CLASS,
  LEVEL_INFO,
} from "@/lib/resourcePageStyles";

/**
 * @param {{
 *   group: Record<string, unknown>;
 *   user: Record<string, unknown>;
 *   onBack: () => void;
 *   onGroupUpdated: (g: Record<string, unknown>) => void;
 *   setDialog: (d: Record<string, unknown> | null) => void;
 * }} props
 */
function GroupChat({ group, user, onBack, onGroupUpdated, setDialog }) {
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [members, setMembers] = useState(group);
  const [processing, setProcessing] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetchStudyGroupMessages({ groupId: group.id })
      .then((r) => {
        if (active) setMessages(Array.isArray(r) ? r : r?.data ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [group.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSending(true);
    try {
      const created = await createStudyGroupMessage({
        group_id: group.id,
        content: msgText.trim(),
        author_name: user.full_name || user.email.split("@")[0],
        author_email: user.email,
      });
      setMessages((prev) => [...prev, created]);
      setMsgText("");
    } catch (err) {
      setDialog({
        title: "Error",
        message: err?.message || "Failed to send message",
        confirmLabel: "OK",
        onConfirm: () => {},
      });
    } finally {
      setSending(false);
    }
  };

  const moderateMember = (email, { ban }) => {
    const action = ban ? "ban" : "remove";
    setDialog({
      title: ban ? "Ban student" : "Remove student",
      message: ban
        ? `Ban ${email} from "${group.name}"? They cannot rejoin.`
        : `Remove ${email} from "${group.name}"?`,
      confirmLabel: ban ? "Ban" : "Remove",
      danger: true,
      onConfirm: async () => {
        setProcessing(`${action}-${email}`);
        try {
          const updated = await removeStudyGroupMember(group.id, email, { ban });
          setMembers(updated);
          onGroupUpdated(updated);
          if (ban) {
            await createAnnouncement({
              title: `Removed from study group: ${group.name}`,
              body: `You have been removed from "${group.name}" by your teacher mentor for violating group rules.`,
              targetAudience: "students",
              isPublished: true,
              teacherEmail: user.email,
            }).catch(() => {});
          }
        } catch (err) {
          setDialog({
            title: "Error",
            message: err?.message || `Failed to ${action} member`,
            confirmLabel: "OK",
            onConfirm: () => {},
          });
        } finally {
          setProcessing(null);
        }
      },
    });
  };

  const studentMembers = (members.members || []).filter(
    (m) =>
      m !== user?.email &&
      m !== members.mentor_email &&
      !(members.banned_members || []).includes(m),
  );

  return (
    <div className="flex h-[82vh] max-h-[700px] flex-col">
      <div className="mb-3 flex items-start gap-3 border-b border-blue-200 pb-4">
        <button type="button" onClick={onBack} className={YELLOW_BUTTON_SM} aria-label="Back">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-poppins text-lg font-bold text-blue-950">{group.name}</h3>
          <p className="text-xs text-blue-900/70">
            {group.subject} · {group.level} · {studentMembers.length} active student
            {studentMembers.length !== 1 ? "s" : ""}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-yellow-700">
            <Shield className="h-3.5 w-3.5" /> You are the mentor — monitor chat and manage members
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 && (
              <p className="py-10 text-center text-sm text-blue-900/60">No messages yet. Students can post here once they join.</p>
            )}
            {messages.map((msg) => {
              const isMe = msg.author_email === user?.email;
              const isMsgMentor = msg.author_email === group.mentor_email;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? "bg-yellow-400 text-blue-950"
                        : isMsgMentor
                          ? "border border-yellow-300 bg-yellow-50 text-blue-950"
                          : "border border-blue-200 bg-white text-blue-950"
                    }`}
                  >
                    {!isMe && (
                      <p className={`mb-1 text-xs font-semibold ${isMsgMentor ? "text-yellow-700" : "text-blue-700"}`}>
                        {msg.author_name}
                        {isMsgMentor ? " · Mentor" : ""}
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="mt-3 flex gap-2">
            <input
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="Message students as mentor…"
              className="flex-1 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm text-blue-950 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              disabled={sending || !msgText.trim()}
              className={`${YELLOW_BUTTON_CLASS} p-2.5 disabled:opacity-40`}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="flex w-48 shrink-0 flex-col">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-900/60">Students</p>
          {studentMembers.length === 0 ? (
            <p className="text-xs text-blue-900/50">No active students.</p>
          ) : (
            <div className="flex-1 space-y-1.5 overflow-y-auto">
              {studentMembers.map((email) => {
                const idx = (members.members || []).indexOf(email);
                const name = (members.members_names || [])[idx] || email.split("@")[0];
                return (
                  <div key={email} className="rounded-xl border border-blue-200 bg-blue-50/50 px-2.5 py-2 text-xs">
                    <p className="truncate font-medium text-blue-950">{name}</p>
                    <p className="truncate text-blue-900/60">{email}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => moderateMember(email, { ban: false })}
                        disabled={!!processing}
                        className="flex items-center gap-0.5 font-semibold text-blue-800 hover:text-blue-950 disabled:opacity-40"
                      >
                        {processing === `remove-${email}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <UserMinus className="h-3 w-3" />
                        )}
                        Remove
                      </button>
                      <button
                        type="button"
                        onClick={() => moderateMember(email, { ban: true })}
                        disabled={!!processing}
                        className="flex items-center gap-0.5 font-semibold text-red-600 hover:text-red-700 disabled:opacity-40"
                      >
                        {processing === `ban-${email}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Ban className="h-3 w-3" />
                        )}
                        Ban
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {(members.banned_members || []).filter((e) => !(members.members || []).includes(e)).length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-red-700/80">Banned</p>
              {(members.banned_members || [])
                .filter((e) => !(members.members || []).includes(e))
                .map((e) => (
                  <div key={e} className="mb-1 truncate rounded-xl bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
                    {e}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudyGroupsAdmin() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);

  const load = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const data = await fetchStudyGroups({ teacherEmail: user.email });
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setGroups(list.filter((g) => g.mentor_email === user.email));
    } catch (e) {
      console.error(e);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.email]);

  const handleDelete = (group) => {
    setDialog({
      title: "Delete study group",
      message: `Permanently delete "${group.name}"? All messages will be lost.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        setProcessing(`${group.id}-delete`);
        try {
          await deleteStudyGroup(group.id);
          if (activeGroup?.id === group.id) setActiveGroup(null);
          await load();
        } catch (e) {
          setDialog({
            title: "Error",
            message: e?.message || "Failed to delete group",
            confirmLabel: "OK",
            onConfirm: () => {},
          });
        } finally {
          setProcessing(null);
        }
      },
    });
  };

  const handleGroupUpdated = (updated) => {
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    if (activeGroup?.id === updated.id) setActiveGroup(updated);
  };

  if (activeGroup) {
    return (
      <div className="w-full">
        <GroupChat
          group={activeGroup}
          user={user}
          onBack={() => {
            setActiveGroup(null);
            load();
          }}
          onGroupUpdated={handleGroupUpdated}
          setDialog={setDialog}
        />
        <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="font-poppins text-xl font-bold text-blue-950">Study groups you mentor</h2>
        <p className="mt-1 text-sm text-blue-900/70">
          Students create groups and assign you as mentor. Monitor discussions, remove or ban members who break rules, or delete a group.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className={SPINNER_CLASS} />
        </div>
      ) : groups.length === 0 ? (
        <div className={`${CARD_CLASS} py-16 text-center`}>
          <Users className="mx-auto mb-3 h-10 w-10 text-blue-400" />
          <p className="font-medium text-blue-950">No groups assigned yet</p>
          <p className="mt-1 text-sm text-blue-900/60">
            When students create a study group and choose you as mentor, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const levelClass =
              LEVEL_INFO[group.level]?.color || "bg-blue-50 text-blue-800 border border-blue-200";
            const studentCount = (group.members || []).filter(
              (m) => m !== group.mentor_email && !(group.banned_members || []).includes(m),
            ).length;
            return (
              <div key={group.id} className={`${CARD_CLASS} flex items-center gap-3 p-5`}>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${levelClass}`}>
                      {group.level}
                    </span>
                    <span className="rounded-full border border-yellow-300 bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-800">
                      Mentor
                    </span>
                  </div>
                  <p className="truncate font-semibold text-blue-950">{group.name}</p>
                  <p className="text-xs text-blue-900/70">
                    {group.subject} · {studentCount} student{studentCount !== 1 ? "s" : ""}
                    {group.creator_email ? ` · Created by ${group.creator_email}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveGroup(group)}
                    className={YELLOW_BUTTON_SM}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Monitor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(group)}
                    disabled={!!processing}
                    title="Delete group"
                    className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    {processing === `${group.id}-delete` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
