/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   body: string;
 *   teacherEmail: string;
 *   comments?: Array<{ author: string; message: string; createdAt: string }>;
 *   createdAt: string;
 * }} DiscussionThread
 */

import { useEffect, useState } from 'react';
import { MessageSquare, Send, RefreshCcw } from 'lucide-react';
import { fetchDiscussions, fetchDiscussion, addDiscussionComment } from '@/api';
import { useAuth } from '@/lib/AuthContext';

export default function Discussions() {
  const { user } = useAuth();
  const [threads, setThreads] = useState(/** @type {DiscussionThread[]} */ ([]));
  const [selectedThread, setSelectedThread] = useState(/** @type {DiscussionThread | null} */ (null));
  const [loading, setLoading] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [commentError, setCommentError] = useState(/** @type {string | null} */ (null));

  const loadThreads = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchDiscussions();
      const data = Array.isArray(response) ? response : response?.data ?? [];
      setThreads(data);
      if (!selectedThread && data.length > 0) {
        setSelectedThread(data[0]);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    loadThreads();
  }, []);

  const handleSelectThread = (thread) => {
    setSelectedThread(thread);
    loadThread(thread.id);
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    setCommentError(null);

    if (!selectedThread) {
      setCommentError('Select a discussion first.');
      return;
    }

    if (!commentText.trim()) {
      setCommentError('Please write a comment before posting.');
      return;
    }

    if (!user?.email) {
      setCommentError('You must be signed in to participate.');
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

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Community Discussions</h1>
          <p className="text-muted-foreground text-sm mt-1">Join teacher-posted threads and participate in conversations with your classmates.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Discussion threads</h2>
                <p className="text-sm text-slate-500">Threads created by teachers are listed here for students to join.</p>
              </div>
              <button
                type="button"
                onClick={loadThreads}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="py-10 text-center text-slate-500">Loading discussions…</div>
            ) : threads.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-40" />
                <p className="font-medium">No discussion threads yet.</p>
                <p className="text-sm">Check back later for teacher posts and questions.</p>
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
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-sm font-semibold text-slate-900">{thread.title}</h3>
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{thread.comments?.length ?? 0} comments</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Posted by {thread.teacherEmail}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <main className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {selectedThread ? (
              <>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedThread.title}</h2>
                    <p className="text-sm text-slate-500">Posted by {selectedThread.teacherEmail}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{new Date(selectedThread.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{selectedThread.body}</div>
              </>
            ) : (
              <div className="py-16 text-center text-slate-500">Select a thread to view the conversation.</div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Conversation</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{selectedThread?.comments?.length ?? 0} replies</span>
              </div>

              {threadLoading ? (
                <div className="py-10 text-center text-slate-500">Loading thread…</div>
              ) : selectedThread?.comments?.length ? (
                <div className="space-y-4">
                  {selectedThread.comments.map((comment, index) => (
                    <div key={`${comment.createdAt}-${index}`} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-800">
                      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span>{comment.author}</span>
                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p>{comment.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-500">No replies yet. Be the first to answer.</div>
              )}
            </div>

            <form onSubmit={handleSubmitComment} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Add your comment</h2>
                  <p className="text-sm text-slate-500">Share your thoughts or ask a question.</p>
                </div>
                <MessageSquare className="h-5 w-5 text-slate-500" />
              </div>

              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                rows={4}
                placeholder={user ? 'Write a comment...' : 'Sign in to participate.'}
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                disabled={!user}
              />
              {commentError ? <p className="mt-3 text-sm text-red-600">{commentError}</p> : null}
              <button
                type="submit"
                disabled={!selectedThread || !user || !commentText.trim()}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="mr-2 h-4 w-4" />
                Post comment
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
