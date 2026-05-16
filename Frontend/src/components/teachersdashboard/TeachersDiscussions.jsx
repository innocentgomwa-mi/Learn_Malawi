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
import { MessageSquare, Plus, UploadCloud, Send, RefreshCcw } from 'lucide-react';
import { fetchDiscussions, fetchDiscussion, createDiscussion, addDiscussionComment, fetchTeachers } from '@/api';
import { useAuth } from '@/lib/AuthContext';

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
      setThreads(Array.isArray(response) ? response : []);
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

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Discussions / Q&A</h1>
          <p className="text-muted-foreground text-sm mt-1">Answer student questions and moderate discussion threads.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Create new thread</h2>
                <p className="text-sm text-slate-500">Use this to post announcements, explain study topics, or answer student questions.</p>
              </div>
              <UploadCloud className="h-5 w-5 text-slate-500" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={handleTitleChange}
                  placeholder="Enter thread title"
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  ref={newBodyRef}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  rows={5}
                  value={newBody}
                  onChange={handleBodyChange}
                  onKeyUp={(event) => handleTextareaCaret(event, 'body')}
                  onClick={(event) => handleTextareaCaret(event, 'body')}
                  placeholder="Write the discussion thread content here"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Quick insert:</span>
                  {(teachers || []).slice(0, 6).map((teacher) => (
                    <button
                      key={teacher.id || teacher.email}
                      type="button"
                      onClick={() => insertTextAtCursor(newBodyRef, setNewBody, `@${teacher.full_name || teacher.email.split('@')[0]} `)}
                      className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 hover:bg-slate-200"
                    >
                      @{teacher.full_name?.split(' ')[0] || teacher.email.split('@')[0]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor(newBodyRef, setNewBody, '😊 ')}
                    className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 hover:bg-slate-200"
                  >😊</button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor(newBodyRef, setNewBody, '👍 ')}
                    className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 hover:bg-slate-200"
                  >👍</button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor(newBodyRef, setNewBody, '🎉 ')}
                    className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 hover:bg-slate-200"
                  >🎉</button>
                </div>
                {mentionState.open && mentionState.field === 'body' && (
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <div className="mb-2 text-xs font-semibold text-slate-600">Mention a teacher</div>
                    {loadingTeachers ? (
                      <div className="text-xs text-slate-500">Loading suggestions…</div>
                    ) : mentionOptions.length === 0 ? (
                      <div className="text-xs text-slate-500">No matching teachers found.</div>
                    ) : (
                      <div className="grid gap-2">
                        {mentionOptions.map((teacher) => (
                          <button
                            key={teacher.id || teacher.email}
                            type="button"
                            onClick={() => applyMention(teacher, 'body')}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:bg-slate-100"
                          >
                            @{teacher.full_name || teacher.email.split('@')[0]}
                            <span className="block text-xs text-slate-500">{teacher.email}</span>
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
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="mr-2 h-4 w-4" />
                {saving ? 'Creating...' : 'Create thread'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Active discussion threads</h2>
                <p className="text-sm text-slate-500">Threads created by you appear below.</p>
              </div>
              <button
                type="button"
                onClick={loadThreads}
                disabled={loading}
                className="hidden sm:inline-flex items-center rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-500">Loading discussions…</div>
            ) : threads.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-40" />
                <p className="font-medium">No discussions yet</p>
                <p className="text-sm">Create the first thread to start the conversation.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {threads.map((thread) => (
                  <li key={thread.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectThread(thread)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${selectedThread?.id === thread.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-400'}`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{thread.title}</h3>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{thread.comments?.length ?? 0} comments</p>
                        </div>
                        <span className="text-xs text-slate-500">{new Date(thread.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700 line-clamp-3">{thread.body}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Selected discussion</h2>
                <p className="text-sm text-slate-500">Open a thread to review comments and reply.</p>
              </div>
              <button
                type="button"
                onClick={() => selectedThread && loadThread(selectedThread.id)}
                disabled={!selectedThread}
                className="hidden sm:inline-flex items-center rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </button>
            </div>

            {selectedThread ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{selectedThread.title}</h3>
                  <p className="text-sm text-slate-500">Posted on {new Date(selectedThread.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{selectedThread.body}</div>
                <div className="space-y-3">
                  {(selectedThread.comments || []).length === 0 ? (
                    <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500">No replies yet.</div>
                  ) : (
                    (selectedThread.comments || []).map((comment, index) => (
                      <div key={`${selectedThread.id}-${index}`} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-800">
                        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500">
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
              <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">Select a discussion thread from the list to view details.</div>
            )}
          </div>

          <form onSubmit={handleSubmitComment} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Reply to discussion</h2>
                <p className="text-sm text-slate-500">Write an answer or respond to student questions.</p>
              </div>
              <MessageSquare className="h-5 w-5 text-slate-500" />
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
              className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Quick insert:</span>
              {(teachers || []).slice(0, 6).map((teacher) => (
                <button
                  key={teacher.id || teacher.email}
                  type="button"
                  onClick={() => insertTextAtCursor(commentRef, setCommentText, `@${teacher.full_name || teacher.email.split('@')[0]} `)}
                  className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 hover:bg-slate-200"
                >
                  @{teacher.full_name?.split(' ')[0] || teacher.email.split('@')[0]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => insertTextAtCursor(commentRef, setCommentText, '😊 ')}
                className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 hover:bg-slate-200"
              >😊</button>
              <button
                type="button"
                onClick={() => insertTextAtCursor(commentRef, setCommentText, '👍 ')}
                className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 hover:bg-slate-200"
              >👍</button>
              <button
                type="button"
                onClick={() => insertTextAtCursor(commentRef, setCommentText, '🎉 ')}
                className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 hover:bg-slate-200"
              >🎉</button>
            </div>
            {mentionState.open && mentionState.field === 'comment' && (
              <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <div className="mb-2 text-xs font-semibold text-slate-600">Mention a teacher</div>
                {loadingTeachers ? (
                  <div className="text-xs text-slate-500">Loading suggestions…</div>
                ) : mentionOptions.length === 0 ? (
                  <div className="text-xs text-slate-500">No matching teachers found.</div>
                ) : (
                  <div className="grid gap-2">
                    {mentionOptions.map((teacher) => (
                      <button
                        key={teacher.id || teacher.email}
                        type="button"
                        onClick={() => applyMention(teacher, 'comment')}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:bg-slate-100"
                      >
                        @{teacher.full_name || teacher.email.split('@')[0]}
                        <span className="block text-xs text-slate-500">{teacher.email}</span>
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
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
