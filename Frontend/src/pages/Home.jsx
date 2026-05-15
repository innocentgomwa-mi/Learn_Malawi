import { Link } from "react-router-dom";
import { BookOpen, FileText, Play, Brain, Briefcase, ArrowRight, Users, BookMarked, Award, UserCheck, GraduationCap, Trophy, Star, Flame, MessageCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    path: "/study-notes",
    icon: BookOpen,
    label: "Study Notes",
    desc: "Curriculum-aligned notes for Standard 1–8 and Form 1–4 across all subjects.",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-100",
  },
  {
    path: "/past-papers",
    icon: FileText,
    label: "Past Papers",
    desc: "PSLC, JCE & MSCE past papers with detailed marking schemes.",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-100",
  },
  {
    path: "/tutorials",
    icon: Play,
    label: "Tutorials",
    desc: "Animated lessons, videos & audio summaries for every topic.",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    iconBg: "bg-purple-100",
  },
  {
    path: "/quizzes",
    icon: Brain,
    label: "Quizzes",
    desc: "AI-powered adaptive quizzes that target your knowledge gaps.",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-100",
  },
  {
    path: "/career",
    icon: Briefcase,
    label: "Career Resources",
    desc: "University guides, scholarships & career pathways for Malawian students.",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    iconBg: "bg-rose-100",
  },
];

const stats = [
  { icon: Users, value: "50,000+", label: "Students Served" },
  { icon: BookMarked, value: "500+", label: "Study Resources" },
  { icon: Award, value: "3 Levels", label: "PSLC · JCE · MSCE" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="w-full px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                Free Education for Every Malawian Student
              </span>
              <h1 className="font-poppins text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
                Learn Smarter,<br />
                <span className="text-secondary">Excel Together</span>
              </h1>
              <p className="text-primary-foreground/80 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
                High-quality, curriculum-aligned learning resources for PSLC, JCE, and MSCE students across Malawi. Study notes, past papers, tutorials, and AI-powered quizzes — all free.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/study-notes"
                  className="bg-secondary text-secondary-foreground font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Start Learning <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/quizzes"
                  className="bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 font-semibold px-6 py-3 rounded-xl hover:bg-primary-foreground/20 transition-colors"
                >
                  Take a Quiz
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 60 800 0 600 20C400 40 200 0 0 20L0 60Z" fill="hsl(210 40% 98%)" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full px-4 -mt-2 pb-8">
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center p-4">
              <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-poppins font-bold text-2xl text-foreground">{value}</p>
              <p className="text-muted-foreground text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="font-poppins text-3xl font-bold text-foreground mb-3">Everything You Need to Excel</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            All resources are aligned with the Malawi national curriculum and endorsed by MIE standards.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ path, icon: Icon, label, desc, color, iconBg }, idx) => (
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <Link
                to={path}
                className={`block border rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 ${color}`}
              >
                <div className={`inline-flex p-3 rounded-xl mb-4 ${iconBg}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-poppins font-bold text-lg mb-2">{label}</h3>
                <p className="text-sm leading-relaxed opacity-80">{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-20">
        <div className="w-full px-4">
          <div className="text-center mb-14">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">Simple & Effective</span>
            <h2 className="font-poppins text-3xl md:text-4xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Get started in minutes. No fees, no barriers — just learning.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-border z-0" />
            {[
              { step: "1", icon: UserCheck, title: "Create Your Account", desc: "Sign up for free in seconds. No credit card required, ever.", color: "bg-emerald-100 text-emerald-700" },
              { step: "2", icon: GraduationCap, title: "Choose Your Level", desc: "Select PSLC, JCE, or MSCE and pick your subjects.", color: "bg-blue-100 text-blue-700" },
              { step: "3", icon: BookOpen, title: "Study the Content", desc: "Read notes, watch tutorials, and download past papers.", color: "bg-purple-100 text-purple-700" },
              { step: "4", icon: Trophy, title: "Test & Track Progress", desc: "Take quizzes, earn badges, and watch your streak grow.", color: "bg-amber-100 text-amber-700" },
            ].map(({ step, icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-md ${color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div className="bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center absolute top-0 right-[calc(50%-2.5rem)] -translate-y-2">{step}</div>
                <h3 className="font-poppins font-bold text-foreground text-base mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="w-full px-4 py-20">
        <div className="text-center mb-14">
          <span className="inline-block bg-secondary/20 text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">Built for Malawian Students</span>
          <h2 className="font-poppins text-3xl md:text-4xl font-bold text-foreground mb-3">What We Offer</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Everything in one place — designed around the Malawi national curriculum.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Big feature card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden row-span-2 min-h-[320px] group">
            <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80" alt="Students studying" className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-7 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-secondary fill-secondary" />
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">Featured</span>
              </div>
              <h3 className="font-poppins font-bold text-2xl mb-2">AI-Powered Study Experience</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-4">Our AI tutor is available 24/7 to explain concepts, answer questions, and help you prepare for exams — in plain English or Chichewa.</p>
              <div className="flex flex-wrap gap-2">
                {['Instant Answers', 'Step-by-Step Help', 'All Subjects'].map(tag => (
                  <span key={tag} className="text-xs bg-white/20 backdrop-blur-sm border border-white/30 px-2.5 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Small offer cards */}
          {[
            { icon: Flame, title: "Daily Streaks & Achievements", desc: "Build study habits with daily streaks, earn badges, and celebrate milestones.", color: "from-orange-500 to-amber-400", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80" },
            { icon: Users, title: "Live Study Groups", desc: "Join peer study rooms, chat with classmates, and learn together in real time.", color: "from-blue-600 to-indigo-500", img: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80" },
            { icon: MessageCircle, title: "Parent Progress Portal", desc: "Parents can link their child's account and track streaks, scores & learning paths.", color: "from-emerald-600 to-teal-500", img: "https://images.unsplash.com/photo-1581078426770-6d336e5042ff?w=600&q=80" },
            { icon: Zap, title: "Adaptive Quizzes", desc: "Quizzes that get smarter — AI pinpoints weak topics and targets them for improvement.", color: "from-purple-600 to-pink-500", img: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&q=80" },
          ].map(({ icon: Icon, title, desc, color, img }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative rounded-2xl overflow-hidden h-40 group cursor-default">
              <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-80`} />
              <div className="absolute inset-0 p-5 flex items-end">
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <h3 className="font-poppins font-bold text-sm">{title}</h3>
                  </div>
                  <p className="text-white/80 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial / Trust strip */}
      <section className="bg-muted/40 border-y border-border py-12">
        <div className="w-full px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "100%", label: "Free Forever", sub: "No hidden fees" },
              { value: "PSLC–MSCE", label: "All Levels Covered", sub: "Standard 1 to Form 4" },
              { value: "MIE Aligned", label: "National Curriculum", sub: "Endorsed content" },
              { value: "24 / 7", label: "Always Available", sub: "Learn at your own pace" },
            ].map(({ value, label, sub }) => (
              <div key={label} className="flex flex-col items-center">
                <p className="font-poppins font-bold text-2xl text-primary">{value}</p>
                <p className="font-semibold text-foreground text-sm mt-1">{label}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tutor Banner */}
      <section className="w-full px-4 pb-16">
        <div className="bg-primary rounded-3xl p-8 md:p-12 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-block bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full mb-4">AI-Powered Learning</span>
            <h2 className="font-poppins text-3xl font-bold mb-3">Meet Your AI Study Tutor</h2>
            <p className="text-primary-foreground/80 mb-6">
              Available 24/7, your personal AI tutor can explain any concept, solve problems step-by-step, and give you culturally relevant examples from Malawi. Click the chat button in the corner to get started!
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              {["24/7 Available", "Instant Answers", "Chichewa Context", "All Subjects"].map((b) => (
                <span key={b} className="bg-primary-foreground/10 border border-primary-foreground/20 px-3 py-1.5 rounded-full">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}