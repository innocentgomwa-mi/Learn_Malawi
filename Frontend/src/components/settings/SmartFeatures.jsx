import React from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard";
import { Switch } from "@/components/ui/switch";
import { SETTINGS_SAVE_BTN } from "./SettingsCard.jsx";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export default function SmartFeatures() {
  const [prefs, setPrefs] = useLocalStorageState("learnmalawi_smart_features_prefs", {
    recommendations: true,
    autoQuiz: false,
  });
  /** @param {'recommendations'|'autoQuiz'} key */
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div>
      <SettingsSection title="Smart Features" description="AI-powered tools to enhance your learning">
        <SettingsRow label="Enable Recommendations" description="Get personalised resource suggestions based on your activity">
          <Switch checked={prefs.recommendations} onCheckedChange={() => toggle("recommendations")} />
        </SettingsRow>
        <SettingsRow label="Auto Quiz Suggestions" description="Automatically suggest quizzes based on topics you've studied">
          <Switch checked={prefs.autoQuiz} onCheckedChange={() => toggle("autoQuiz")} />
        </SettingsRow>
      </SettingsSection>

      <button type="button" className={SETTINGS_SAVE_BTN}>Save Settings</button>
    </div>
  );
}