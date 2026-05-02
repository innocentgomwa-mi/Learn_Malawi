import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

const suggestions = ["Quantum Mechanics", "World History", "Calculus II", "Literary Analysis"];

export default function SearchMonolith() {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      className="fixed bottom-4 md:bottom-6 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none"
    >
      <motion.div
        animate={focused ? { scale: 1.01, y: -2 } : { scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl pointer-events-auto"
      >
        <div className={`flex items-center gap-3 bg-white rounded-2xl px-4 md:px-5 py-3 md:py-3.5
                         shadow-lg border transition-all duration-300
                         ${focused ? "border-primary/40 shadow-xl" : "border-gray-200"}`}>
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search books or subjects..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 flex-shrink-0">
            <span className="text-[10px] text-gray-400 font-bold">⌘K</span>
          </div>
        </div>

        <AnimatePresence>
          {focused && !query && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-2xl border border-gray-200 shadow-xl p-3 flex flex-wrap gap-2"
            >
              <p className="w-full text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-1 mb-1">Trending</p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-primary/5 hover:text-primary text-xs font-medium text-gray-700 border border-gray-100 transition-colors"
                >
                  <Search className="w-3 h-3" /> {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}