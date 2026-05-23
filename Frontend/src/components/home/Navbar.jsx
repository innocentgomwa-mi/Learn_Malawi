import { Link } from "react-router-dom";
import { BookOpen, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  ["Study Notes", "/study-notes"],
  ["Past Papers", "/past-papers"],
  ["Tutorials", "/tutorials"],
  ["Quizzes", "/quizzes"],
  ["Career", "/career"],
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Main Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-6 h-[4.5rem]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground tracking-tight">
              MalawiLearn
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {NAV_LINKS.map(([label, path]) => (
              <Link
                key={label}
                to={path}
                className="text-sm text-muted-foreground hover:text-foreground px-3.5 py-2 rounded-lg hover:bg-secondary transition-all duration-200 font-medium"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:flex items-center gap-2.5 bg-secondary/60 border border-border rounded-xl px-4 py-2.5 focus-within:border-primary/40 focus-within:bg-background transition-all duration-200">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="What do you want to learn?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-foreground placeholder-muted-foreground"
            />
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/login"
              className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm"
            >
              Join Free
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
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
              className="lg:hidden border-t border-border overflow-hidden"
            >
              <nav className="px-4 py-4 space-y-1">
                {NAV_LINKS.map(([label, path]) => (
                  <Link
                    key={label}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm text-muted-foreground hover:text-foreground px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors font-medium"
                  >
                    {label}
                  </Link>
                ))}
                <div className="pt-2 flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-4 py-2.5">
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="What do you want to learn?"
                    className="flex-1 text-sm outline-none bg-transparent text-foreground placeholder-muted-foreground"
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