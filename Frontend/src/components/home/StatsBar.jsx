import { motion } from "framer-motion";

const STATS = [
  { value: "50,000+", label: "Enrolled Students" },
  { value: "500+", label: "Learning Resources" },
  { value: "3", label: "Exam Levels" },
  { value: "100%", label: "Free Forever" },
];

export default function StatsBar() {
  return (
    <section className="bg-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map(({ value, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="text-center"
          >
            <p className="text-3xl md:text-4xl font-heading font-bold text-background">
              {value}
            </p>
            <p className="text-sm text-background/50 mt-1.5 font-medium">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}