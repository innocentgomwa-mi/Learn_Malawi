import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen, FileText, Play, Brain, Briefcase, Home, Menu, X, GraduationCap, Settings, User, UserCheck, Info, Bell, ChevronDown, LogOut
} from "lucide-react";
import AiTutor from "./AiTutor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OfflineBanner from "./OfflineBanner";
import ThemeToggle from "./ThemeToggle";
import GlobalSearch from "./GlobalSearch";
import { useAuth } from "@/lib/AuthContext";
import { useAccessibility } from '@/lib/AccessibilityContext';
import { fetchAnnouncements, fetchChatMessages } from "@/api";
import { getSeenNotificationIds, getLastSeenChatMessageDate } from "@/lib/notificationStorage";

const navItems = [
  { path: "/abouts", label: "About", icon: Info, guestOnly: true },
  { path: "/career", label: "Career Resources", icon: Briefcase, authRequired: true },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');
  const resourcesRef = useRef(null);
  const communityRef = useRef(null);
  const settingsRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useAccessibility();
  const isTeacher = user?.role?.toLowerCase() === 'teacher';
  const userName = user
    ? user.full_name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Account';

  const closeMenu = () => setMobileOpen(false);
  const hideTopNav = location.pathname.startsWith('/teacher');
  const hideFooter = isTeacher && location.pathname.startsWith('/teacher');
  const resourceActive = ['/study-notes', '/past-papers', '/tutorials', '/quizzes', '/learning-paths'].some((path) => location.pathname.startsWith(path));
  const communityActive = ['/achievements', '/study-groups', '/discussions'].some((path) => location.pathname.startsWith(path));
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const isNotificationsPage = location.pathname === '/notifications';
  const isTeacherAnnouncementsPage = location.pathname === '/teacher/announcements';

  useEffect(() => {
    setResourcesOpen(false);
    setCommunityOpen(false);
    setSettingsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!resourcesOpen && !communityOpen && !settingsOpen) return;

    const handleClickAway = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (resourcesOpen && resourcesRef.current && !resourcesRef.current.contains(target)) {
        setResourcesOpen(false);
      }

      if (communityOpen && communityRef.current && !communityRef.current.contains(target)) {
        setCommunityOpen(false);
      }

      if (settingsOpen && settingsRef.current && !settingsRef.current.contains(target)) {
        setSettingsOpen(false);
      }
    };

    window.addEventListener('pointerdown', handleClickAway);
    return () => {
      window.removeEventListener('pointerdown', handleClickAway);
    };
  }, [resourcesOpen, communityOpen]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadNotificationCount(0);
      return;
    }

    if (isNotificationsPage || isTeacherAnnouncementsPage) {
      setUnreadNotificationCount(0);
      return;
    }

    let active = true;
    const loadUnreadCount = async () => {
      try {
        const [announcements, chatMessages] = await Promise.all([
          fetchAnnouncements({ published: true }),
          fetchChatMessages({ room: 'general' }),
        ]);

        if (!active) return;

        const filteredAnnouncements = Array.isArray(announcements)
          ? announcements.filter((announcement) => {
              const audience = (announcement.targetAudience || announcement.target_audience || 'all').toLowerCase();

              if (isTeacher) {
                return audience === 'all' || audience === 'teachers' || announcement.teacherEmail === user?.email;
              }

              return audience === 'all' || audience === 'students';
            })
          : [];

        const seenIds = getSeenNotificationIds(user?.email);
        const unreadAnnouncements = filteredAnnouncements.filter((announcement) => announcement?.id && !seenIds.includes(String(announcement.id))).length;

        const messages = Array.isArray(chatMessages) ? chatMessages : [];
        const lastSeenChatAt = getLastSeenChatMessageDate(user?.email, 'general');
        const unreadChats = messages.filter((message) => {
          if (message.sender_email === user?.email) return false;
          const createdAt = new Date(message.created_date || message.createdAt || message.created_at);
          return !Number.isNaN(createdAt.getTime()) && (!lastSeenChatAt || createdAt > lastSeenChatAt);
        }).length;

        if (active) setUnreadNotificationCount(unreadAnnouncements + unreadChats);
      } catch (error) {
        if (active) setUnreadNotificationCount(0);
      }
    };

    loadUnreadCount();
    return () => { active = false; };
  }, [isAuthenticated, isTeacher, user?.email, isNotificationsPage, isTeacherAnnouncementsPage]);

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
          <header className="relative bg-primary/95 text-primary-foreground sticky top-0 z-40 border-b border-primary-foreground/10 shadow-[0_25px_50px_-25px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="w-full px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 rounded-2xl bg-primary/10 px-4 py-3 transition hover:bg-primary/20">
                <div className="bg-secondary rounded-lg p-1.5">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <span className="font-poppins font-bold text-lg leading-tight block">Learn Malawi</span>
                  <span className="text-xs text-primary-foreground/70 leading-none">Empowering Malawi's Future</span>
                </div>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-2 relative">
                <Link
                  to="/"
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    location.pathname === '/'
                      ? "bg-secondary text-secondary-foreground"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <div className="relative" ref={resourcesRef}>
                  <button
                    type="button"
                    onClick={() => setResourcesOpen((current) => !current)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
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
                    <Link
                      to="/learning-paths"
                      onClick={() => setResourcesOpen(false)}
                      className="block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      Learning Paths
                    </Link>
                  </div>
                </div>
                <div className="relative" ref={communityRef}>
                  <button
                    type="button"
                    onClick={() => setCommunityOpen((current) => !current)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      communityActive
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-primary-foreground/80 hover:bg-primary-foreground/10'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    Community catalog
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div
                    className={`absolute left-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-primary text-foreground shadow-lg transition-all duration-200 ${
                      communityOpen ? 'max-h-60 opacity-100 visible' : 'max-h-0 opacity-0 invisible'
                    }`}
                  >
                  {isAuthenticated && (
                    <Link
                      to="/achievements"
                      onClick={() => setCommunityOpen(false)}
                      className="block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      Achievements
                    </Link>
                  )}
                  <Link
                    to="/study-groups"
                    onClick={() => setCommunityOpen(false)}
                    className="block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Study Groups
                  </Link>
                  {isAuthenticated && (
                    <Link
                      to="/discussions"
                      onClick={() => setCommunityOpen(false)}
                      className="block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      Discussions
                    </Link>
                  )}
                  </div>
                </div>
                {navItems
                  .filter((item) => (!item.authRequired || isAuthenticated) && (!item.guestOnly || !isAuthenticated))
                  .map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
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
              <div className="hidden md:block">
                <GlobalSearch />
              </div>

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
                  <div className="relative" ref={settingsRef}>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen((current) => !current)}
                      className={`px-3 py-2 rounded-lg hover:bg-primary-foreground/10 text-primary-foreground hidden md:inline-flex items-center gap-3 ${
                        settingsOpen ? 'bg-secondary text-secondary-foreground' : ''
                      }`}
                      title="Account"
                    >
                      <Avatar className="h-8 w-8">
                        {user?.profileImageUrl ? (
                          <AvatarImage src={user.profileImageUrl} alt={`${userName} avatar`} />
                        ) : (
                          <AvatarFallback className="bg-primary text-white text-xs font-bold">
                            {userName?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="font-medium truncate max-w-[10rem] text-sm">{userName}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className={`absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-primary text-foreground shadow-lg transition-all duration-200 ${settingsOpen ? 'max-h-80 opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
                      <Link
                        to="/profile"
                        onClick={() => setSettingsOpen(false)}
                        className={`block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/profile' ? 'bg-secondary text-secondary-foreground' : ''}`}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setSettingsOpen(false)}
                        className={`block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/dashboard' ? 'bg-secondary text-secondary-foreground' : ''}`}
                      >
                        My Dashboard
                      </Link>
                      <Link
                        to="/my-schedule"
                        onClick={() => setSettingsOpen(false)}
                        className={`block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/my-schedule' ? 'bg-secondary text-secondary-foreground' : ''}`}
                      >
                        My Schedule
                      </Link>
                      <Link
                        to="/achievements"
                        onClick={() => setSettingsOpen(false)}
                        className={`block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/achievements' ? 'bg-secondary text-secondary-foreground' : ''}`}
                      >
                        Achievements
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setSettingsOpen(false)}
                        className={`block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/settings' ? 'bg-secondary text-secondary-foreground' : ''}`}
                      >
                        Settings
                      </Link>
                      <Link
                        to="/abouts"
                        onClick={() => setSettingsOpen(false)}
                        className={`block px-4 py-3 text-sm text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/abouts' ? 'bg-secondary text-secondary-foreground' : ''}`}
                      >
                        About
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
                        Sign out
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
              <div className="md:hidden absolute right-4 top-full z-40 w-[min(100%-1rem,28rem)] rounded-3xl border border-primary-foreground/20 bg-primary px-4 pb-4 shadow-2xl">
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
                <div className="mt-4 border-t border-primary-foreground/20 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/70 mb-2">Community catalog</p>
                  {isAuthenticated && (
                    <Link
                      to="/achievements"
                      onClick={closeMenu}
                      className={`block rounded-lg px-3 py-3 text-sm font-medium transition-all ${location.pathname === '/achievements' ? 'bg-secondary text-secondary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10'}`}
                    >
                      Achievements
                    </Link>
                  )}
                  <Link
                    to="/study-groups"
                    onClick={closeMenu}
                    className={`mt-1 block rounded-lg px-3 py-3 text-sm font-medium transition-all ${location.pathname === '/study-groups' ? 'bg-secondary text-secondary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10'}`}
                  >
                    Study Groups
                  </Link>
                  {isAuthenticated && (
                    <Link
                      to="/discussions"
                      onClick={closeMenu}
                      className={`mt-1 block rounded-lg px-3 py-3 text-sm font-medium transition-all ${location.pathname === '/discussions' ? 'bg-secondary text-secondary-foreground' : 'text-primary-foreground/80 hover:bg-primary-foreground/10'}`}
                    >
                      Discussions
                    </Link>
                  )}
                </div>
                {isAuthenticated && (
                  <div className="mt-4 border-t border-primary-foreground/20 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/70 mb-2">Settings</p>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className={`block rounded-lg px-3 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/profile' ? 'bg-secondary text-secondary-foreground' : ''}`}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={closeMenu}
                      className={`mt-1 block rounded-lg px-3 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/dashboard' ? 'bg-secondary text-secondary-foreground' : ''}`}
                    >
                      My Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      onClick={closeMenu}
                      className={`mt-1 block rounded-lg px-3 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/settings' ? 'bg-secondary text-secondary-foreground' : ''}`}
                    >
                      Settings
                    </Link>
                    <Link
                      to="/abouts"
                      onClick={closeMenu}
                      className={`mt-1 block rounded-lg px-3 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/abouts' ? 'bg-secondary text-secondary-foreground' : ''}`}
                    >
                      About
                    </Link>
                    <Link
                      to="/my-schedule"
                      onClick={closeMenu}
                      className={`mt-1 block rounded-lg px-3 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/my-schedule' ? 'bg-secondary text-secondary-foreground' : ''}`}
                    >
                      My Schedule
                    </Link>
                    <Link
                      to="/achievements"
                      onClick={closeMenu}
                      className={`mt-1 block rounded-lg px-3 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 ${location.pathname === '/achievements' ? 'bg-secondary text-secondary-foreground' : ''}`}
                    >
                      Achievements
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        closeMenu();
                        await logout();
                        window.location.assign('/');
                      }}
                      className="mt-3 w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
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
          <div className="w-full px-6 py-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
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
                { label: "AI Tutor (24/7)", to: "/" },
                { label: "Terms & Conditions", to: "/terms-and-conditions" },
                { label: "Privacy Policy", to: "/privacy-policy" },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/20">
          <div className="w-full px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
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