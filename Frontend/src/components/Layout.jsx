import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  BookOpen, FileText, Play, Brain, Briefcase, Home, Menu, X, GraduationCap, Settings, User, Info
} from "lucide-react";
import AiTutor from "./AiTutor";
import ThemeToggle from "./ThemeToggle";
import GlobalSearch from "./GlobalSearch";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/study-notes", label: "Study Notes", icon: BookOpen },
  { path: "/past-papers", label: "Past Papers", icon: FileText },
  { path: "/tutorials", label: "Tutorials", icon: Play },
  { path: "/abouts", label: "About", icon: Info, guestOnly: true },
  { path: "/quizzes", label: "Quizzes", icon: Brain, authRequired: true },
  { path: "/career", label: "Career Resources", icon: Briefcase, authRequired: true },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const isTeacher = user?.role?.toLowerCase() === 'teacher';

  const closeMenu = () => setMobileOpen(false);
  const hideTopNav = location.pathname.startsWith('/teacher');

  return (
    <div className="min-h-screen flex flex-col">
      {!hideTopNav && (
        <>
          {/* Top Nav */}
          <header className="bg-primary text-primary-foreground sticky top-0 z-40 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-secondary rounded-lg p-1.5">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <span className="font-poppins font-bold text-lg leading-tight block">Learn Malawi</span>
                  <span className="text-xs text-primary-foreground/70 leading-none">Empowering Malawi's Future</span>
                </div>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems
                  .filter((item) => (!item.authRequired || isAuthenticated) && (!item.guestOnly || !isAuthenticated))
                  .map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        location.pathname === path
                          ? "bg-secondary text-secondary-foreground"
                          : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  ))}
              </nav>
              <GlobalSearch />

              {/* Right controls */}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                {isAuthenticated && (
                  <Link to="/dashboard" className={`p-2 rounded-lg hover:bg-primary-foreground/10 text-primary-foreground hidden md:block ${location.pathname === '/dashboard' ? 'bg-secondary text-secondary-foreground' : ''}`} title="My Dashboard">
                    <User className="h-5 w-5" />
                  </Link>
                )}
                {['admin', 'teacher'].includes(user?.role?.toLowerCase() ?? '') && (
                  <Link to="/teacher" className={`p-2 rounded-lg hover:bg-primary-foreground/10 text-primary-foreground hidden md:block ${location.pathname.startsWith('/teacher') ? 'bg-secondary text-secondary-foreground' : ''}`}>
                    <Settings className="h-5 w-5" />
                  </Link>
                )}
                {isAuthenticated ? (
                  <button
                    onClick={async () => {
                      await logout();
                      window.location.assign('/');
                    }}
                    className="hidden md:inline-flex items-center px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/onboarding"
                      className="hidden md:inline-flex items-center px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90"
                    >
                      Register
                    </Link>
                    <Link
                      to="/login"
                      className="hidden md:inline-flex items-center px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90"
                    >
                      Login
                    </Link>
                  </>
                )}
                <button
                  className="md:hidden p-2 rounded-lg hover:bg-primary-foreground/10"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
              <div className="md:hidden border-t border-primary-foreground/20 bg-primary px-4 pb-4">
                {navItems
                  .filter((item) => (!item.authRequired || isAuthenticated) && (!item.guestOnly || !isAuthenticated))
                  .map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mt-1 text-sm font-medium transition-all ${
                        location.pathname === path
                          ? "bg-secondary text-secondary-foreground"
                          : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  ))}
                {!isAuthenticated && (
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      to="/onboarding"
                      onClick={closeMenu}
                      className="block rounded-lg bg-secondary px-3 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
                    >
                      Register
                    </Link>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="block rounded-lg bg-secondary px-3 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
                    >
                      Login
                    </Link>
                  </div>
                )}
              </div>
            )}
          </header>
        </>
      )}

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground/70 py-6 text-center text-sm mt-8">
        <p className="font-medium text-primary-foreground">Learn Malawi</p>
        <p className="mt-1">Empowering Malawi's Future — Learn Free, Excel Together</p>
        <p className="mt-1 text-xs">Aligned with the Malawi National Curriculum & MIE Standards</p>
      </footer>

      {/* AI Tutor floating widget */}
      {!isTeacher && <AiTutor />}
    </div>
  );
}