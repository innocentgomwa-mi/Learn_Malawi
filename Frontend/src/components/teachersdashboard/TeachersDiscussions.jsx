/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   body: string;
 *   comments?: Array<{ author: string; message: string; createdAt: string }>;
 *   createdAt: string;
 * }} DiscussionThread
 */

import { useEffect, useMemo, useState, useRef } from 'react';
import { MessageSquare, Plus, UploadCloud, Send, RefreshCcw, ChevronRight } from 'lucide-react';
import { fetchDiscussions, fetchDiscussion, createDiscussion, addDiscussionComment, fetchTeachers } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import { markDiscussionThreadsAsRead } from '@/lib/notificationStorage';

export default function TeacherDiscussions() {
  const { user } = useAuth();
  const [threads, setThreads] = useState(/** @type {DiscussionThread[]} */ ([]));
  const [selectedThread, setSelectedThread] = useState(/** @type {DiscussionThread | null} */ (null));
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [commentText, setCommentText] = useState('');
  const [threadLoading, setThreadLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [threadFilter, setThreadFilter] = useState('recent');
  const [mentionState, setMentionState] = useState({ open: false, query: '', field: '', start: 0, end: 0 });
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [commentError, setCommentError] = useState(/** @type {string | null} */ (null));
  const newBodyRef = useRef(null);
  const commentRef = useRef(null);

  const loadThreads = async () => {
    setLoading(true);
    setError(null);

    try {
      const teacherEmail = user?.email;
      const response = await fetchDiscussions({ teacherEmail });
      const fetchedThreads = Array.isArray(response) ? response : [];
      setThreads(fetchedThreads);
      if (user?.email && fetchedThreads.length > 0) {
        markDiscussionThreadsAsRead(user.email, fetchedThreads.map((thread) => thread?.id).filter(Boolean), user?.role);
      }
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : String(fetchError);
      setError(message || 'Unable to load discussions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
    loadTeachers();
  }, [user?.email]);

  const loadTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await fetchTeachers();
      setTeachers(Array.isArray(response) ? response : []);
    } catch (fetchError) {
      console.error('Unable to load teacher list', fetchError);
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const insertTextAtCursor = (ref, setter, value) => {
    const textarea = ref.current;
    if (!textarea) {
      setter((current) => `${current}${value}`);
      return;
    }
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? start;
    const next = textarea.value.slice(0, start) + value + textarea.value.slice(end);
    setter(next);
    window.requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + value.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const detectMention = (value, cursorPosition, field) => {
    const prefix = value.slice(0, cursorPosition);
    const match = /(?:^|\s)@([^\s@]*)$/.exec(prefix);
    if (match) {
      setMentionState({
        open: true,
        query: match[1],
        field,
        start: cursorPosition - match[1].length - 1,
        end: cursorPosition,
      });
    } else {
      setMentionState((prev) => (prev.field === field ? { ...prev, open: false } : prev));
    }
  };

  const applyMention = (mention, field) => {
    const ref = field === 'body' ? newBodyRef.current : commentRef.current;
    const text = field === 'body' ? newBody : commentText;
    if (!mentionState.open || mentionState.field !== field) return;
    const insertValue = `@${mention.full_name || mention.email.split('@')[0]} `;
    const updated = text.slice(0, mentionState.start) + insertValue + text.slice(mentionState.end);
    if (field === 'body') {
      setNewBody(updated);
    } else {
      setCommentText(updated);
    }
    setMentionState({ open: false, query: '', field: '', start: 0, end: 0 });
    window.requestAnimationFrame(() => {
      if (ref) {
        const cursor = mentionState.start + insertValue.length;
        ref.focus();
        ref.setSelectionRange(cursor, cursor);
      }
    });
  };

  const loadThread = async (id) => {
    setThreadLoading(true);
    setCommentError(null);

    try {
      const response = await fetchDiscussion(id);
      setSelectedThread(response?.data ?? response ?? null);
    } catch (fetchError) {
      setCommentError(fetchError instanceof Error ? fetchError.message : String(fetchError));
    } finally {
      setThreadLoading(false);
    }
  };

  const handleSelectThread = async (thread) => {
    setSelectedThread(thread);
    await loadThread(thread.id);
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    setCommentError(null);

    if (!selectedThread) {
      setCommentError('Select a discussion thread first.');
      return;
    }

    if (!commentText.trim()) {
      setCommentError('Please enter a comment to reply.');
      return;
    }

    if (!user?.email) {
      setCommentError('You need to be signed in to reply.');
      return;
    }

    try {
      await addDiscussionComment(selectedThread.id, {
        author: user.full_name || user.email.split('@')[0],
        message: commentText.trim(),
      });
      setCommentText('');
      await loadThread(selectedThread.id);
      await loadThreads();
    } catch (submitError) {
      setCommentError(submitError instanceof Error ? submitError.message : String(submitError));
    }
  };

  const handleCreateThread = async () => {
    if (!newTitle.trim() || !newBody.trim()) {
      setError('Please enter both title and description.');
      return;
    }

    if (!user?.email) {
      setError('Teacher email is required to create a discussion.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createDiscussion({
        title: newTitle.trim(),
        body: newBody.trim(),
        teacherEmail: user.email,
      });
      setNewTitle('');
      setNewBody('');
      await loadThreads();
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : String(createError);
      setError(message || 'Unable to create discussion.');
    } finally {
      setSaving(false);
    }
  };

  /** @param {import('react').ChangeEvent<HTMLInputElement>} event */
  const handleTitleChange = (event) => {
    setNewTitle(event.target.value);
  };

  const handleBodyChange = (event) => {
    setNewBody(event.target.value);
    detectMention(event.target.value, event.target.selectionStart, 'body');
  };

  const handleCommentChange = (event) => {
    setCommentText(event.target.value);
    detectMention(event.target.value, event.target.selectionStart, 'comment');
  };

  const handleTextareaCaret = (event, field) => {
    detectMention(event.target.value, event.target.selectionStart, field);
  };

  const mentionOptions = useMemo(() => {
    if (!mentionState.open) return [];
    const query = mentionState.query.toLowerCase();
    return (teachers || [])
      .filter((teacher) => {
        const displayName = `${teacher.full_name || ''}`.toLowerCase();
        const email = `${teacher.email || ''}`.toLowerCase();
        return !query || displayName.includes(query) || email.includes(query);
      })
      .slice(0, 6);
  }, [mentionState.open, mentionState.query, teachers]);

  const filteredThreads = useMemo(() => {
    const threadList = [...threads];
    if (threadFilter === 'replied') {
      return threadList.sort((a, b) => (b.comments?.length ?? 0) - (a.comments?.length ?? 0));
    }
    if (threadFilter === 'unanswered') {
      return threadList
        .filter((thread) => (thread.comments?.length ?? 0) === 0)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return threadList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [threads, threadFilter]);

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in bg-gradient-to-b from-blue-50/70 to-white min-h-[calc(100vh-5rem)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Discussions / Q&A</h1>
          <p className="text-blue-900/70 text-sm mt-1">Engage students faster with clearer, easier-to-manage threads.</p>
        </div>
      </div>

      <div className={`grid gap-6 ${selectedThread ? 'lg:grid-cols-2' : 'lg:grid-cols-[1fr_320px]'}`}>
        <section className="space-y-4">
          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-blue-950">Create new thread</h2>
                <p className="text-sm text-blue-900/70">Post announcements, explain concepts, and respond to learners in one place.</p>
              </div>
              <div className="rounded-xl border border-yellow-300 bg-yellow-100 p-2.5">
                <UploadCloud className="h-5 w-5 text-yellow-700" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={handleTitleChange}
                  placeholder="Enter thread title"
                  className="mt-1 block w-full rounded-xl border border-blue-200 bg-blue-50/40 px-3 py-2.5 text-sm text-blue-950 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900">Description</label>
                <textarea
                  ref={newBodyRef}
                  className="mt-1 block w-full rounded-xl border border-blue-200 bg-blue-50/40 px-3 py-2.5 text-sm text-blue-950 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                  rows={5}
                  value={newBody}
                  onChange={handleBodyChange}
                  onKeyUp={(event) => handleTextareaCaret(event, 'body')}
                  onClick={(event) => handleTextareaCaret(event, 'body')}
                  placeholder="Write the discussion thread content here"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-blue-900/65">
                  <span>Quick insert:</span>
                  {(teachers || []).slice(0, 6).map((teacher) => (
                    <button
                      key={teacher.id || teacher.email}
                      type="button"
                      onClick={() => insertTextAtCursor(newBodyRef, setNewBody, `@${teacher.full_name || teacher.email.split('@')[0]} `)}
                      className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-blue-900 hover:border-yellow-300 hover:bg-yellow-100"
                    >
                      @{teacher.full_name?.split(' ')[0] || teacher.email.split('@')[0]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor(newBodyRef, setNewBody, '😊 ')}
                    className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 hover:border-yellow-300 hover:bg-yellow-100"
                  >😊</button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor(newBodyRef, setNewBody, '👍 ')}
                    className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 hover:border-yellow-300 hover:bg-yellow-100"
                  >👍</button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor(newBodyRef, setNewBody, '🎉 ')}
                    className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 hover:border-yellow-300 hover:bg-yellow-100"
                  >🎉</button>
                </div>
                {mentionState.open && mentionState.field === 'body' && (
                  <div className="mt-2 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                    <div className="mb-2 text-xs font-semibold text-blue-900/70">Mention a teacher</div>
                    {loadingTeachers ? (
                      <div className="text-xs text-blue-900/60">Loading suggestions…</div>
                    ) : mentionOptions.length === 0 ? (
                      <div className="text-xs text-blue-900/60">No matching teachers found.</div>
                    ) : (
                      <div className="grid gap-2">
                        {mentionOptions.map((teacher) => (
                          <button
                            key={teacher.id || teacher.email}
                            type="button"
                            onClick={() => applyMention(teacher, 'body')}
                            className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-left text-sm hover:border-yellow-300 hover:bg-yellow-50"
                          >
                            @{teacher.full_name || teacher.email.split('@')[0]}
                            <span className="block text-xs text-blue-900/60">{teacher.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button
                type="button"
                onClick={handleCreateThread}
                disabled={saving}
                className="inline-flex items-center rounded-xl border border-yellow-300 bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-blue-950 shadow-sm hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="mr-2 h-4 w-4" />
                {saving ? 'Creating...' : 'Create thread'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-950">Active discussion threads</h2>
                <p className="text-sm text-blue-900/70">Threads created by you appear below.</p>
              </div>
              <button
                type="button"
                onClick={loadThreads}
                disabled={loading}
                className="hidden sm:inline-flex items-center rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 shadow-sm hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Refresh
              </button>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {[
                { id: 'recent', label: 'Most recent' },
                { id: 'replied', label: 'Most replied' },
                { id: 'unanswered', label: 'Unanswered' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setThreadFilter(option.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    threadFilter === option.id
                      ? 'border-yellow-300 bg-yellow-400 text-blue-950'
                      : 'border-blue-200 bg-blue-50 text-blue-900 hover:border-yellow-300 hover:bg-yellow-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-500">Loading discussions…</div>
            ) : filteredThreads.length === 0 ? (
              <div className="py-16 text-center text-blue-900/60">
                <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-40 text-blue-300" />
                <p className="font-medium text-blue-950">{threadFilter === 'unanswered' ? 'No unanswered threads' : 'No discussions yet'}</p>
                <p className="text-sm">
                  {threadFilter === 'unanswered'
                    ? 'All threads have replies. Great moderation work.'
                    : 'Create the first thread to start the conversation.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredThreads.map((thread) => (
                  <li key={thread.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectThread(thread)}
                      className={`w-full rounded-2xl border text-left transition-all ${
                        selectedThread?.id === thread.id
                          ? 'border-blue-500 bg-blue-600 px-5 py-5 text-white shadow-md ring-2 ring-blue-200 sm:px-6 sm:py-6'
                          : 'border-blue-100 bg-white px-4 py-4 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className={`text-base font-semibold ${selectedThread?.id === thread.id ? 'text-white' : 'text-blue-950'}`}>{thread.title}</h3>
                          <p className={`text-xs uppercase tracking-[0.2em] ${selectedThread?.id === thread.id ? 'text-blue-100' : 'text-blue-800/60'}`}>
                            {thread.comments?.length ?? 0} comments
                          </p>
                        </div>
                        <div className={`inline-flex items-center gap-2 text-xs ${selectedThread?.id === thread.id ? 'text-blue-100' : 'text-blue-900/60'}`}>
                          <span>{formatDate(thread.createdAt)}</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <p className={`mt-3 text-sm leading-6 line-clamp-3 ${selectedThread?.id === thread.id ? 'text-blue-50' : 'text-blue-900/80'}`}>
                        {thread.body}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 self-start">
          <div
            className={`rounded-2xl border shadow-sm transition-all duration-300 ${
              selectedThread
                ? 'border-blue-500 bg-blue-700 p-7 sm:p-8'
                : 'border-blue-200 bg-white p-6'
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className={`text-lg font-semibold ${selectedThread ? 'text-white' : 'text-blue-950'}`}>Selected discussion</h2>
                <p className={`text-sm ${selectedThread ? 'text-blue-100' : 'text-blue-900/70'}`}>Open a thread to review comments and reply.</p>
              </div>
              <button
                type="button"
                onClick={() => selectedThread && loadThread(selectedThread.id)}
                disabled={!selectedThread}
                className={`hidden sm:inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                  selectedThread
                    ? 'border border-blue-300 bg-blue-600 text-white hover:bg-blue-500'
                    : 'border border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </button>
            </div>

            {selectedThread ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedThread.title}</h3>
                  <p className="text-sm text-blue-100">Posted on {formatDate(selectedThread.createdAt)}</p>
                </div>
                <div className="rounded-2xl border border-blue-300 bg-blue-600/70 p-4 text-sm leading-6 text-blue-50">{selectedThread.body}</div>
                <div className="space-y-3 max-h-[22rem] overflow-y-auto pr-1">
                  {(selectedThread.comments || []).length === 0 ? (
                    <div className="rounded-2xl border border-blue-300 bg-blue-600/60 p-4 text-sm text-blue-100">No replies yet.</div>
                  ) : (
                    (selectedThread.comments || []).map((comment, index) => (
                      <div key={`${selectedThread.id}-${index}`} className="rounded-2xl border border-blue-300 bg-blue-600/70 p-4 text-sm text-blue-50">
                        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-blue-100">
                          <span>{comment.author}</span>
                          <span>{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p>{comment.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8 text-center text-sm text-blue-900/65">Select a discussion thread from the list to view details.</div>
            )}
          </div>

          <form onSubmit={handleSubmitComment} className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-950">Reply to discussion</h2>
                <p className="text-sm text-blue-900/70">Write an answer or respond to student questions.</p>
              </div>
              <div className="rounded-xl border border-yellow-300 bg-yellow-100 p-2.5">
                <MessageSquare className="h-5 w-5 text-yellow-700" />
              </div>
            </div>
            <textarea
              ref={commentRef}
              value={commentText}
              onChange={handleCommentChange}
              onKeyUp={(event) => handleTextareaCaret(event, 'comment')}
              onClick={(event) => handleTextareaCaret(event, 'comment')}
              rows={4}
              placeholder={selectedThread ? 'Write your response...' : 'Select a discussion first.'}
              disabled={!selectedThread}
              className="block w-full rounded-2xl border border-blue-200 bg-blue-50/40 px-4 py-3 text-sm text-blue-950 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-blue-900/65">
              <span>Quick insert:</span>
              {(teachers || []).slice(0, 6).map((teacher) => (
                <button
                  key={teacher.id || teacher.email}
                  type="button"
                  onClick={() => insertTextAtCursor(commentRef, setCommentText, `@${teacher.full_name || teacher.email.split('@')[0]} `)}
                  className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-blue-900 hover:border-yellow-300 hover:bg-yellow-100"
                >
                  @{teacher.full_name?.split(' ')[0] || teacher.email.split('@')[0]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => insertTextAtCursor(commentRef, setCommentText, '😊 ')}
                className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 hover:border-yellow-300 hover:bg-yellow-100"
              >😊</button>
              <button
                type="button"
                onClick={() => insertTextAtCursor(commentRef, setCommentText, '👍 ')}
                className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 hover:border-yellow-300 hover:bg-yellow-100"
              >👍</button>
              <button
                type="button"
                onClick={() => insertTextAtCursor(commentRef, setCommentText, '🎉 ')}
                className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 hover:border-yellow-300 hover:bg-yellow-100"
              >🎉</button>
            </div>
            {mentionState.open && mentionState.field === 'comment' && (
              <div className="mt-2 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                <div className="mb-2 text-xs font-semibold text-blue-900/70">Mention a teacher</div>
                {loadingTeachers ? (
                  <div className="text-xs text-blue-900/60">Loading suggestions…</div>
                ) : mentionOptions.length === 0 ? (
                  <div className="text-xs text-blue-900/60">No matching teachers found.</div>
                ) : (
                  <div className="grid gap-2">
                    {mentionOptions.map((teacher) => (
                      <button
                        key={teacher.id || teacher.email}
                        type="button"
                        onClick={() => applyMention(teacher, 'comment')}
                        className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-left text-sm hover:border-yellow-300 hover:bg-yellow-50"
                      >
                        @{teacher.full_name || teacher.email.split('@')[0]}
                        <span className="block text-xs text-blue-900/60">{teacher.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {commentError ? <p className="mt-3 text-sm text-red-600">{commentError}</p> : null}
            <button
              type="submit"
              disabled={!selectedThread || !commentText.trim()}
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-yellow-300 bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-blue-950 shadow-sm hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="mr-2 h-4 w-4" />
              Post reply
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
