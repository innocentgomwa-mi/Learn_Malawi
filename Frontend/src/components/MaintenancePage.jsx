import { motion } from 'framer-motion';
import { Wrench, Clock, Mail, ArrowRight } from 'lucide-react';

const floatingOrbs = [
  { size: 320, x: '-10%', y: '-15%', color: 'rgba(16,185,129,0.24)', delay: 0 },
  { size: 250, x: '70%', y: '60%', color: 'rgba(34,197,94,0.18)', delay: 1.5 },
  { size: 180, x: '80%', y: '-5%', color: 'rgba(34,211,238,0.14)', delay: 0.8 },
];

export default function MaintenancePage({ message, downtime }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 overflow-hidden relative font-inter"
      style={{ background: 'linear-gradient(135deg, #05160c 0%, #0b2a1b 50%, #112f1f 100%)' }}
    >
      {floatingOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
        />
      ))}

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            className="relative"
          >
            <div
              className="h-24 w-24 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.4), rgba(34,197,94,0.45))',
                boxShadow: '0 0 40px 10px rgba(16,185,129,0.25), inset 0 1px 1px rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <Wrench className="h-11 w-11 text-white" strokeWidth={1.5} />
            </div>
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{ border: '2px solid rgba(16,185,129,0.45)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-3xl px-8 py-10 text-center"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 64px rgba(0,0,0,0.4)',
          }}
        >
          <p className="text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-3">
            Scheduled Maintenance
          </p>
          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
            We'll be back <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}
              className="inline-block"
            >
              shortly
            </span>
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            {message || "We're currently performing scheduled maintenance to improve your experience. Everything will be up and running again very soon."}
          </p>

          <div className="flex flex-col gap-3 mb-8">
            {[
              { icon: Clock, label: 'Estimated downtime', value: downtime || '~2 hours', color: 'text-emerald-300' },
              { icon: Wrench, label: 'Status', value: 'In Progress', color: 'text-lime-300' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${color}`} strokeWidth={1.8} />
                  <span className="text-white/55 text-sm">{label}</span>
                </div>
                <span className={`text-sm font-semibold ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            <motion.span
              className="h-2 w-2 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <span className="text-white/40 text-xs">Live status updates at</span>
            <span className="text-emerald-300 text-xs font-medium">status.learnmalawi.com</span>
          </div>

          <a
            href="mailto:support@learnmalawi.com"
            className="w-full rounded-full py-3.5 text-sm font-bold text-white transition hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg, #16a34a, #4ade80)' }}
          >
            <Mail className="h-4 w-4" />
            Contact Support
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>

        <p className="text-center text-white/25 text-xs mt-6">
          © {new Date().getFullYear()} Learn Malawi. All rights reserved.
        </p>
      </div>
    </div>
  );
}
