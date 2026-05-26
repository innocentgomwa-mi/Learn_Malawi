import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchQuizzes } from "@/api";
import { HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Quizzes() {
  const [search, setSearch] = useState("");
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: fetchQuizzes,
  });
  const filtered = quizzes.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.subject?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Quizzes</h1>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search quizzes..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">No quizzes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(quiz => (
            <div key={quiz.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg">{quiz.title}</h3>
                {quiz.level && <Badge variant="secondary">{quiz.level}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{quiz.subject}</p>
              {quiz.description && <p className="text-sm line-clamp-2">{quiz.description}</p>}
              <p className="text-xs text-muted-foreground">{quiz.questions?.length ?? 0} questions</p>
              <Button size="sm" className="self-start mt-1">Start Quiz</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
