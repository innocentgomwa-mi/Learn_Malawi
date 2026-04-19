/**
 * @typedef {Object} TextToSpeechProps
 * @property {string} text
 */

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2 } from "lucide-react";

/**
 * @param {TextToSpeechProps} props
 */
export default function TextToSpeech({ text }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [supported] = useState(() => "speechSynthesis" in window);
  const utteranceRef = useRef(
    /** @type {SpeechSynthesisUtterance | null} */ (null)
  );

  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      setSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    utterance.onend = () => { setSpeaking(false); setPaused(false); };
    utterance.onerror = () => { setSpeaking(false); setPaused(false); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    setPaused(false);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setPaused(true);
    setSpeaking(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2 bg-accent/40 border border-accent rounded-xl px-4 py-2.5">
      <Volume2 className="h-4 w-4 text-primary flex-shrink-0" />
      <span className="text-xs font-medium text-foreground mr-1">Listen</span>
      <select
        value={speed}
        onChange={(e) => { setSpeed(Number(e.target.value)); if (speaking || paused) handleStop(); }}
        className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground outline-none focus:ring-1 focus:ring-primary"
        title="Playback speed"
      >
        {SPEEDS.map(s => <option key={s} value={s}>{s}×</option>)}
      </select>

      {!speaking && !paused ? (
        <button
          onClick={handlePlay}
          title="Play"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Play className="h-3.5 w-3.5" /> Play
        </button>
      ) : (
        <>
          {speaking ? (
            <button
              onClick={handlePause}
              title="Pause"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Pause className="h-3.5 w-3.5" /> Pause
            </button>
          ) : (
            <button
              onClick={handlePlay}
              title="Resume"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Play className="h-3.5 w-3.5" /> Resume
            </button>
          )}
          <button
            onClick={handleStop}
            title="Stop"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Square className="h-3.5 w-3.5" /> Stop
          </button>
        </>
      )}

      {speaking && (
        <span className="ml-1 flex gap-0.5">
          {[0, 0.15, 0.3].map((delay) => (
            <span
              key={delay}
              className="w-1 h-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </span>
      )}
    </div>
  );
}