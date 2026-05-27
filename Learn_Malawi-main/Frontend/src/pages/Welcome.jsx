import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Trophy, Zap, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/lib/AuthContext';

const features = [
  { icon: BookOpen, label: 'Learning Paths', desc: 'Follow curated paths to master new skills step by step.', color: 'text-cyan-300', bg: 'rgba(0,220,255,0.12)' },
  { icon: Zap, label: 'Earn XP', desc: 'Complete modules and quizzes to level up your profile.', color: 'text-yellow-300', bg: 'rgba(255,220,0,0.12)' },
  { icon: Trophy, label: 'Achievements', desc: 'Unlock badges as you hit milestones on your journey.', color: 'text-violet-300', bg: 'rgba(160,100,255,0.12)' },
];

export default function Welcome() {
  const { user } = useAuth();

  useEffect(() => {

    const end = Date.now() + 2000;
    const colors = ['#00e5cc', '#00cfff', '#a855f7', '#ffffff'];
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || user?.firstName || 'there';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm"
        style={{ backgroundImage: "url('/images/forgot%20password.jpg')" }}
      />
      <div className="absolute inset-0 bg-slate-950/25" />
      <div className="relative w-full max-w-3xl">
        {/* Sparkle icon floating above card */}
        <div className="flex justify-center mb-[-2.5rem] relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="h-24 w-20 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,220,255,0.35) 0%, rgba(130,100,220,0.55) 100%)',
              boxShadow: '0 0 32px 8px rgba(0,200,255,0.35), inset 0 1px 1px rgba(255,255,255,0.3)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <Sparkles className="h-10 w-10 text-white/90" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="rounded-3xl px-8 pt-14 pb-8 min-h-[36rem]"
          style={{
            background: 'rgba(100, 80, 180, 0.25)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.3)',
          }}
        >
          <div className="text-center mb-7">
            <p className="text-cyan-300 text-xs font-semibold uppercase tracking-widest mb-2">Account Created</p>
            <h1 className="text-2xl font-bold text-white mb-3">
              Welcome, {firstName}! 🎉
            </h1>
            <p className="text-white/65 text-sm leading-relaxed">
              You're all set! Your Learn Malawi account is ready. Start exploring paths, earning XP, and unlocking achievements.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-3 mb-7">
            {features.map(({ icon: Icon, label, desc, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3 rounded-2xl px-4 py-3"
                style={{ background: bg, border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="mt-0.5 shrink-0">
                  <Icon className={`h-5 w-5 ${color}`} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{label}</p>
                  <p className="text-white/55 text-xs leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <Link
            to="/learning-paths"
            className="w-full rounded-full py-3.5 text-sm font-bold text-slate-900 transition hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg, #00e5cc, #00cfff)' }}
          >
            Explore Learning Paths
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="mt-5 text-center">
            <Link
              to="/dashboard"
              className="text-sm text-white/50 hover:text-white/80 transition underline underline-offset-2"
            >
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}