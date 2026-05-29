/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   body: string;
 *   teacherEmail: string;
 *   comments?: Array<{ author: string; message: string; createdAt: string }>;
 *   createdAt: string;
 *   updatedAt?: string;
 * }} DiscussionThread
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MessageSquare,
  Send,
  RefreshCcw,
  Search,
  ChevronLeft,
  MessagesSquare,
  GraduationCap,
  Clock,
  MessageCircle,
} from "lucide-react";
import { fetchDiscussions, fetchDiscussion, addDiscussionComment } from "@/api";
import { useAuth } from "@/lib/AuthContext";
import ResourcePageHero from "@/components/ResourcePageHero";
import {
  PAGE_WRAP,
  SPINNER_CLASS,
  YELLOW_BUTTON_CLASS,
  YELLOW_BUTTON_SM,
  OUTLINE_BUTTON_CLASS,
  SEARCH_INPUT_CLASS,
  filterButtonClass,
} from "@/lib/resourcePageStyles";

const SORT_OPTIONS = [
  { id: "active", label: "Latest activity" },
  { id: "replies", label: "Most replies" },
  { id: "newest", label: "Newest topics" },
];

function displayNameFromEmail(email) {
  if (!email) return "Teacher";
  const local = email.split("@")[0] || email;
  return local.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getInitials(name) {
  const parts = (name || "?").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) || "?").toUpperCase();
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatFullTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** @param {DiscussionThread} thread */
function getLastActivityIso(thread) {
  const comments = thread.comments || [];
  const lastComment = comments.length ? comments[comments.length - 1]?.createdAt : null;
  const candidates = [thread.updatedAt, lastComment, thread.createdAt].filter(Boolean);
  return candidates.sort().pop() || thread.createdAt;
}

/** @param {DiscussionThread} thread */
function getReplyPreview(thread) {
  const comments = thread.comments || [];
  if (comments.length > 0) {
    const last = comments[comments.length - 1];
    return `${last.author}: ${last.message}`;
  }
  return thread.body;
}

/** @param {import('@/lib/AuthContext').AuthUser | null | undefined} user */
function getCurrentUserAuthorNames(user) {
  if (!user) return [];
  const names = [];
  if (user.full_name?.trim()) names.push(user.full_name.trim());
  if (user.email) names.push(user.email.split("@")[0]);
  return names;
}

/** @param {{ author: string }} comment @param {import('@/lib/AuthContext').AuthUser | null | undefined} user */
function isCommentByCurrentUser(comment, user) {
  const author = (comment.author || "").trim().toLowerCase();
  if (!author || !user) return false;
  return getCurrentUserAuthorNames(user).some((name) => name.toLowerCase() === author);
}

function Avatar({ name, variant = "member", size = "md" }) {
  const sizeClass =
    size === "lg" ? "h-11 w-11 text-sm" : size === "sm" ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-xs";
  const colorClass =
    variant === "teacher"
      ? "bg-gradient-to-br from-blue-700 to-blue-900 text-yellow-300 ring-2 ring-yellow-400/50"
      : variant === "self"
        ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-blue-950 ring-2 ring-yellow-300"
        : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 ring-2 ring-blue-200";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClass} ${colorClass}`}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}

/** @param {{ thread: DiscussionThread; active: boolean; onSelect: () => void }} props */
function ThreadListItem({ thread, active, onSelect }) {
  const replyCount = thread.comments?.length ?? 0;
  const teacherName = displayNameFromEmail(thread.teacherEmail);
  const lastActive = getLastActivityIso(thread);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border px-4 py-3.5 text-left transition-all ${
        active
          ? "border-yellow-400 bg-yellow-50 shadow-sm ring-1 ring-yellow-300/60"
          : "border-blue-100 bg-white hover:border-blue-300 hover:bg-blue-50/40"
      }`}
    >
      <div className="flex gap-3">
        <Avatar name={teacherName} variant="teacher" size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`line-clamp-2 text-sm font-semibold leading-snug ${active ? "text-blue-950" : "text-blue-900"}`}>
              {thread.title}
            </h3>
            {replyCount > 0 && (
              <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                {replyCount}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-blue-900/60">{getReplyPreview(thread)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-blue-800/70">
            <span className="inline-flex items-center gap-0.5 font-medium text-blue-700">
              <GraduationCap className="h-3 w-3" />
              {teacherName}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(lastActive)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/** @param {{ comment: { author: string; message: string; createdAt: string }; isMe: boolean }} props */
function ReplyPost({ comment, isMe }) {
  return (
    <article
      className={`flex px-4 py-3 sm:px-5 ${isMe ? "justify-end bg-yellow-50/20" : "justify-start bg-white"}`}
    >
      <div className={`flex max-w-[min(100%,36rem)] gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        <Avatar name={comment.author} variant={isMe ? "self" : "member"} size="sm" />
        <div className={`min-w-0 ${isMe ? "items-end text-right" : "items-start text-left"} flex flex-col`}>
          <div
            className={`mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${isMe ? "justify-end" : "justify-start"}`}
          >
            <span className={`text-xs font-semibold ${isMe ? "text-yellow-800" : "text-blue-800"}`}>
              {isMe ? "You" : comment.author}
            </span>
            <time
              className={`text-[10px] ${isMe ? "text-yellow-800/60" : "text-blue-800/50"}`}
              dateTime={comment.createdAt}
              title={formatFullTime(comment.createdAt)}
            >
              {formatRelativeTime(comment.createdAt)}
            </time>
          </div>
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
              isMe
                ? "border border-yellow-300 bg-yellow-400 text-blue-950"
                : "border border-blue-200 bg-blue-50 text-blue-950"
            }`}
          >
            <p className="whitespace-pre-wrap">{comment.message}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Discussions() {
  const { user } = useAuth();
  const [threads, setThreads] = useState(/** @type {DiscussionThread[]} */ ([]));
  const [selectedThread, setSelectedThread] = useState(/** @type {DiscussionThread | null} */ (null));
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("active");
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [commentError, setCommentError] = useState(/** @type {string | null} */ (null));
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const repliesEndRef = useRef(null);

  const loadThreads = async (keepSelection = true) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchDiscussions();
      const data = Array.isArray(response) ? response : response?.data ?? [];
      setThreads(data);
      if (keepSelection && selectedThread) {
        const updated = data.find((t) => t.id === selectedThread.id);
        if (updated) setSelectedThread(updated);
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
      const thread = response?.data ?? response ?? null;
      setSelectedThread(thread);
      return thread;
    } catch (fetchError) {
      setCommentError(fetchError instanceof Error ? fetchError.message : String(fetchError));
      return null;
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => {
    loadThreads(false).then(() => {});
  }, []);

  useEffect(() => {
    if (!threadLoading && selectedThread && repliesEndRef.current) {
      repliesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [selectedThread?.comments?.length, threadLoading]);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...threads];
    if (q) {
      list = list.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.body?.toLowerCase().includes(q) ||
          t.teacherEmail?.toLowerCase().includes(q) ||
          (t.comments || []).some(
            (c) => c.author?.toLowerCase().includes(q) || c.message?.toLowerCase().includes(q),
          ),
      );
    }
    list.sort((a, b) => {
      if (sort === "replies") {
        return (b.comments?.length ?? 0) - (a.comments?.length ?? 0);
      }
      if (sort === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(getLastActivityIso(b)).getTime() - new Date(getLastActivityIso(a)).getTime();
    });
    return list;
  }, [threads, search, sort]);

  const totalReplies = useMemo(
    () => threads.reduce((sum, t) => sum + (t.comments?.length ?? 0), 0),
    [threads],
  );

  const handleSelectThread = async (thread) => {
    setSelectedThread(thread);
    setMobileShowThread(true);
    setCommentError(null);
    await loadThread(thread.id);
  };

  const handleBackToList = () => {
    setMobileShowThread(false);
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    setCommentError(null);
    if (!selectedThread) {
      setCommentError("Select a discussion first.");
      return;
    }
    if (!commentText.trim()) {
      setCommentError("Please write a reply before posting.");
      return;
    }
    if (!user?.email) {
      setCommentError("You must be signed in to participate.");
      return;
    }
    setPosting(true);
    try {
      await addDiscussionComment(selectedThread.id, {
        author: user.full_name || user.email.split("@")[0],
        message: commentText.trim(),
      });
      setCommentText("");
      await loadThread(selectedThread.id);
      await loadThreads(true);
    } catch (submitError) {
      setCommentError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setPosting(false);
    }
  };

  const teacherName = selectedThread ? displayNameFromEmail(selectedThread.teacherEmail) : "";
  const replyCount = selectedThread?.comments?.length ?? 0;

  return (
    <div className={PAGE_WRAP}>
      <ResourcePageHero
        icon={MessagesSquare}
        title="Discussion Forum"
        subtitle="Browse teacher-led topics, read what classmates have shared, and join the conversation with clear threaded replies."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-blue-900/70">
        <span className="rounded-full border border-blue-200 bg-white px-3 py-1 font-medium text-blue-950">
          {threads.length} {threads.length === 1 ? "topic" : "topics"}
        </span>
        <span className="rounded-full border border-blue-200 bg-white px-3 py-1 font-medium text-blue-950">
          {totalReplies} {totalReplies === 1 ? "reply" : "replies"}
        </span>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid min-h-[calc(100vh-14rem)] gap-0 overflow-hidden rounded-2xl border border-blue-200/80 bg-white shadow-[0_12px_40px_-24px_rgba(30,58,138,0.35)] lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        {/* Thread list sidebar */}
        <aside
          className={`flex flex-col border-b border-blue-200/80 bg-gradient-to-b from-blue-50/80 to-white lg:border-b-0 lg:border-r ${
            mobileShowThread ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="border-b border-blue-200/80 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-poppins text-sm font-bold uppercase tracking-wide text-blue-950">
                Topics
              </h2>
              <button
                type="button"
                onClick={() => loadThreads(true)}
                disabled={loading}
                className={YELLOW_BUTTON_SM}
                title="Refresh topics"
              >
                <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics or replies…"
                className={SEARCH_INPUT_CLASS}
                aria-label="Search discussions"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSort(opt.id)}
                  className={filterButtonClass(sort === opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className={SPINNER_CLASS} />
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="mx-auto mb-3 h-10 w-10 text-blue-300" />
                <p className="text-sm font-medium text-blue-950">No topics found</p>
                <p className="mt-1 text-xs text-blue-900/60">
                  {search ? "Try a different search term." : "Teachers will post discussion topics here soon."}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredThreads.map((thread) => (
                  <li key={thread.id}>
                    <ThreadListItem
                      thread={thread}
                      active={selectedThread?.id === thread.id}
                      onSelect={() => handleSelectThread(thread)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Thread detail */}
        <main
          className={`min-h-[480px] flex-col bg-white ${
            selectedThread
              ? mobileShowThread
                ? "flex"
                : "hidden lg:flex"
              : "hidden lg:flex"
          }`}
        >
          {!selectedThread ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-yellow-100">
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
              <h2 className="font-poppins text-lg font-bold text-blue-950">Select a topic</h2>
              <p className="mt-2 max-w-sm text-sm text-blue-900/60">
                Choose a discussion from the list to read the opening post and join the conversation.
              </p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <header className="shrink-0 border-b border-blue-200/80 bg-gradient-to-r from-blue-950 to-blue-900 px-4 py-4 text-white sm:px-6">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className={`${YELLOW_BUTTON_SM} lg:hidden`}
                    aria-label="Back to topics"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs text-blue-200">
                      {replyCount} {replyCount === 1 ? "reply" : "replies"}
                    </p>
                    <h2 className="font-poppins text-lg font-bold leading-snug sm:text-xl">{selectedThread.title}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-blue-200/90">
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-yellow-400" />
                        {teacherName}
                      </span>
                      <span>·</span>
                      <time dateTime={selectedThread.createdAt}>
                        Started {formatRelativeTime(selectedThread.createdAt)}
                      </time>
                    </p>
                  </div>
                </div>
              </header>

              {/* Scrollable posts */}
              <div className="flex-1 overflow-y-auto">
                {threadLoading ? (
                  <div className="flex justify-center py-16">
                    <div className={SPINNER_CLASS} />
                  </div>
                ) : (
                  <>
                    {/* Original post (OP) */}
                    <article className="border-b-2 border-yellow-300/80 bg-gradient-to-br from-blue-50/60 to-yellow-50/30 px-4 py-5 sm:px-6">
                      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-800">
                        <span className="rounded-md bg-blue-900 px-2 py-0.5 text-yellow-300">Original post</span>
                        <span className="text-blue-800/60">by teacher</span>
                      </div>
                      <div className="flex gap-4">
                        <Avatar name={teacherName} variant="teacher" size="lg" />
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
                            <span className="font-semibold text-blue-950">{teacherName}</span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[10px] font-medium text-blue-800">
                              <GraduationCap className="h-3 w-3 text-yellow-600" />
                              Teacher
                            </span>
                            <time
                              className="text-xs text-blue-800/50"
                              dateTime={selectedThread.createdAt}
                              title={formatFullTime(selectedThread.createdAt)}
                            >
                              {formatFullTime(selectedThread.createdAt)}
                            </time>
                          </div>
                          <div className="rounded-xl border border-blue-100 bg-white/80 p-4 text-sm leading-relaxed text-blue-900/90 shadow-sm">
                            <p className="whitespace-pre-wrap">{selectedThread.body}</p>
                          </div>
                        </div>
                      </div>
                    </article>

                    {/* Replies */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-blue-50/40 px-4 py-2.5 sm:px-6">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-blue-800">
                        Replies ({replyCount})
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-blue-800/80">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-3 w-5 rounded-md border border-yellow-300 bg-yellow-400" aria-hidden />
                          Your replies
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-3 w-5 rounded-md border border-blue-200 bg-blue-50" aria-hidden />
                          Classmates
                        </span>
                      </div>
                    </div>

                    {replyCount === 0 ? (
                      <div className="px-4 py-14 text-center sm:px-6">
                        <MessageSquare className="mx-auto mb-3 h-10 w-10 text-blue-300" />
                        <p className="text-sm font-medium text-blue-950">No replies yet</p>
                        <p className="mt-1 text-xs text-blue-900/60">Be the first to share your thoughts below.</p>
                      </div>
                    ) : (
                      <div>
                        {selectedThread.comments?.map((comment, index) => (
                          <ReplyPost
                            key={`${comment.createdAt}-${index}`}
                            comment={comment}
                            isMe={isCommentByCurrentUser(comment, user)}
                          />
                        ))}
                      </div>
                    )}
                    <div ref={repliesEndRef} className="h-1" aria-hidden />
                  </>
                )}
              </div>

              {/* Reply composer */}
              <form
                onSubmit={handleSubmitComment}
                className="shrink-0 border-t border-blue-200 bg-blue-50/50 p-4 sm:p-5"
              >
                <label htmlFor="forum-reply" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-blue-800">
                  Write a reply
                </label>
                <textarea
                  id="forum-reply"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  placeholder="Share your answer, ask a follow-up, or add to the discussion…"
                  className="block w-full resize-none rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-blue-950 shadow-sm outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-400"
                  disabled={posting}
                />
                {commentError && <p className="mt-2 text-sm text-red-600">{commentError}</p>}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-blue-800/50">
                    Posting as <span className="font-semibold text-blue-900">{user?.full_name || user?.email?.split("@")[0]}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCommentText("")}
                      disabled={!commentText.trim() || posting}
                      className={OUTLINE_BUTTON_CLASS}
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={!commentText.trim() || posting || threadLoading}
                      className={`${YELLOW_BUTTON_CLASS} px-5 py-2.5 text-sm disabled:opacity-50`}
                    >
                      <Send className="h-4 w-4" />
                      {posting ? "Posting…" : "Post reply"}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
