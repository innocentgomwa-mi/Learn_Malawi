import React from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export default function SmartFeatures() {
  const [prefs, setPrefs] = useLocalStorageState("learnmalawi_smart_features_prefs", {
    recommendations: true,
    autoQuiz: false,
  });
  const { toast } = useToast();
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

      <Button onClick={() => toast({ title: "Smart features saved" })}>Save Settings</Button>
    </div>
  );
}