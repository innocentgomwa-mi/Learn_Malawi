import React from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard.jsx";
import { SETTINGS_SAVE_BTN } from "./SettingsCard.jsx";
import { SETTINGS_CHIP_ACTIVE, SETTINGS_CHIP_INACTIVE } from "@/lib/resourcePageStyles";
import { Slider } from "@/components/ui/slider";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

const SUBJECTS = ["Mathematics", "Biology", "Chemistry", "Physics", "English", "History", "Geography", "Chichewa"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function LearningPreferences() {
  const [selected, setSelected] = useLocalStorageState("learnmalawi_learning_selected_subjects", ["Mathematics", "Biology"]);
  const [difficulty, setDifficulty] = useLocalStorageState("learnmalawi_learning_difficulty", 2);
  const [dailyGoal, setDailyGoal] = useLocalStorageState("learnmalawi_learning_daily_goal", [30]);
  const [studyDays, setStudyDays] = useLocalStorageState("learnmalawi_learning_study_days", ["Mon", "Wed", "Fri"]);

  /** @param {string} s */
  const toggleSubject = (s) => setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  /** @param {string} d */
  const toggleDay = (d) => setStudyDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  const difficultyLabels = ["Beginner", "Intermediate", "Advanced"];

  return (
    <div>
      <SettingsSection title="Preferred Subjects" description="Select the subjects you're focusing on">
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map(s => (
            <button
              key={s}
              onClick={() => toggleSubject(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selected.includes(s) ? SETTINGS_CHIP_ACTIVE : SETTINGS_CHIP_INACTIVE
              }`}
            >{s}</button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Difficulty Level" description="Choose your preferred challenge level">
        <div className="flex gap-2">
          {difficultyLabels.map((label, i) => (
            <button
              key={label}
              onClick={() => setDifficulty(i)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                difficulty === i ? SETTINGS_CHIP_ACTIVE : SETTINGS_CHIP_INACTIVE
              }`}
            >{label}</button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Daily Study Goal" description={`Target: ${dailyGoal[0]} minutes per day`}>
        <Slider min={15} max={180} step={15} value={dailyGoal} onValueChange={setDailyGoal} className="w-full" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>15 min</span><span>180 min</span>
        </div>
      </SettingsSection>

      <SettingsSection title="Study Schedule" description="Select your preferred study days">
        <div className="flex gap-2 flex-wrap">
          {DAYS.map(d => (
            <button
              key={d}
              onClick={() => toggleDay(d)}
              className={`h-10 w-10 rounded-lg text-xs font-semibold transition-colors ${
                studyDays.includes(d) ? SETTINGS_CHIP_ACTIVE : SETTINGS_CHIP_INACTIVE
              }`}
            >{d}</button>
          ))}
        </div>
      </SettingsSection>

      <button type="button" className={SETTINGS_SAVE_BTN}>Save Preferences</button>
    </div>
  );
}