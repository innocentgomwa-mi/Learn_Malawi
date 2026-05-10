import React from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard.jsx";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, RotateCcw } from "lucide-react";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

const defaultProgress = [
  { label: "Mathematics", value: 68 },
  { label: "Biology", value: 45 },
  { label: "Chemistry", value: 30 },
];

export default function ProgressData() {
  const [progressData, setProgressData] = useLocalStorageState("learnmalawi_progress_data", defaultProgress);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(progressData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "progress-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setProgressData(defaultProgress);
  };

  return (
    <div>
      <SettingsSection title="Your Progress" description="Overview of your learning activity">
        <div className="space-y-3">
          {progressData.map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{value}%</span>
              </div>
              <Progress value={value} className="h-1.5" />
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Data Management">
        <SettingsRow label="Download Learning Data" description="Export your progress and activity as a file">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </SettingsRow>
        <SettingsRow label="Reset Progress" description="Clear all your progress data — this cannot be undone">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive border-destructive/30"
            onClick={handleReset}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}