import React, { useState } from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard.jsx";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { SETTINGS_SAVE_BTN, SETTINGS_OUTLINE_BTN } from "./SettingsCard.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccessibility } from "@/lib/AccessibilityContext";

export default function AccessibilitySettings() {
  const { settings, toggle, update, reset } = useAccessibility();
  const [fontSize, setFontSize] = useState([16]);

  const activeCount = Object.values(settings).filter(Boolean).length;

  return (
    <div>
      {activeCount > 0 && (
        <div className="mb-4 rounded-2xl border border-yellow-300 bg-gradient-to-r from-yellow-100 to-blue-50 p-4 text-sm text-blue-900">
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
        description="Modern assistive speech controls for the full website."
      >
        <SettingsRow label="Text-to-Speech" description="Enable spoken reading across pages.">
          <Switch checked={Boolean(settings.textToSpeech)} onCheckedChange={(checked) => update("textToSpeech", Boolean(checked))} />
        </SettingsRow>
        <SettingsRow label="Read on Hover" description="Read hovered items aloud when text-to-speech is on.">
          <Switch checked={Boolean(settings.readOnHover)} onCheckedChange={(checked) => update("readOnHover", Boolean(checked))} />
        </SettingsRow>
        <SettingsRow label="Reading Speed" description={`${Number(settings.speechRate || 1).toFixed(2)}x speed`}>
          <div className="w-32">
            <Slider
              min={0.5}
              max={2}
              step={0.25}
              value={[Number(settings.speechRate || 1)]}
              onValueChange={(value) => update("speechRate", Number(value[0] || 1))}
            />
          </div>
        </SettingsRow>
        <SettingsRow label="Screen Reader Guidance" description="Enable spoken announcements and focus cues.">
          <Switch checked={settings.screenReader} onCheckedChange={() => toggle("screenReader")} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Language" description="Choose the app language used in the interface.">
        <SettingsRow label="App Language" description="Select your preferred language">
          <Select value={settings.speechLanguage || "en-US"} onValueChange={(value) => update("speechLanguage", value)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">English</SelectItem>
              <SelectItem value="ny-MW">Chichewa</SelectItem>
              <SelectItem value="fr-FR">French</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsSection>

      <div className="flex flex-col gap-3">
        <button type="button" className={SETTINGS_SAVE_BTN}>Save Changes</button>
        <button type="button" className={SETTINGS_OUTLINE_BTN} onClick={reset}>
          Reset to Default
        </button>
      </div>
    </div>
  );
}
