import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const COVERS = [
  "https://media.base44.com/images/public/69efa420cc70fe1d5ad91c6f/b726c69a1_generated_8d8c4aff.png",
  "https://media.base44.com/images/public/69efa420cc70fe1d5ad91c6f/a407c0863_generated_6753a693.png",
  "https://media.base44.com/images/public/69efa420cc70fe1d5ad91c6f/e2c322d3d_generated_156ddae3.png",
  "https://media.base44.com/images/public/69efa420cc70fe1d5ad91c6f/00d76ab6c_generated_e052d216.png",
  "https://media.base44.com/images/public/69efa420cc70fe1d5ad91c6f/03da6d855_generated_81d89e1b.png",
];

const books = [
  { title: "Advanced Quantum Mechanics", author: "R. Feynman", progress: 72, cover: COVERS[0], subject: "Physics", barColor: "bg-primary" },
  { title: "The Art of Critical Thinking", author: "E. Bonewits", progress: 45, cover: COVERS[1], subject: "Philosophy", barColor: "bg-primary" },
  { title: "Organic Chemistry", author: "J. McMurry", progress: 88, cover: COVERS[2], subject: "Chemistry", barColor: "bg-primary" },
  { title: "Modern Philosophy", author: "A. Kenny", progress: 33, cover: COVERS[3], subject: "History", barColor: "bg-primary" },
  { title: "Data Structures", author: "T. Cormen", progress: 60, cover: COVERS[4], subject: "CS", barColor: "bg-primary" },
  { title: "Linear Algebra", author: "S. Axler", progress: 25, cover: COVERS[0], subject: "Maths", barColor: "bg-primary" },
];

export default function CurrentlyReading({ progressMap = {}, progressEntries = [] }) {
  const scrollRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const readingItems = progressEntries
    .filter((entry) => entry?.resource_title)
    .sort((a, b) => new Date(b.createdDate || b.completed_at || 0) - new Date(a.createdDate || a.completed_at || 0))
    .slice(0, 6)
    .map((entry) => ({
      title: entry.resource_title,
      author: entry.subject || entry.resource_type || 'Study note',
      progress: entry.completed ? 100 : 45,
      cover: entry.resource_type ? COVERS[0] : COVERS[0],
      subject: entry.subject || 'General',
      barColor: 'bg-primary',
    }));

  const booksToShow = readingItems.length > 0 ? readingItems : books;
  /** @param {number} dir */
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });

  return (
    <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Continue Reading</h2>
          <p className="text-gray-400 text-sm mt-0.5">Pick up where you left off</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll(1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {booksToShow.map((book, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex-shrink-0 w-36 cursor-pointer group"
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-gray-100">
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <h3 className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{book.title}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{book.author}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${book.progress}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.7 }}
                  className={`h-full ${book.barColor} rounded-full`}
                />
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{book.progress}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}