import React from "react";
import { motion } from "framer-motion";

const BASE_SUBJECTS = [
  { name: "Maths", hours: 48, emoji: "📐", barColor: "bg-primary" },
  { name: "Physics", hours: 35, emoji: "⚛️", barColor: "bg-primary" },
  { name: "Literature", hours: 28, emoji: "📖", barColor: "bg-primary" },
  { name: "Chemistry", hours: 22, emoji: "🧪", barColor: "bg-primary" },
  { name: "History", hours: 15, emoji: "🏛️", barColor: "bg-primary" },
  { name: "CS", hours: 40, emoji: "💻", barColor: "bg-primary" },
];

export { BASE_SUBJECTS };

/**
 * @param {{ bonusMinutes?: Record<string, number>, progressEntries?: Array<any> }} props
 */
export default function SubjectIslands({ bonusMinutes = /** @type {Record<string, number>} */ ({}), progressEntries = [] }) {
  const activeSubjects = new Set(progressEntries.map((entry) => entry?.subject).filter(Boolean)).size;
  const subjects = BASE_SUBJECTS.map((s) => {
    const extraHours = progressEntries.filter((entry) => entry?.subject === s.name).length * 0.75;
    return {
      ...s,
      hours: +(s.hours + extraHours + (bonusMinutes[s.name] || 0) / 60).toFixed(1),
    };
  });

  const maxHours = Math.max(...subjects.map(s => s.hours));

  return (
    <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Knowledge Map</h2>
      <p className="text-gray-400 text-sm mb-6">Your subject mastery at a glance</p>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {subjects.map((sub, i) => {
          const pct = Math.round((sub.hours / maxHours) * 100);
          const hasBonus = (bonusMinutes[sub.name] || 0) > 0;
          return (
            <motion.div
              key={sub.name}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.06 * i, duration: 0.3 }}
              whileHover={{ y: -3 }}
              className="relative rounded-xl p-3 border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm hover:border-gray-200 cursor-pointer transition-all duration-200"
            >
              {hasBonus && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center"
                >
                  <span className="text-[8px] text-white font-bold">+</span>
                </motion.div>
              )}
              <span className="text-xl">{sub.emoji}</span>
              <div className="mt-2.5">
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    key={sub.hours}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7 }}
                    className={`h-full ${sub.barColor} rounded-full`}
                  />
                </div>
                <p className="text-xs font-semibold text-gray-700 mt-2">{sub.name}</p>
                <p className="text-[10px] text-gray-400 font-medium">{sub.hours}h studied</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}