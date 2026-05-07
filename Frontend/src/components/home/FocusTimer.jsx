import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

/**
 * @typedef {{ name: string; hours: number; emoji: string; barColor: string }} Subject
 * @typedef {{ subjects: Subject[]; onSessionComplete: (subjectName: string, minutes: number) => void }} FocusTimerProps
 */

const DURATIONS = [
  { label: "25 min", value: 25 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
];

/**
 * @param {FocusTimerProps} props
 */
export default function FocusTimer({ subjects, onSessionComplete }) {
  const [duration, setDuration] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || "");
  const [totalFocused, setTotalFocused] = useState(0);
  const intervalRef = useRef(/** @type {number | null} */ (null));

  useEffect(() => {
    if (!running && !completed) setSecondsLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            if (intervalRef.current !== null) {
              clearInterval(intervalRef.current);
            }
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running]);

  const handleComplete = () => {
    setRunning(false);
    setCompleted(true);
    setTotalFocused(prev => prev + duration);
    onSessionComplete(selectedSubject, duration);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ["#4338ca", "#6366f1", "#a5b4fc"] });
  };

  const handleReset = () => { setRunning(false); setCompleted(false); setSecondsLeft(duration * 60); };
  const toggleTimer = () => setRunning(r => !r);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const currentSubject = subjects.find(/** @param {Subject} s */ (s) => s.name === selectedSubject);

  return (
    <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Focus Timer</h2>
      <p className="text-gray-400 text-sm mb-6">
        Total focused today: <span className="font-semibold text-gray-700">{Math.round(totalFocused)} min</span>
      </p>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left: big timer display */}
        <div className="flex-shrink-0 text-center">
          <p className="text-xs font-semibold text-primary mb-2">{currentSubject?.emoji} {selectedSubject}</p>
          <AnimatePresence mode="wait">
            {completed ? (
              <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              </motion.div>
            ) : (
              <motion.div key="time" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-6xl font-bold text-gray-900 tabular-nums tracking-tight">{mins}:{secs}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="text-sm text-primary font-medium mt-2">{completed ? "Complete!" : running ? "focusing..." : "ready"}</p>

          <button
            onClick={toggleTimer}
            disabled={completed}
            className="mt-5 flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 py-3 text-sm transition-colors disabled:opacity-50 mx-auto"
          >
            {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
          </button>
          <button onClick={handleReset} className="mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto transition-colors">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        {/* Right: duration pills + subject grid */}
        <div className="flex-1 w-full space-y-4">
          {/* Duration */}
          <div className="flex gap-2 flex-wrap">
            {DURATIONS.map(/** @param {{ label: string; value: number }} d */ (d) => (
              <button
                key={d.value}
                onClick={() => { if (!running) setDuration(d.value); }}
                disabled={running}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                  ${duration === d.value
                    ? "bg-primary text-white shadow-sm"
                    : "border border-gray-200 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40"}`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Subjects as grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {subjects.map(/** @param {Subject} s */ (s) => (
              <button
                key={s.name}
                onClick={() => setSelectedSubject(s.name)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left
                  ${selectedSubject === s.name
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
              >
                <span className="block">{s.name}</span>
                <span className="block text-gray-400 font-normal mt-0.5">{s.hours}h studied</span>
              </button>
            ))}
          </div>

          {completed && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-emerald-700">+{duration}min added to {selectedSubject}!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}