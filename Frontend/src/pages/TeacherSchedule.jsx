import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchClassSchedules, createClassSchedule, updateClassSchedule, deleteClassSchedule } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Pencil, Trash2, Bell, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @typedef {'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'} DayOfWeek
 */
/**
 * @typedef {{ id?: string | number; title: string; subject: string; class_level: string; day_of_week: DayOfWeek; start_time: string; end_time: string; is_recurring: boolean; color: string; reminder_minutes: number; notes: string; sessionDate?: Date; msUntilReminder?: number; daysUntil?: number }} ScheduleSession
 */
/**
 * @typedef {ScheduleSession & { day_of_week: DayOfWeek | '' }} ScheduleSessionForm
 */
/**
 * @typedef {{ value: string; bg: string; text: string; border: string; dot: string }} ScheduleColor
 */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const COLORS = [
  { value: 'blue', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500' },
  { value: 'emerald', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500' },
  { value: 'purple', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-500' },
  { value: 'orange', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' },
  { value: 'pink', bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300', dot: 'bg-pink-500' },
  { value: 'slate', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', dot: 'bg-slate-500' },
];

const REMINDER_OPTIONS = [
  { value: 0, label: 'No reminder' },
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
];

const EMPTY_FORM = /** @type {ScheduleSessionForm} */ ({
  title: '', subject: '', class_level: '', day_of_week: /** @type {DayOfWeek | ''} */ (''),
  start_time: '', end_time: '', is_recurring: true,
  color: 'blue', reminder_minutes: 15, notes: '',
});

const CLASS_SCHEDULE_FIELDS = ['title', 'subject', 'class_level', 'day_of_week', 'start_time', 'end_time', 'is_recurring', 'color', 'reminder_minutes', 'notes'];

/**
 * @param {ScheduleSessionForm} form
 */
function toSchedulePayload(form) {
  return CLASS_SCHEDULE_FIELDS.reduce((payload, key) => {
    payload[key] = form[key];
    return payload;
  }, /** @type {Record<string, unknown>} */ ({}));
}

/**
 * @param {string} colorValue
 * @returns {ScheduleColor}
 */
function getColor(colorValue) {
  return COLORS.find(c => c.value === colorValue) || COLORS[0];
}

/**
 * @param {{ sessions: ScheduleSession[] }} props
 */
function UpcomingReminders({ sessions }) {
  const now = new Date();
  const todayIdx = now.getDay(); // 0=Sun
  const dayMap = /** @type {Record<DayOfWeek, number>} */({ Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 });

  const upcoming = sessions
    .filter(s => s.reminder_minutes > 0)
    .map(s => {
      const sessionDayIdx = dayMap[s.day_of_week] ?? -1;
      let daysUntil = sessionDayIdx - todayIdx;
      if (daysUntil < 0) daysUntil += 7;
      const [h, m] = s.start_time.split(':').map(Number);
      const sessionDate = new Date(now);
      sessionDate.setDate(now.getDate() + daysUntil);
      sessionDate.setHours(h, m, 0, 0);
      const reminderTime = new Date(sessionDate.getTime() - s.reminder_minutes * 60000);
      const msUntilReminder = reminderTime.getTime() - now.getTime();
      return { ...s, sessionDate, msUntilReminder, daysUntil };
    })
    .filter(s => s.msUntilReminder > 0)
    .sort((a, b) => a.msUntilReminder - b.msUntilReminder)
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-amber-600" />
        <p className="text-sm font-semibold text-amber-800">Upcoming Reminders</p>
      </div>
      {upcoming.map(s => {
        const color = getColor(s.color);
        const label = s.daysUntil === 0 ? 'Today' : s.daysUntil === 1 ? 'Tomorrow' : s.day_of_week;
        return (
          <div key={s.id} className="flex items-center gap-3 text-sm text-amber-800">
            <div className={cn('w-2 h-2 rounded-full shrink-0', color.dot)} />
            <span className="font-medium">{s.title}</span>
            <span className="text-amber-600">{label} at {s.start_time}</span>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
              -{s.reminder_minutes}min reminder
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

export default function TeacherSchedule() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState(/** @type {ScheduleSession[]} */([]));
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(/** @type {ScheduleSession | null} */(null));
  const [form, setForm] = useState(/** @type {ScheduleSessionForm} */(EMPTY_FORM));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSchedules = async () => {
      if (!user?.email) return;
      setLoading(true);
      const data = await fetchClassSchedules();
      setSessions(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    loadSchedules();
  }, [user]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  /** @param {ScheduleSession} s */
  const openEdit = (s) => { setEditing(s); setForm({ ...EMPTY_FORM, ...s }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title || !form.day_of_week || !form.start_time || !form.end_time) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateClassSchedule(editing.id, toSchedulePayload(form));
        setSessions(prev => prev.map(s => s.id === editing.id ? updated : s));
      } else {
        const created = await createClassSchedule(toSchedulePayload(form));
        setSessions(prev => [...prev, created]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  /** @param {string|number} id */
  const handleDelete = async (id) => {
    await deleteClassSchedule(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  /**
   * @param {keyof ScheduleSession} key
   * @param {string|number|boolean} val
   */
  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Class Schedule</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your weekly timetable with recurring sessions and reminders</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add Session
        </Button>
      </div>

      <UpcomingReminders sessions={sessions} />

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading schedule...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {DAYS.map(day => {
            const daySessions = sessions
              .filter(s => s.day_of_week === day)
              .sort((a, b) => a.start_time.localeCompare(b.start_time));
            return (
              <div key={day} className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">{day}</div>
                {daySessions.length === 0 && (
                  <div className="border-2 border-dashed border-border rounded-xl p-4 text-center text-xs text-muted-foreground min-h-[80px] flex items-center justify-center">
                    No classes
                  </div>
                )}
                {daySessions.map(s => {
                  const color = getColor(s.color);
                  return (
                    <div key={s.id} className={cn('rounded-xl p-3 border space-y-1.5 group relative', color.bg, color.border)}>
                      <div className="flex items-start justify-between gap-1">
                        <p className={cn('font-semibold text-xs leading-tight', color.text)}>{s.title}</p>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => openEdit(s)} className={cn('p-0.5 rounded hover:bg-white/50', color.text)}><Pencil className="w-3 h-3" /></button>
                          <button onClick={() => s.id != null && handleDelete(s.id)} className="p-0.5 rounded hover:bg-red-100 text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                      {s.subject && <p className={cn('text-xs opacity-75', color.text)}>{s.subject}</p>}
                      <div className={cn('flex items-center gap-1 text-xs opacity-80', color.text)}>
                        <Clock className="w-3 h-3" />
                        {s.start_time} – {s.end_time}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {s.is_recurring && (
                          <span className={cn('flex items-center gap-0.5 text-[10px] font-medium', color.text)}>
                            <RefreshCw className="w-2.5 h-2.5" /> Weekly
                          </span>
                        )}
                        {s.reminder_minutes > 0 && (
                          <span className={cn('flex items-center gap-0.5 text-[10px] font-medium', color.text)}>
                            <Bell className="w-2.5 h-2.5" /> -{s.reminder_minutes}m
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Session' : 'Add Class Session'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Class Title *</Label>
                <Input value={form.title} onChange={e => setF('title', e.target.value)} placeholder="e.g. Form 2 Mathematics" />
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input value={form.subject} onChange={e => setF('subject', e.target.value)} placeholder="e.g. Mathematics" />
              </div>
              <div className="space-y-1.5">
                <Label>Class Level</Label>
                <Input value={form.class_level} onChange={e => setF('class_level', e.target.value)} placeholder="e.g. Form 2" />
              </div>
              <div className="space-y-1.5">
                <Label>Day of Week *</Label>
                <Select value={form.day_of_week} onValueChange={v => setF('day_of_week', v)}>
                  <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                  <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Start Time *</Label>
                <Input type="time" value={form.start_time} onChange={e => setF('start_time', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End Time *</Label>
                <Input type="time" value={form.end_time} onChange={e => setF('end_time', e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Reminder</Label>
              <Select value={String(form.reminder_minutes)} onValueChange={v => setF('reminder_minutes', Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REMINDER_OPTIONS.map(r => <SelectItem key={r.value} value={String(r.value)}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Color Tag</Label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c.value} onClick={() => setF('color', c.value)}
                    className={cn('w-7 h-7 rounded-full border-2 transition-all', c.dot, form.color === c.value ? 'border-slate-800 scale-110' : 'border-transparent')}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="recurring" checked={form.is_recurring} onChange={e => setF('is_recurring', e.target.checked)} className="rounded" />
              <Label htmlFor="recurring" className="cursor-pointer">Recurring weekly session</Label>
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <textarea value={form.notes} onChange={e => setF('notes', e.target.value)} rows={2} placeholder="Optional notes..."
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-transparent shadow-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.title || !form.day_of_week || !form.start_time || !form.end_time}
                className="bg-blue-600 hover:bg-blue-700">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Session'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}