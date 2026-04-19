import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Volume2, Eye, BookOpen, FileText, HelpCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { updateProfile } from '@/api';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: BookOpen },
  { id: 'tts', label: 'Text-to-Speech', icon: Volume2 },
  { id: 'content', label: 'Content Accessibility', icon: FileText },
  { id: 'display', label: 'Visual Display', icon: Eye },
  { id: 'quiz', label: 'Quiz Accessibility', icon: HelpCircle },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const DEFAULT_ACCESSIBILITY = {
  tts_enabled_lessons: true,
  tts_enabled_quizzes: true,
  tts_auto_read_lessons: false,
  tts_auto_read_quizzes: false,
  tts_voice: 'female',
  tts_speed: '1.0',
  tts_pitch: '1.0',
  reading_mode: 'audio_text',
  simple_language: false,
  force_high_contrast: false,
  force_audio: false,
  default_font_size: 'medium',
  default_contrast: 'normal',
  quiz_read_aloud_btn: true,
  quiz_auto_read: false,
  quiz_allow_replay: true,
  quiz_extra_time: '0',
  notify_simplified: true,
  notify_read_aloud_high: true,
};

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 shrink-0">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={cn('w-10 h-5.5 rounded-full transition-colors', checked ? 'bg-emerald-500' : 'bg-slate-200')} style={{ height: '1.375rem' }}>
          <div className={cn('absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} style={{ width: '1.125rem', height: '1.125rem' }} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium leading-tight">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-emerald-600" />
        </div>
        <h2 className="font-semibold text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function TeacherSettings() {
  const { user, refreshUser } = useAuth();
  const [school, setSchool] = useState('');
  const [acc, setAcc] = useState(DEFAULT_ACCESSIBILITY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    if (!user) return;
    setSchool(user.school || '');
    if (user.accessibility_settings) {
      setAcc({ ...DEFAULT_ACCESSIBILITY, ...user.accessibility_settings });
    }
  }, [user]);

  const setA = (key, val) => setAcc(a => ({ ...a, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ school });
      await refreshUser();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile, accessibility, and course delivery preferences</p>
      </div>

      <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto pb-0">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveSection(id)}
            className={cn('flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px',
              activeSection === id
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-slate-300')}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
        <div className="ml-auto pl-4 pb-1 shrink-0">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : saved ? '✓ Saved!' : 'Save All'}</Button>
        </div>
      </div>

      <div className="space-y-5">

        {activeSection === 'profile' && (
          <SectionCard title="Profile" icon={BookOpen}>
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold">
                {user?.full_name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-semibold">{user?.full_name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full capitalize">{user?.role || 'teacher'}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={user?.full_name || ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Managed by your account</p>
            </div>
            <div className="space-y-1.5">
              <Label>School / Institution</Label>
              <Input value={school} onChange={e => setSchool(e.target.value)} placeholder="e.g. Kamuzu Academy" />
            </div>
          </SectionCard>
        )}

        {activeSection === 'tts' && (
          <SectionCard title="Text-to-Speech Controls" icon={Volume2}>
            <div className="space-y-4">
              <Toggle checked={acc.tts_enabled_lessons} onChange={v => setA('tts_enabled_lessons', v)} label="Enable Read Aloud for Lessons" description="Students can click to hear lesson content read aloud" />
              <Toggle checked={acc.tts_enabled_quizzes} onChange={v => setA('tts_enabled_quizzes', v)} label="Enable Read Aloud for Quizzes" description="Students can click to hear quiz questions read aloud" />
              <Toggle checked={acc.tts_auto_read_lessons} onChange={v => setA('tts_auto_read_lessons', v)} label="Auto-read Lessons on Open" description="Lessons start reading automatically when a student opens them" />
              <Toggle checked={acc.tts_auto_read_quizzes} onChange={v => setA('tts_auto_read_quizzes', v)} label="Auto-read Quiz Questions" description="Each question is read aloud automatically" />
            </div>
            <div className="pt-2 border-t border-border space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Advanced Voice Settings</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Voice</Label>
                  <Select value={acc.tts_voice} onValueChange={v => setA('tts_voice', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Speech Speed</Label>
                  <Select value={acc.tts_speed} onValueChange={v => setA('tts_speed', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['0.8', '0.9', '1.0', '1.1', '1.25', '1.5'].map(s => (
                        <SelectItem key={s} value={s}>{s}x</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Pitch</Label>
                  <Select value={acc.tts_pitch} onValueChange={v => setA('tts_pitch', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['0.8', '0.9', '1.0', '1.1', '1.2'].map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {activeSection === 'content' && (
          <SectionCard title="Content Accessibility" icon={FileText}>
            <div className="space-y-1.5">
              <Label>Default Reading Mode</Label>
              <Select value={acc.reading_mode} onValueChange={v => setA('reading_mode', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text_only">Text Only</SelectItem>
                  <SelectItem value="audio_text">Audio + Text (Recommended)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Sets the default content delivery mode for your students</p>
            </div>
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content Simplification</p>
              <Toggle checked={acc.simple_language} onChange={v => setA('simple_language', v)} label="Use Simple Language Mode" description="AI will simplify lesson text for easier comprehension" />
            </div>
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Force Accessibility (enforced for all students)</p>
              <Toggle checked={acc.force_high_contrast} onChange={v => setA('force_high_contrast', v)} label="Enforce High-Contrast Mode" description="All students must view content in high contrast" />
              <Toggle checked={acc.force_audio} onChange={v => setA('force_audio', v)} label="Enforce Audio Enabled" description="Audio support must remain on for all students" />
            </div>
          </SectionCard>
        )}

        {activeSection === 'display' && (
          <SectionCard title="Visual Display Defaults" icon={Eye}>
            <p className="text-xs text-muted-foreground -mt-2">These are the defaults students see. Students may override their own preferences.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Default Font Size</Label>
                <Select value={acc.default_font_size} onValueChange={v => setA('default_font_size', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Contrast Mode</Label>
                <Select value={acc.default_contrast} onValueChange={v => setA('default_contrast', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high_contrast">High Contrast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground font-medium mb-2">Preview</p>
              <div className={cn('rounded-lg p-4 border', acc.default_contrast === 'high_contrast' ? 'bg-black text-white border-white' : 'bg-white text-slate-800 border-slate-200')}>
                <p className={cn('font-medium', acc.default_font_size === 'small' ? 'text-xs' : acc.default_font_size === 'large' ? 'text-lg' : 'text-sm')}>
                  This is how content will appear to students by default.
                </p>
              </div>
            </div>
          </SectionCard>
        )}

        {activeSection === 'quiz' && (
          <SectionCard title="Quiz Accessibility Settings" icon={HelpCircle}>
            <div className="space-y-4">
              <Toggle checked={acc.quiz_read_aloud_btn} onChange={v => setA('quiz_read_aloud_btn', v)} label='Show "Read Question Aloud" Button' description="Students can manually trigger audio for each question" />
              <Toggle checked={acc.quiz_auto_read} onChange={v => setA('quiz_auto_read', v)} label="Auto-read Questions" description="Questions are automatically read when displayed" />
              <Toggle checked={acc.quiz_allow_replay} onChange={v => setA('quiz_allow_replay', v)} label="Allow Audio Replay" description="Students can replay the audio for a question multiple times" />
            </div>
            <div className="pt-2 border-t border-border space-y-1.5">
              <Label>Extra Time for Students</Label>
              <Select value={acc.quiz_extra_time} onValueChange={v => setA('quiz_extra_time', v)}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No extra time</SelectItem>
                  <SelectItem value="5">+5 minutes</SelectItem>
                  <SelectItem value="10">+10 minutes</SelectItem>
                  <SelectItem value="15">+15 minutes</SelectItem>
                  <SelectItem value="30">+30 minutes</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Added on top of the default quiz duration</p>
            </div>
          </SectionCard>
        )}

        {activeSection === 'notifications' && (
          <SectionCard title="Notifications & Alerts" icon={Bell}>
            <p className="text-xs text-muted-foreground -mt-2">Receive alerts about student accessibility patterns to help you adapt your teaching.</p>
            <div className="space-y-4">
              <Toggle checked={acc.notify_simplified} onChange={v => setA('notify_simplified', v)} label="Alert: Students may need simplified content" description="Triggered when many students struggle with reading-heavy material" />
              <Toggle checked={acc.notify_read_aloud_high} onChange={v => setA('notify_read_aloud_high', v)} label="Alert: High usage of Read Aloud detected" description="Triggered when more than 40% of students use audio support" />
            </div>
            <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs font-semibold text-amber-800 mb-1">📊 Accessibility Monitoring</p>
              <p className="text-xs text-amber-700">Student accessibility usage data (TTS usage, font changes, audio replays) will appear in your Analytics dashboard to help identify students who may need extra support.</p>
            </div>
          </SectionCard>
        )}

      </div>
    </div>
  );
}
