/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   subject: string;
 *   level: string;
 *   description?: string;
 *   scheduled_at?: string;
 *   members?: string[];
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
import { fetchStudyGroups, fetchStudyGroupMessages, updateStudyGroup, createStudyGroupMessage } from "@/api";
import RequireAccount from '@/components/RequireAccount';
import { Users, MessageSquare, Send, Loader2, Calendar, ChevronLeft } from "lucide-react";

const LEVEL_COLORS = {
  PSLC: "bg-emerald-100 text-emerald-700",
  JCE: "bg-blue-100 text-blue-700",
  MSCE: "bg-purple-100 text-purple-700",
};

export default function StudyGroups() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [groups, setGroups] = useState(/** @type {StudyGroup[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(/** @type {StudyGroup | null} */ (null));
  const [messages, setMessages] = useState(/** @type {StudyGroupMessage[]} */ ([]));
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(/** @type {HTMLDivElement | null} */ (null));

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
    if (!members.includes(user.email)) {
      const updated = await updateStudyGroup(group.id, { members: [...members, user.email] });
      setGroups((prev) => prev.map((g) => (g.id === group.id ? updated : g)));
      setActiveGroup(updated);
    } else {
      setActiveGroup(group);
    }
  };

  /** @param {import('react').FormEvent<HTMLFormElement>} e */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim() || !activeGroup || !user?.email) return;

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

  if (isLoadingAuth || loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  }

  if (!isAuthenticated) {
    return <RequireAccount resourceName="Study Groups" />;
  }

  if (activeGroup) {
    const isMentor = activeGroup.mentor_email === user?.email;
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col h-[80vh]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setActiveGroup(null)} className="p-2 rounded-xl bg-muted hover:bg-primary/10">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="font-poppins font-bold text-foreground">{activeGroup.name}</h2>
            <p className="text-xs text-muted-foreground">{activeGroup.subject} · {activeGroup.level} · {(activeGroup.members || []).length} members {isMentor && "· You are the mentor"}</p>
          </div>
        </div>

        <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
              className="flex-1 bg-muted rounded-xl px-4 py-2 text-sm outline-none text-foreground"
            />
            <button type="submit" disabled={sending || !msgText.trim()}
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
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground">No study groups yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Ask your teacher to create a study group for your subject.</p>
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
                <button
                  onClick={() => joinGroup(group)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all bg-primary text-primary-foreground hover:opacity-90">
                  <MessageSquare className="h-4 w-4" />
                  {joined ? "Open Discussion" : "Join & Discuss"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}