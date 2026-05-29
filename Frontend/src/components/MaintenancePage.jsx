import { motion } from "framer-motion";
import { Wrench, Clock, Mail, ArrowRight, GraduationCap } from "lucide-react";
import MaintenanceOrbitingGlobes from "./MaintenanceOrbitingGlobes";

/**
 * @typedef {{
 *   message?: string;
 *   downtime?: string;
 * }} MaintenancePageProps
 */

const floatingOrbs = [
  { size: 320, x: "-10%", y: "-15%", color: "rgba(250,204,21,0.18)", delay: 0 },
  { size: 280, x: "65%", y: "55%", color: "rgba(59,130,246,0.22)", delay: 1.2 },
  { size: 200, x: "75%", y: "-8%", color: "rgba(250,204,21,0.12)", delay: 0.6 },
];

/**
 * @param {MaintenancePageProps} props
 */
export default function MaintenancePage({ message, downtime }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-6 font-inter">
      {floatingOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: "blur(48px)",
          }}
          animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
        />
      ))}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.08),transparent_45%)]" />

      <MaintenanceOrbitingGlobes />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
            <img src="/Logo.png" alt="Learn Malawi" className="h-8 w-8 object-contain" />
            <div className="text-left">
              <p className="font-poppins text-sm font-bold leading-none text-white">Learn Malawi</p>
              <p className="mt-0.5 text-xs text-yellow-300/90">Empower Yourself</p>
            </div>
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="relative"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-yellow-300 bg-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.35)]">
              <Wrench className="h-11 w-11 text-blue-950" strokeWidth={1.5} />
            </div>
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-yellow-400/60"
              animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-3xl border border-blue-400/30 bg-white/10 px-8 py-10 text-center shadow-[0_8px_64px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-yellow-400">
            Scheduled Maintenance
          </p>
          <h1 className="mb-4 font-poppins text-3xl font-bold leading-tight text-white">
            We&apos;ll be back <br />
            <span className="text-yellow-400">shortly</span>
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-blue-100/80">
            {message ||
              "We're currently performing scheduled maintenance to improve your experience. Everything will be up and running again very soon."}
          </p>

          <div className="mb-8 flex flex-col gap-3">
            {[
              { icon: Clock, label: "Estimated downtime", value: downtime || "~2 hours" },
              { icon: GraduationCap, label: "Status", value: "In progress" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl border border-blue-400/25 bg-blue-950/40 px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-yellow-400" strokeWidth={1.8} />
                  <span className="text-sm text-blue-100/70">{label}</span>
                </div>
                <span className="text-sm font-semibold text-yellow-300">{value}</span>
              </div>
            ))}
          </div>

          <div className="mb-8 flex items-center justify-center gap-2">
            <motion.span
              className="h-2 w-2 rounded-full bg-yellow-400"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <span className="text-xs text-blue-200/60">Thank you for your patience</span>
          </div>

          <a
            href="mailto:support@learnmalawi.com"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-300 bg-yellow-400 py-3.5 text-sm font-bold text-blue-950 transition-colors hover:bg-yellow-300"
          >
            <Mail className="h-4 w-4" />
            Contact Support
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>

        <p className="mt-6 text-center text-xs text-blue-200/50">
          © {new Date().getFullYear()} Learn Malawi. All rights reserved.
        </p>
      </div>
    </div>
  );
}
