import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Trophy,
  Zap,
  ArrowRight,
  Home,
  LayoutDashboard,
  GraduationCap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/lib/AuthContext";
import { YELLOW_BUTTON_CLASS } from "@/lib/resourcePageStyles";

const studentFeatures = [
  {
    icon: BookOpen,
    label: "Study resources",
    desc: "Notes, past papers, tutorials, and quizzes for your level.",
    card: "bg-white border-blue-200",
    iconBox: "bg-blue-100 text-blue-800",
  },
  {
    icon: Zap,
    label: "Track progress",
    desc: "Complete lessons and earn achievements as you learn.",
    card: "bg-yellow-50 border-yellow-200",
    iconBox: "bg-yellow-400 text-blue-950",
  },
  {
    icon: Trophy,
    label: "Community",
    desc: "Study groups, discussions, and career guidance.",
    card: "bg-white border-blue-200",
    iconBox: "bg-blue-900 text-yellow-300",
  },
];

const teacherFeatures = [
  {
    icon: LayoutDashboard,
    label: "Teacher dashboard",
    desc: "Manage students, content, quizzes, and analytics.",
    card: "bg-white border-blue-200",
    iconBox: "bg-blue-100 text-blue-800",
  },
  {
    icon: GraduationCap,
    label: "Create & share",
    desc: "Upload materials and learning paths for your class.",
    card: "bg-yellow-50 border-yellow-200",
    iconBox: "bg-yellow-400 text-blue-950",
  },
  {
    icon: Trophy,
    label: "Engage learners",
    desc: "Discussions, announcements, and participation tracking.",
    card: "bg-white border-blue-200",
    iconBox: "bg-blue-900 text-yellow-300",
  },
];

function isTeacherRole(role) {
  const normalized = String(role || "").toLowerCase();
  return normalized === "teacher" || normalized === "admin";
}

const glassCardStyle = {
  background: "rgba(15, 23, 42, 0.55)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "2px solid rgba(250, 204, 21, 0.45)",
  boxShadow: "0 8px 48px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(30, 58, 138, 0.4)",
};

const iconBadgeStyle = {
  background: "linear-gradient(135deg, rgba(250,204,21,0.95) 0%, rgba(245,158,11,0.9) 100%)",
  boxShadow: "0 0 32px 8px rgba(250,204,21,0.4), inset 0 1px 1px rgba(255,255,255,0.35)",
  border: "2px solid rgba(30, 58, 138, 0.25)",
};

export default function Welcome() {
  const { user } = useAuth();

  const teacher = isTeacherRole(user?.role);
  const features = teacher ? teacherFeatures : studentFeatures;

  const firstName =
    user?.firstName || user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const primaryCta = useMemo(
    () =>
      teacher
        ? { to: "/teacher", label: "Go to Teacher Dashboard", Icon: LayoutDashboard }
        : { to: "/", label: "Go to Home", Icon: Home },
    [teacher],
  );
  const PrimaryIcon = primaryCta.Icon;

  useEffect(() => {
    const end = Date.now() + 2200;
    const colors = ["#facc15", "#fde047", "#1d4ed8", "#3b82f6", "#ffffff"];
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6 font-inter">
      {/* Background — same family as login / register */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm"
        style={{ backgroundImage: "url('/images/forgot%20password.jpg')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/85 via-blue-900/75 to-blue-800/80" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(250,204,21,0.18),transparent_42%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(59,130,246,0.25),transparent_45%)]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Floating yellow badge */}
        <div className="relative z-20 mb-[-2.5rem] flex justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -14 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="flex h-24 w-20 items-center justify-center rounded-3xl"
            style={iconBadgeStyle}
          >
            <Sparkles className="h-10 w-10 text-blue-950" strokeWidth={1.5} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="overflow-hidden rounded-3xl pt-14"
          style={glassCardStyle}
        >
          <div className="px-6 pb-6">
            <div className="mb-6 flex flex-col items-center gap-2 pt-2 text-center">
              <div className="rounded-xl bg-white p-2 shadow-md">
                <img src="/Logo.png" alt="Learn Malawi" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <p className="font-poppins text-sm font-bold text-white">Learn Malawi</p>
                <p className="text-xs font-medium text-yellow-300">Empower Yourself</p>
              </div>
            </div>

            <div className="mb-6 text-center">
              <span className="inline-flex rounded-full border border-yellow-400/60 bg-yellow-400/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-yellow-300">
                Account created
              </span>
              <h1 className="mt-3 font-poppins text-2xl font-bold text-white md:text-3xl">
                Welcome, {firstName}!
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-blue-100/90">
                {teacher
                  ? "Your teacher account is ready. Open your dashboard to manage classes and resources."
                  : "Your student account is ready. Explore free resources built for Malawian learners."}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-800/50 px-3 py-1 text-xs font-semibold text-blue-100">
                {teacher ? (
                  <>
                    <GraduationCap className="h-3.5 w-3.5 text-yellow-400" />
                    Teacher
                  </>
                ) : (
                  <>
                    <BookOpen className="h-3.5 w-3.5 text-yellow-400" />
                    Student
                  </>
                )}
              </span>
            </div>

            <div className="mb-6 space-y-2.5">
              {features.map(({ icon: Icon, label, desc, card, iconBox }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 + i * 0.07 }}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 ${card}`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBox}`}>
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-blue-950">{label}</p>
                    <p className="text-xs leading-relaxed text-blue-900/70">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link to={primaryCta.to} className={`${YELLOW_BUTTON_CLASS} w-full py-3.5 text-sm shadow-md`}>
              <PrimaryIcon className="h-4 w-4" />
              {primaryCta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {!teacher && (
                <Link
                  to="/learning-paths"
                  className="rounded-xl border border-blue-300/50 bg-blue-900/40 px-4 py-2 text-xs font-semibold text-blue-100 transition-colors hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-200"
                >
                  Learning paths
                </Link>
              )}
              <Link
                to="/profile"
                className="rounded-xl border border-blue-300/50 bg-blue-900/40 px-4 py-2 text-xs font-semibold text-blue-100 transition-colors hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-200"
              >
                Complete profile
              </Link>
            </div>
          </div>
        </motion.div>

        <p className="mt-5 text-center text-xs font-medium text-yellow-200/70">
          © {new Date().getFullYear()} Learn Malawi · Blue &amp; gold for every learner
        </p>
      </div>
    </div>
  );
}
