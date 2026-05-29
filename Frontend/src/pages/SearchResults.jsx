import { useEffect, useMemo, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchStudyNotes, fetchPastPapers, fetchTutorials, fetchQuizzes, logActivity, logSearch } from "@/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RequireAccount from "@/components/RequireAccount";
import { useAuth } from "@/lib/AuthContext";
import { Search } from "lucide-react";

export default function SearchResults() {
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';
  const [searchValue, setSearchValue] = useState(query);
  const [loggedSearchQuery, setLoggedSearchQuery] = useState('');

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  const searchResultsQuery = useQuery({
    queryKey: ['searchResults', query],
    queryFn: async () => {
      if (!query) {
        return {
          studyNotes: [],
          pastPapers: [],
          tutorials: [],
          quizzes: [],
        };
      }

      const [studyNotes, pastPapers, tutorials, quizzes] = await Promise.all([
        fetchStudyNotes({ search: query }),
        fetchPastPapers({ search: query }),
        fetchTutorials({ search: query }),
        fetchQuizzes({ search: query }),
      ]);

      return {
        studyNotes,
        pastPapers,
        tutorials,
        quizzes,
      };
    },
    enabled: Boolean(query),
  });

  const navigate = useNavigate();
  const results = searchResultsQuery.data;
  const totalResults = useMemo(() => {
    if (!results) return 0;
    return (
      (results.studyNotes?.length || 0) +
      (results.pastPapers?.length || 0) +
      (results.tutorials?.length || 0) +
      (results.quizzes?.length || 0)
    );
  }, [results]);

  const handleResourceClick = (type, item) => {
    if (!item) return;
    switch (type) {
      case 'studyNotes':
        if (item.id) {
          navigate(`/study-notes?selected_id=${encodeURIComponent(item.id)}`);
        } else {
          navigate('/study-notes');
        }
        break;
      case 'tutorials':
        if (item.id) {
          navigate(`/tutorials?selected_id=${encodeURIComponent(item.id)}`);
        } else {
          navigate('/tutorials');
        }
        break;
      case 'quizzes':
        if (item.id) {
          navigate(`/quizzes?selected_id=${encodeURIComponent(item.id)}`);
        } else {
          navigate('/quizzes');
        }
        break;
      case 'pastPapers': {
        const paperUrl = item.paperUrl || item.paper_url || item.url || item.paper_url || item.pdfUrl || item.pdf_url;
        if (paperUrl) {
          window.open(paperUrl, '_blank', 'noreferrer');
        } else if (item.id) {
          navigate(`/past-papers?selected_id=${encodeURIComponent(item.id)}`);
        } else {
          navigate('/past-papers');
        }
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    if (!query || searchResultsQuery.isLoading || !results) return;
    if (query === loggedSearchQuery) return;

    setLoggedSearchQuery(query);
    const normalizedRole = user?.role ? String(user.role).toLowerCase() : 'student';
    logSearch({
      query,
      user_email: user?.email || 'anonymous',
      user_name: user?.full_name || '',
      user_role: normalizedRole,
      results_count: totalResults,
    }).catch(() => {});
  }, [query, results, totalResults, loggedSearchQuery, searchResultsQuery.isLoading, user?.email, user?.full_name, user?.role]);

  if (!isAuthenticated) {
    return <RequireAccount resourceName="Search" />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
      logActivity({
        action: "resource_searched",
        user_email: user?.email || "anonymous",
        user_name: user?.full_name || "",
        user_role: user?.role || "student",
        resource_title: "Search Results",
        subject: trimmed,
        metadata: JSON.stringify({ query: trimmed }),
      }).catch(() => {});
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Search across your learning resources</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Find study notes, past papers, tutorials, and quizzes from a single search.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search all resources..."
            className="pl-10"
          />
        </div>
        <Button type="submit" className="h-12 w-full sm:w-auto">
          Search
        </Button>
      </form>

      {!query ? (
        <div className="mt-12 rounded-3xl border border-border bg-muted p-8 text-center">
          <p className="text-lg font-medium">Type a keyword to search across notes, past papers, tutorials, and quizzes.</p>
          <p className="mt-2 text-sm text-muted-foreground">The search results will appear here once you submit a query.</p>
        </div>
      ) : searchResultsQuery.isLoading ? (
        <div className="mt-12 rounded-3xl border border-border bg-muted p-8 text-center">
          <p className="text-lg font-medium">Searching for “{query}” …</p>
        </div>
      ) : (
        <div className="mt-10 space-y-8">
          <div className="rounded-3xl border border-border bg-background p-6">
            <p className="text-sm text-muted-foreground">Search term</p>
            <h2 className="mt-3 text-2xl font-semibold">{query}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{totalResults} result{totalResults === 1 ? '' : 's'} found across all resources.</p>
          </div>

          {totalResults === 0 ? (
            <div className="rounded-3xl border border-border bg-muted p-8 text-center">
              <p className="text-lg font-medium">No matches found for “{query}”.</p>
              <p className="mt-2 text-sm text-muted-foreground">Try a different subject, keyword, or resource name.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {results.studyNotes?.length > 0 && (
                <section className="space-y-4 rounded-3xl border border-border bg-background p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">Study Notes</h3>
                      <p className="text-sm text-muted-foreground">{results.studyNotes.length} matching notes</p>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {results.studyNotes.slice(0, 4).map((note) => (
                      <button
                        key={note.id || note.title}
                        type="button"
                        onClick={() => handleResourceClick('studyNotes', note)}
                        className="text-left rounded-2xl border border-border p-4 hover:bg-muted transition-colors"
                      >
                        <p className="font-medium">{note.title || note.subject || 'Untitled note'}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{note.subject || 'No subject'}</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {results.pastPapers?.length > 0 && (
                <section className="space-y-4 rounded-3xl border border-border bg-background p-6">
                  <div>
                    <h3 className="text-xl font-semibold">Past Papers</h3>
                    <p className="text-sm text-muted-foreground">{results.pastPapers.length} matching papers</p>
                  </div>
                  <div className="grid gap-3">
                    {results.pastPapers.slice(0, 4).map((paper) => (
                      <button
                        key={paper.id || paper.title}
                        type="button"
                        onClick={() => handleResourceClick('pastPapers', paper)}
                        className="text-left rounded-2xl border border-border p-4 hover:bg-muted transition-colors"
                      >
                        <p className="font-medium">{paper.title || paper.subject || 'Untitled paper'}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{paper.subject || 'No subject'}</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {results.tutorials?.length > 0 && (
                <section className="space-y-4 rounded-3xl border border-border bg-background p-6">
                  <div>
                    <h3 className="text-xl font-semibold">Tutorials</h3>
                    <p className="text-sm text-muted-foreground">{results.tutorials.length} matching tutorials</p>
                  </div>
                  <div className="grid gap-3">
                    {results.tutorials.slice(0, 4).map((tutorial) => (
                      <button
                        key={tutorial.id || tutorial.title}
                        type="button"
                        onClick={() => handleResourceClick('tutorials', tutorial)}
                        className="text-left rounded-2xl border border-border p-4 hover:bg-muted transition-colors"
                      >
                        <p className="font-medium">{tutorial.title || tutorial.subject || 'Untitled tutorial'}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{tutorial.subject || 'No subject'}</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {results.quizzes?.length > 0 && (
                <section className="space-y-4 rounded-3xl border border-border bg-background p-6">
                  <div>
                    <h3 className="text-xl font-semibold">Quizzes</h3>
                    <p className="text-sm text-muted-foreground">{results.quizzes.length} matching quizzes</p>
                  </div>
                  <div className="grid gap-3">
                    {results.quizzes.slice(0, 4).map((quiz) => (
                      <button
                        key={quiz.id || quiz.title}
                        type="button"
                        onClick={() => handleResourceClick('quizzes', quiz)}
                        className="text-left rounded-2xl border border-border p-4 hover:bg-muted transition-colors"
                      >
                        <p className="font-medium">{quiz.title || quiz.subject || 'Untitled quiz'}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{quiz.subject || 'No subject'}</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
