import { motion } from "framer-motion";

const STATS = [
  { value: "50,000+", label: "Enrolled Students" },
  { value: "500+", label: "Learning Resources" },
  { value: "3", label: "Exam Levels" },
  { value: "100%", label: "Free Forever" },
];

export default function StatsBar() {
  return (
    <section className="bg-blue-950 rounded-2xl mx-4 md:mx-8 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-wrap justify-between gap-4 md:gap-6">
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex items-center gap-3 px-6 py-3.5 rounded-full border border-blue-800 bg-blue-900/70"
            >
              <span className="text-2xl md:text-3xl font-bold text-amber-400 font-heading leading-none">
                {value}
              </span>
              <span className="text-sm text-gray-400 font-medium">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}