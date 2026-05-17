import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchChatMessages, createChatMessage, updateChatMessage, deleteChatMessage, fetchTeachers } from '@/api';
import { markChatMessagesAsSeen } from '@/lib/notificationStorage';
import { Send, Smile, Pencil, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const EMOJIS = ['😀','😂','😍','🥰','😎','🤔','😢','😡','👍','👎','❤️','🔥','🎉','✅','⭐','🙏','👏','💪','🤝','📚','✏️','🏫','💡','🌟','😊','😅','🤣','😇','🙌','💯'];

function MessageText({ text, isMe }) {
  const parts = text.split(/(@\S+)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('@') ? (
          <span key={i} className={cn('font-semibold rounded px-0.5', isMe ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700')}>
            {part}
          </span>
        ) : part
      )}
    </span>
  );
}

export default function TeacherChat({ user }) {
  const [messages, setMessages] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionStart, setMentionStart] = useState(-1);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const loadMessages = async () => {
    if (!user?.email) return;
    const data = await fetchChatMessages({ room: 'general' });
    setMessages(Array.isArray(data) ? data : []);
  };

  const loadTeachers = async () => {
    if (!user?.email) return;
    const data = await fetchTeachers();
    setTeachers(Array.isArray(data) ? data.filter((u) => u.email !== user.email) : []);
  };

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (!active || !user?.email) return;
      await Promise.all([loadMessages(), loadTeachers()]);
    };

    refresh();
    const interval = window.setInterval(refresh, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user?.email || messages.length === 0) return;
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage) return;
    const lastSeen = latestMessage.created_date || latestMessage.createdAt || latestMessage.created_at || new Date().toISOString();
    markChatMessagesAsSeen(user.email, 'general', lastSeen);
  }, [messages, user?.email]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    const cursor = e.target.selectionStart;
    const textUpToCursor = val.slice(0, cursor);
    const atIndex = textUpToCursor.lastIndexOf('@');
    if (atIndex !== -1 && !textUpToCursor.slice(atIndex).includes(' ')) {
      setMentionQuery(textUpToCursor.slice(atIndex + 1).toLowerCase());
      setMentionStart(atIndex);
    } else {
      setMentionQuery(null);
    }
  };

  const selectMention = (teacher) => {
    const name = (teacher.full_name || teacher.email).replace(/\s+/g, '_');
    const before = text.slice(0, mentionStart);
    const after = text.slice(mentionStart + 1 + (mentionQuery?.length || 0));
    setText(`${before}@${name} ${after}`);
    setMentionQuery(null);
    inputRef.current?.focus();
  };

  const filteredTeachers = mentionQuery !== null
    ? teachers.filter(t => (t.full_name || t.email).toLowerCase().includes(mentionQuery)).slice(0, 6)
    : [];

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    const created = await createChatMessage({
      sender_name: user?.full_name || user?.email,
      sender_email: user?.email,
      message: text.trim(),
      room: 'general',
    });
    setMessages(prev => [...prev, created]);
    setText('');
    setSending(false);
  };

  const handleDelete = async (id) => {
    await deleteChatMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.message);
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    const updated = await updateChatMessage(id, { message: editText.trim() });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, message: updated.message } : m));
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const handleKey = (e) => {
    if (mentionQuery !== null && filteredTeachers.length > 0 && e.key === 'Enter') {
      e.preventDefault(); selectMention(filteredTeachers[0]); return;
    }
    if (e.key === 'Escape') { setMentionQuery(null); return; }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-[600px] bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-sm">Teachers General Chat</h3>
        <p className="text-xs text-muted-foreground">Type @ to mention a teacher · Hover messages to edit or delete</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-10">No messages yet. Be the first to say hello! 👋</div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_email === user?.email;
          const isEditing = editingId === msg.id;
          return (
            <div key={msg.id} className={cn('flex gap-2 group', isMe ? 'justify-end' : 'justify-start')}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0 mt-0.5">
                  {(msg.sender_name || msg.sender_email)?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={cn('max-w-[70%]', isMe ? 'items-end' : 'items-start', 'flex flex-col')}>
                {!isMe && <p className="text-xs text-muted-foreground mb-1">{msg.sender_name || msg.sender_email}</p>}

                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(msg.id); if (e.key === 'Escape') cancelEdit(); }}
                      className="text-sm h-8"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(msg.id)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={cancelEdit} className="p-1 rounded hover:bg-slate-100 text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <div className="relative flex items-end gap-1">
                    {/* Edit/delete actions — only for own messages */}
                    {isMe && (
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mb-1 order-first">
                        <button onClick={() => startEdit(msg)} className="p-1 rounded hover:bg-slate-100 text-muted-foreground" title="Edit">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(msg.id)} className="p-1 rounded hover:bg-red-100 text-red-400" title="Delete">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className={cn('px-4 py-2 rounded-2xl text-sm', isMe ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm')}>
                      <MessageText text={msg.message} isMe={isMe} />
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground mt-1">
                  {msg.created_date ? format(new Date(msg.created_date), 'HH:mm') : ''}
                  {msg.updated_date && msg.updated_date !== msg.created_date && <span className="ml-1 opacity-60">(edited)</span>}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-border space-y-2 relative">
        {/* Mention dropdown */}
        {mentionQuery !== null && filteredTeachers.length > 0 && (
          <div className="absolute bottom-full left-4 mb-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10 min-w-[200px]">
            {filteredTeachers.map(t => (
              <button key={t.id} onMouseDown={(e) => { e.preventDefault(); selectMention(t); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {(t.full_name || t.email).charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{t.full_name || t.email}</span>
              </button>
            ))}
          </div>
        )}

        {/* Emoji picker */}
        {showEmojis && (
          <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-lg border border-border">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => { setText(t => t + e); setShowEmojis(false); inputRef.current?.focus(); }}
                className="text-lg hover:scale-125 transition-transform p-0.5">{e}</button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="button" size="icon" variant="ghost" onClick={() => setShowEmojis(v => !v)} className="shrink-0 text-muted-foreground hover:text-foreground">
            <Smile className="w-5 h-5" />
          </Button>
          <Input ref={inputRef} value={text} onChange={handleTextChange} onKeyDown={handleKey}
            placeholder="Type a message... use @ to mention" className="flex-1" />
          <Button onClick={handleSend} disabled={sending || !text.trim()} size="icon" className="bg-emerald-600 hover:bg-emerald-700 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}