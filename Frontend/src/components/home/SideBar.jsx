import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import {
  Home, BookOpen, BarChart3, Bookmark,
  Library, Bell, Menu, X, Search
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { label: "Dashboard" },
  { label: "My Books" },
  { label: "Saved" },
  { label: "Progress" },
];

/**
 * @param {{ userName?: string }} props
 */
export default function Navbar({ userName }) {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const initials = userName ? userName.slice(0, 2).toUpperCase() : "ST";

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center gap-6">

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L2 7l8 5 8-5-8-5zM2 13l8 5 8-5M2 10l8 5 8-5"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900 tracking-tight">StudyArch</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {navItems.map((item, i) => {
              const isActive = i === activeIdx;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveIdx(i)}
                  className={`relative px-3 py-1.5 text-sm font-medium transition-all duration-200
                    ${isActive ? "text-primary" : "text-gray-500 hover:text-gray-900"}`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-3">
            <button className="hidden md:flex text-gray-400 hover:text-gray-700 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="relative text-gray-400 hover:text-gray-700 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
            </button>
            <Avatar className="w-8 h-8 cursor-pointer">
              <AvatarFallback className="bg-primary text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              className="md:hidden text-gray-500"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-100 p-4 flex flex-col gap-1 md:hidden shadow-lg"
          >
            {navItems.map((item, i) => (
              <button
                key={item.label}
                onClick={() => { setActiveIdx(i); setMobileOpen(false); }}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all
                  ${i === activeIdx ? "text-primary bg-primary/5" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={async () => {
                await logout();
                setMobileOpen(false);
              }}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-left text-red-500 hover:bg-red-50 transition-all mt-1 border-t border-gray-100 pt-3"
            >
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}