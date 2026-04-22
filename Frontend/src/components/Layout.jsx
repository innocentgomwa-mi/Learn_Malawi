import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  BookOpen, FileText, Play, Brain, Briefcase, Home, Menu, X, GraduationCap, Settings, User, UserCheck, Info, Bell, ChevronDown, LogOut
} from "lucide-react";
import AiTutor from "./AiTutor";
import OfflineBanner from "./OfflineBanner";
import ThemeToggle from "./ThemeToggle";
import GlobalSearch from "./GlobalSearch";
import { useAuth } from "@/lib/AuthContext";
import { useAccessibility } from '@/lib/AccessibilityContext';
import { fetchAnnouncements } from "@/api";
import { getSeenNotificationIds } from "@/lib/notificationStorage";

const navItems = [
  { path: "/abouts", label: "About", icon: Info, guestOnly: true },
  { path: "/career", label: "Career Resources", icon: Briefcase, authRequired: true },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useAccessibility();
  const isTeacher = user?.role?.toLowerCase() === 'teacher';

  const closeMenu = () => setMobileOpen(false);
  const hideTopNav = location.pathname.startsWith('/teacher');
  const hideFooter = isTeacher && location.pathname.startsWith('/teacher');
  const resourceActive = ['/study-notes', '/past-papers', '/tutorials', '/quizzes'].some((path) => location.pathname.startsWith(path));
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const isNotificationsPage = location.pathname === '/notifications';

  useEffect(() => {
    setResourcesOpen(false);
    setSettingsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadNotificationCount(0);
      return;
    }

    if (isNotificationsPage) {
      setUnreadNotificationCount(0);
      return;
    }

    let active = true;
    const loadUnreadCount = async () => {
      try {
        const announcements = await fetchAnnouncements({ published: true });
        if (!active || !Array.isArray(announcements)) return;

        const filtered = announcements.filter((announcement) => {
          const audience = (announcement.targetAudience || announcement.target_audience || 'all').toLowerCase();

          if (isTeacher) {
            return audience === 'all' || audience === 'teachers' || announcement.teacherEmail === user?.email;
          }

          return audience === 'all' || audience === 'students';
        });

        const seenIds = getSeenNotificationIds(user?.email);
        const unread = filtered.filter((announcement) => !seenIds.includes(String(announcement.id))).length;
        if (active) setUnreadNotificationCount(unread);
      } catch (error) {
        if (active) setUnreadNotificationCount(0);
      }
    };

    loadUnreadCount();
    return () => { active = false; };
  }, [isAuthenticated, isTeacher, user?.email, isNotificationsPage]);

  useEffect(() => {
    if (typeof window === 'undefined' || !settings?.screenReader || !('speechSynthesis' in window)) return;

    const speak = (message) => {
      if (!message) return;
      setScreenReaderAnnouncement(message);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    };

    const announcePage = () => {
      const pageTitle = document.title || location.pathname.replace('/', '') || 'Home';
      const heading = document.querySelector('main h1')?.textContent?.trim() || document.querySelector('h1')?.textContent?.trim() || '';
      const description = document.querySelector('main p')?.textContent?.trim() || '';
      const intro = heading ? `Navigated to ${heading}` : `Navigated to ${pageTitle}`;
      speak([intro, description].filter(Boolean).join('. '));
    };

    const handleFocus = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const ariaLabel = target.getAttribute('aria-label') || '';
      const labelledById = target.getAttribute('aria-labelledby');
      const labelledByText = labelledById ? document.getElementById(labelledById)?.textContent?.trim() : '';
      const textContent = target.textContent?.trim() || '';
      const titleText = target.getAttribute('title') || '';
      const role = target.getAttribute('role') || target.tagName.toLowerCase();
      const message = [ariaLabel, labelledByText, textContent, titleText]
        .filter((text) => text && text.length > 0)
        .join(', ');
      if (!message) return;
      speak(`${message}. ${role}`);
    };

    announcePage();
    window.addEventListener('focusin', handleFocus);
    return () => {
      window.speechSynthesis.cancel();
      window.removeEventListener('focusin', handleFocus);
    };
  }, [settings?.screenReader, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <div aria-live="polite" className="sr-only">{screenReaderAnnouncement}</div>
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
                <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-primary-foreground/10 text-primary-foreground hidden md:block" title="Notifications">
                  <Bell className="h-5 w-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-card" />
                  )}
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
                        to="/achievements"
                        onClick={() => setSettingsOpen(false)}
                        className={`block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/achievements' ? 'bg-secondary text-secondary-foreground' : ''}`}
                      >
                        Achievements
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
                      to="/achievements"
                      onClick={closeMenu}
                      className={`mt-1 block rounded-lg px-3 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/achievements' ? 'bg-secondary text-secondary-foreground' : ''}`}
                    >
                      Achievements
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
      {!hideFooter && (
        <footer role="contentinfo" className="bg-primary text-primary-foreground mt-8">
          {/* Main footer links */}
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Column 1 */}
          <div>
            <h4 className="font-poppins font-bold text-sm uppercase tracking-wider text-primary-foreground mb-4 border-b border-primary-foreground/20 pb-2">Study Resources</h4>
            <ul className="space-y-2">
              {[
                { label: "Study Notes", to: "/study-notes" },
                { label: "Past Papers", to: "/past-papers" },
                { label: "Tutorials", to: "/tutorials" },
                { label: "Flashcards", to: "/flashcards" },
                { label: "Quizzes", to: "/quizzes" },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          {/* Column 2 */}
          <div>
            <h4 className="font-poppins font-bold text-sm uppercase tracking-wider text-primary-foreground mb-4 border-b border-primary-foreground/20 pb-2">Exam Levels</h4>
            <ul className="space-y-2">
              {["PSLC (Standard 1–8)", "JCE (Form 1–2)", "MSCE (Form 3–4)", "All Subjects", "Learning Paths"].map((item) => (
                <li key={item}><span className="text-sm text-primary-foreground/70">{item}</span></li>
              ))}
            </ul>
          </div>
          {/* Column 3 */}
          <div>
            <h4 className="font-poppins font-bold text-sm uppercase tracking-wider text-primary-foreground mb-4 border-b border-primary-foreground/20 pb-2">Community</h4>
            <ul className="space-y-2">
              {[
                { label: "Study Groups", to: "/study-groups" },
                { label: "Achievements", to: "/achievements" },
                { label: "Leaderboard", to: "/quizzes" },
                { label: "Parent Portal", to: "/parent-portal" },
                { label: "Teacher Dashboard", to: "/teacher" },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          {/* Column 4 */}
          <div>
            <h4 className="font-poppins font-bold text-sm uppercase tracking-wider text-primary-foreground mb-4 border-b border-primary-foreground/20 pb-2">Career</h4>
            <ul className="space-y-2">
              {[
                { label: "Career Resources", to: "/career" },
                { label: "University Guides", to: "/career" },
                { label: "Scholarships", to: "/career" },
                { label: "Bursaries", to: "/career" },
                { label: "Career Paths", to: "/career" },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          {/* Column 5 */}
          <div>
            <h4 className="font-poppins font-bold text-sm uppercase tracking-wider text-primary-foreground mb-4 border-b border-primary-foreground/20 pb-2">Platform</h4>
            <ul className="space-y-2">
              {[
                { label: "Dashboard", to: "/dashboard" },
                { label: "AI Tutor (24/7)", to: "/" },
                { label: "Accessibility", to: "/accessibility" },
                { label: "Onboarding", to: "/onboarding" },
                { label: "Admin Panel", to: "/admin" },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/20">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo + tagline */}
            <div className="flex items-center gap-3">
              <div className="bg-secondary rounded-lg p-1.5">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-poppins font-bold text-primary-foreground text-sm leading-none">Learn Malawi</p>
                <p className="text-primary-foreground/60 text-xs mt-0.5">Empower Yourself</p>
              </div>
            </div>

            {/* Center links */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-primary-foreground/60">
              <span>© Learn Malawi {new Date().getFullYear()}</span>
              <Link to="/accessibility" className="hover:text-primary-foreground transition-colors">Accessibility</Link>
              <span className="hover:text-primary-foreground transition-colors cursor-default">Privacy</span>
              <span className="hover:text-primary-foreground transition-colors cursor-default">Terms</span>
              <span className="text-primary-foreground/40">Aligned with MIE &amp; Malawi National Curriculum</span>
            </div>

            {/* Right: Free badge */}
            <div className="flex items-center gap-2 bg-secondary/20 border border-secondary/40 px-3 py-1.5 rounded-full">
              <span className="text-xs font-bold text-secondary">100% FREE</span>
              <span className="text-xs text-primary-foreground/60">· No hidden fees · Ever</span>
            </div>
          </div>
        </div>
      </footer>
      )}

      <OfflineBanner />

      {/* AI Tutor floating widget */}
      {!isTeacher && <AiTutor />}
    </div>
  );
}