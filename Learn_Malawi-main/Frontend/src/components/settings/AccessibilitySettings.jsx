import React, { useState } from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard.jsx";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccessibility } from "@/lib/AccessibilityContext";

export default function AccessibilitySettings() {
  const { settings, toggle, reset } = useAccessibility();
  const [tts, setTts] = useState(false);
  const [fontSize, setFontSize] = useState([16]);
  const [readingSpeed, setReadingSpeed] = useState([1]);
  const [language, setLanguage] = useState("en");

  const activeCount = Object.values(settings).filter(Boolean).length;

  return (
    <div>
      {activeCount > 0 && (
        <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
          {activeCount} accessibility feature{activeCount > 1 ? "s" : ""} currently active
        </div>
      )}

      <SettingsSection
        title="Text & Display"
        description="Adjust visual options that improve readability and contrast."
      >
        <SettingsRow label="Font Size" description={`${fontSize[0]}px`}>
          <div className="w-32">
            <Slider min={12} max={24} step={1} value={fontSize} onValueChange={setFontSize} />
          </div>
        </SettingsRow>
        <SettingsRow label="High Contrast Mode" description="Improve visibility with stronger contrast">
          <Switch checked={settings.highContrast} onCheckedChange={() => toggle("highContrast")} />
        </SettingsRow>
        <SettingsRow label="Large Text" description="Increase the text size for easier reading.">
          <Switch checked={settings.largeText} onCheckedChange={() => toggle("largeText")} />
        </SettingsRow>
        <SettingsRow label="Dyslexia-Friendly Font" description="Use a font that helps reduce letter confusion.">
          <Switch checked={settings.dyslexiaFont} onCheckedChange={() => toggle("dyslexiaFont")} />
        </SettingsRow>
        <SettingsRow label="Increased Line Spacing" description="Spread text out for improved readability.">
          <Switch checked={settings.lineSpacing} onCheckedChange={() => toggle("lineSpacing")} />
        </SettingsRow>
        <SettingsRow label="Reduce Animations" description="Minimise transitions and motion effects.">
          <Switch checked={settings.reducedMotion} onCheckedChange={() => toggle("reducedMotion")} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title="Reading & Audio"
        description="Enable audio and reading controls for easier content consumption."
      >
        <SettingsRow label="Text-to-Speech" description="Read content aloud">
          <Switch checked={tts} onCheckedChange={setTts} />
        </SettingsRow>
        <SettingsRow label="Reading Speed" description={`${readingSpeed[0]}x speed`}>
          <div className="w-32">
            <Slider min={0.5} max={2} step={0.25} value={readingSpeed} onValueChange={setReadingSpeed} />
          </div>
        </SettingsRow>
        <SettingsRow label="Screen Reader Guidance" description="Enable spoken announcements and focus cues.">
          <Switch checked={settings.screenReader} onCheckedChange={() => toggle("screenReader")} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Language" description="Choose the app language used in the interface.">
        <SettingsRow label="App Language" description="Select your preferred language">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ny">Chichewa</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsSection>

      <div className="flex flex-col gap-3">
        <Button>Save Changes</Button>
        <Button variant="outline" onClick={reset}>
          Reset to Default
        </Button>
      </div>
    </div>
  );
}
