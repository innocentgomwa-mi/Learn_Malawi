import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

const NAV_LINKS = [
  ["About", "/abouts"],
  ["Study Notes", "/study-notes"],
  ["Past Papers", "/past-papers"],
  ["Tutorials", "/tutorials"],
  ["Quizzes", "/quizzes"],
  ["Career", "/career"],
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      if (!isAuthenticated) {
        alert("Please log in to search resources.");
        navigate("/login");
        return;
      }

      if (searchQuery.trim()) {
        navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
        setSearchQuery("");
      }
    }
  };

  return (
    <>
      {/* Main Nav */}
      <header className="sticky top-0 z-50 bg-blue-950 backdrop-blur-xl border-b border-blue-900/80">
        <div className="w-full px-4 md:px-8 flex items-center justify-between gap-6 h-[5.25rem]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 rounded-2xl border border-yellow-400/50 bg-blue-900/50 px-3 py-1.5 hover:bg-blue-800/60 transition-colors">
            <div className="rounded-xl bg-white/95 p-1 shadow-[0_8px_20px_-10px_rgba(250,204,21,0.8)]">
              <img src="/Logo.png" alt="Learn Malawi logo" className="h-8 w-8 object-contain" />
            </div>
            <span className="hidden sm:block text-sm font-semibold text-blue-100">Learn Malawi</span>
          </Link>

          {/* Desktop Nav - Spread across middle */}
          <nav className="hidden lg:flex items-center flex-1 justify-around px-6">
            {NAV_LINKS.map(([label, path]) => (
              <Link
                key={label}
                to={path}
                className="text-sm text-blue-200 hover:text-white px-2 py-2 rounded-lg hover:bg-blue-900 transition-all duration-200 font-medium whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2.5 bg-blue-900/70 border border-yellow-400/70 rounded-xl px-4 py-2.5 focus-within:border-yellow-300 focus-within:bg-blue-900 transition-all duration-200">
              <Search className="h-4 w-4 text-blue-200 flex-shrink-0" />
              <input
                type="text"
                placeholder="What do you want to learn?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="flex-1 text-sm outline-none bg-transparent text-blue-50 placeholder-blue-300/80"
              />
            </div>

            <Link
              to="/login"
              className="hidden md:block text-sm font-medium text-blue-200 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/onboarding"
              className="bg-yellow-400 text-blue-950 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-yellow-300 transition-all duration-200 shadow-sm"
            >
              Join Free
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-blue-100 hover:bg-blue-900 transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-blue-900 overflow-hidden"
            >
              <nav className="px-4 py-4 space-y-1">
                {NAV_LINKS.map(([label, path]) => (
                  <Link
                    key={label}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm text-blue-200 hover:text-white px-3 py-2.5 rounded-lg hover:bg-blue-900 transition-colors font-medium"
                  >
                    {label}
                  </Link>
                ))}
                <div className="pt-2 flex items-center gap-2 bg-blue-900/70 border border-yellow-400/70 rounded-xl px-4 py-2.5">
                  <Search className="h-4 w-4 text-blue-200 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="What do you want to learn?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="flex-1 text-sm outline-none bg-transparent text-blue-50 placeholder-blue-300/80"
                  />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}