import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  BookOpen, FileText, Play, Brain, Briefcase, Home, Menu, X, GraduationCap, Settings, User, UserCheck, Info, Bell, ChevronDown, LogOut
} from "lucide-react";
import AiTutor from "./AiTutor";
import ThemeToggle from "./ThemeToggle";
import GlobalSearch from "./GlobalSearch";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { path: "/abouts", label: "About", icon: Info, guestOnly: true },
  { path: "/career", label: "Career Resources", icon: Briefcase, authRequired: true },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const isTeacher = user?.role?.toLowerCase() === 'teacher';

  const closeMenu = () => setMobileOpen(false);
  const hideTopNav = location.pathname.startsWith('/teacher');
  const resourceActive = ['/study-notes', '/past-papers', '/tutorials', '/quizzes'].some((path) => location.pathname.startsWith(path));

  useEffect(() => {
    setResourcesOpen(false);
    setSettingsOpen(false);
  }, [location.pathname]);

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
              <nav className="hidden md:flex items-center gap-1 relative">
                <Link
                  to="/"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === '/'
                      ? "bg-secondary text-secondary-foreground"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setResourcesOpen((current) => !current)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      resourceActive
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-primary-foreground/80 hover:bg-primary-foreground/10'
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    Resource catalog
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div
                    className={`absolute left-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-primary text-foreground shadow-lg transition-all duration-200 ${
                      resourcesOpen ? 'max-h-60 opacity-100 visible' : 'max-h-0 opacity-0 invisible'
                    }`}
                  >
                    <Link
                      to="/study-notes"
                      onClick={() => setResourcesOpen(false)}
                      className="block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      Study Notes
                    </Link>
                    <Link
                      to="/past-papers"
                      onClick={() => setResourcesOpen(false)}
                      className="block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      Past Papers
                    </Link>
                    <Link
                      to="/tutorials"
                      onClick={() => setResourcesOpen(false)}
                      className="block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      Tutorials
                    </Link>
                    <Link
                      to="/quizzes"
                      onClick={() => setResourcesOpen(false)}
                      className="block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      Quizzes
                    </Link>
                  </div>
                </div>
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
                <Link to="/notifications" className="p-2 rounded-lg hover:bg-primary-foreground/10 text-primary-foreground hidden md:block" title="Notifications">
                  <Bell className="h-5 w-5" />
                </Link>
                <ThemeToggle />
                {isAuthenticated && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSettingsOpen((current) => !current)}
                      className={`p-2 rounded-lg hover:bg-primary-foreground/10 text-primary-foreground hidden md:inline-flex items-center ${
                        settingsOpen ? 'bg-secondary text-secondary-foreground' : ''
                      }`}
                      title="Settings"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                    <div className={`absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-primary text-foreground shadow-lg transition-all duration-200 ${settingsOpen ? 'max-h-80 opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
                      <Link
                        to="/profile"
                        onClick={() => setSettingsOpen(false)}
                        className={`block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/profile' ? 'bg-secondary text-secondary-foreground' : ''}`}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setSettingsOpen(false)}
                        className={`block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/dashboard' ? 'bg-secondary text-secondary-foreground' : ''}`}
                      >
                        My Dashboard
                      </Link>
                      <Link
                        to="/accessibility"
                        onClick={() => setSettingsOpen(false)}
                        className={`block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/accessibility' ? 'bg-secondary text-secondary-foreground' : ''}`}
                      >
                        Accessibility
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          setSettingsOpen(false);
                          await logout();
                          window.location.assign('/');
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
                {['admin', 'teacher'].includes(user?.role?.toLowerCase() ?? '') && (
                  <Link to="/teacher" className={`p-2 rounded-lg hover:bg-primary-foreground/10 text-primary-foreground hidden md:block ${location.pathname.startsWith('/teacher') ? 'bg-secondary text-secondary-foreground' : ''}`}>
                    <Settings className="h-5 w-5" />
                  </Link>
                )}
                {!isAuthenticated && (
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
                <div className="mt-4 border-t border-primary-foreground/20 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/70 mb-2">Resource catalog</p>
                  <Link
                    to="/study-notes"
                    onClick={closeMenu}
                    className={`block rounded-lg px-3 py-3 text-sm font-medium transition-all ${location.pathname === '/study-notes' ? 'bg-secondary text-secondary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10'}`}
                  >
                    Study Notes
                  </Link>
                  <Link
                    to="/past-papers"
                    onClick={closeMenu}
                    className={`mt-1 block rounded-lg px-3 py-3 text-sm font-medium transition-all ${location.pathname === '/past-papers' ? 'bg-secondary text-secondary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10'}`}
                  >
                    Past Papers
                  </Link>
                  <Link
                    to="/tutorials"
                    onClick={closeMenu}
                    className={`mt-1 block rounded-lg px-3 py-3 text-sm font-medium transition-all ${location.pathname === '/tutorials' ? 'bg-secondary text-secondary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10'}`}
                  >
                    Tutorials
                  </Link>
                  <Link
                    to="/quizzes"
                    onClick={closeMenu}
                    className={`mt-1 block rounded-lg px-3 py-3 text-sm font-medium transition-all ${location.pathname === '/quizzes' ? 'bg-secondary text-secondary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10'}`}
                  >
                    Quizzes
                  </Link>
                </div>
                {isAuthenticated && (
                  <div className="mt-4 border-t border-primary-foreground/20 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/70 mb-2">Settings</p>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className={`block rounded-lg px-3 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/profile' ? 'bg-secondary text-secondary-foreground' : ''}`}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={closeMenu}
                      className={`mt-1 block rounded-lg px-3 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/dashboard' ? 'bg-secondary text-secondary-foreground' : ''}`}
                    >
                      My Dashboard
                    </Link>
                    <Link
                      to="/accessibility"
                      onClick={closeMenu}
                      className={`mt-1 block rounded-lg px-3 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/accessibility' ? 'bg-secondary text-secondary-foreground' : ''}`}
                    >
                      Accessibility
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        closeMenu();
                        await logout();
                        window.location.assign('/');
                      }}
                      className="mt-1 w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      Logout
                    </button>
                  </div>
                )}
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