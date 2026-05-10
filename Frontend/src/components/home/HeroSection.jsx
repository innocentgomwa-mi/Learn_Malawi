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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-accent px-6 sm:px-10 py-10 text-white">
      {/* Subtle background circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
      </div>

      <div className="relative max-w-2xl">
        <p className="text-white/60 text-sm font-medium mb-1">{greeting}</p>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">{firstName} !</h1>
        <p className="text-white/70 text-sm sm:text-base mb-7">
          Ready to learn? Search for notes, past papers, tutorials and more.
        </p>

        <form className="flex gap-2 max-w-lg" onSubmit={handleSearch}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search any subject, topic or resource..."
              className="pl-9 bg-white/15 border-white/25 placeholder:text-white/50 text-white focus:bg-white/20 focus:border-white/50 h-10"
            />
          </div>
          <Button type="submit" className="shrink-0 bg-white text-primary hover:bg-white/90 font-semibold h-10 px-5">
            Search
          </Button>
        </form>
      </div>
    </div>
  );
}