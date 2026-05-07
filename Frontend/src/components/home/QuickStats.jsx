import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Target, Star } from "lucide-react";

export default function QuickStats({ progressEntries = [] }) {
  const totalSubjects = new Set(progressEntries.map((entry) => entry?.subject).filter(Boolean)).size;
  const sessionsCompleted = progressEntries.filter((entry) => entry?.completed).length;
  const hoursStudied = progressEntries.reduce((sum, entry) => sum + (entry?.duration || 0), 0);

  const stats = [
    { icon: BookOpen, label: "Books Read", value: `${sessionsCompleted}`, change: `${Math.max(0, sessionsCompleted - 1)} new this month`, iconColor: "text-primary" },
    { icon: Target, label: "Goals Met", value: `${Math.min(10, sessionsCompleted)}/10`, change: `${Math.max(0, 10 - sessionsCompleted)} remaining`, iconColor: "text-primary" },
    { icon: Star, label: "Hours Studied", value: `${hoursStudied}`, change: `${totalSubjects} subjects active`, iconColor: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${s.iconColor}`} />
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.change}</p>
          </motion.div>
        );
      })}
    </div>
  );
}