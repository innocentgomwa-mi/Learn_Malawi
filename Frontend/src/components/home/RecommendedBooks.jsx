import React from "react";
import { motion } from "framer-motion";
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchStudyNotes } from "@/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const getRemoteUrl = (value) => {
  if (!value) return value;
  return value.startsWith('/') ? `${API_BASE_URL}${value}` : value;
};

const COVERS = [
  "https://media.base44.com/images/public/69efa420cc70fe1d5ad91c6f/b726c69a1_generated_8d8c4aff.png",
  "https://media.base44.com/images/public/69efa420cc70fe1d5ad91c6f/a407c0863_generated_6753a693.png",
  "https://media.base44.com/images/public/69efa420cc70fe1d5ad91c6f/e2c322d3d_generated_156ddae3.png",
  "https://media.base44.com/images/public/69efa420cc70fe1d5ad91c6f/00d76ab6c_generated_e052d216.png",
];

export default function RecommendedBooks() {
  const { data: notes = [] } = useQuery({
    queryKey: ['recommendedStudyNotes'],
    queryFn: () => fetchStudyNotes(),
    staleTime: 1000 * 60,
    initialData: [],
  });

  const normalizedNotes = Array.isArray(notes) ? notes : Array.isArray(notes?.data) ? notes.data : [];

  const recommended = normalizedNotes
    .filter((note) => note?.title)
    .slice(0, 4)
    .map((note, i) => ({
      title: note.title,
      subject: note.subject || '',
      author: note.subject || note.teacher_name || 'Study Note',
      subtitle: note.level ? `Level ${note.level}` : note.grade ? `Grade ${note.grade}` : null,
      pages: note.page_count ? note.page_count : null,
      hours: note.estimated_time ? `${note.estimated_time}h` : null,
      cover: note.imageUrl ? getRemoteUrl(note.imageUrl) : COVERS[i % COVERS.length],
    }));

  const displayBooks = recommended;

  return (
    <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommended For You</h2>
          <p className="text-gray-400 text-sm mt-0.5">Your subject mastery at a glance</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary font-semibold gap-1 text-sm hover:bg-primary/5">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {displayBooks.map((book, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="flex flex-col items-center text-center cursor-pointer group"
          >
                  <Link to={book.subject ? `/study-notes?subject=${encodeURIComponent(book.subject)}` : '/study-notes'} className="w-full rounded-xl overflow-hidden mb-3 bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            </Link>
            <h3 className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{book.title}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{book.author}</p>
            {book.subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{book.subtitle}</p>}
            <div className="flex items-center gap-2 mt-1.5">
              {book.pages && <span className="text-[11px] text-gray-400">{book.pages}p</span>}
              {book.hours && <span className="text-[11px] text-gray-400">{book.hours}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}