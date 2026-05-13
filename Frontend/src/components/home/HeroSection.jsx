import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * @param {{ user?: { firstName?: string; lastName?: string; full_name?: string; email?: string } | null }} props
 */
export default function HeroSection({ user }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "Student";
  const firstName = displayName.split(" ")[0] || "Student";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  /**
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate("/study-notes");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 px-6 sm:px-10 py-12 text-slate-950 shadow-lg shadow-amber-300/40">
      {/* Subtle background circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-amber-100/80 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-300/80 blur-3xl" />
        <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-amber-200/70 to-transparent" />
      </div>

      <div className="relative max-w-2xl">
        <p className="text-slate-700 text-sm font-semibold mb-2 tracking-[0.12em] uppercase">
          Welcome back,
        </p>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold mb-4 leading-tight">
          {greeting}, {firstName}
        </h1>
        <p className="text-slate-800 text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
          Find notes, past papers, tutorials and quizzes in one place — built for Malawi students to learn faster and stay on track.
        </p>

        <form className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 max-w-3xl" onSubmit={handleSearch}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search any subject, topic or resource..."
              className="pl-11 pr-4 bg-white/90 border border-white/70 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-amber-400 h-12 shadow-sm"
            />
          </div>
          <Button type="submit" className="shrink-0 bg-slate-950 text-white hover:bg-black font-semibold h-12 px-6">
            Search
          </Button>
        </form>
      </div>
    </div>
  );
}