// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchAttendanceRecords, fetchAttendanceHistory, createAttendance, updateAttendance } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Plus, Trash2, Save, Loader2, CheckCircle, Clock, XCircle, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const CLASS_LEVELS = ['Standard 1','Standard 2','Standard 3','Standard 4','Standard 5','Standard 6','Standard 7','Standard 8','Form 1','Form 2','Form 3','Form 4'];
const STATUS_OPTIONS = ['Present', 'Absent', 'Late'];

const statusStyles = {
  Present: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  Absent: 'bg-red-100 text-red-700 border-red-300',
  Late: 'bg-amber-100 text-amber-700 border-amber-300',
};

const statusIcons = { Present: CheckCircle, Absent: XCircle, Late: Clock };

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [course, setCourse] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' | 'history'
  const [existingId, setExistingId] = useState(null);

  // Load existing record when course+date changes
  useEffect(() => {
    if (!user?.email || !course || !date) return;
    const load = async () => {
      const results = await fetchAttendanceRecords({
        teacherEmail: user.email,
        course,
        date,
      });
      if (Array.isArray(results) && results.length > 0) {
        setStudents(results[0].records || []);
        setExistingId(results[0].id);
      } else {
        setExistingId(null);
        // Don't clear students so teacher can reuse same list for new dates
      }
    };
    load();
  }, [user?.email, course, date]);

  const loadHistory = async () => {
    if (!user?.email) return;
    setLoadingLogs(true);
    const data = await fetchAttendanceHistory(user.email);
    setLogs(Array.isArray(data) ? data : []);
    setLoadingLogs(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'history') loadHistory();
  };

  const addStudent = () => {
    const name = newName.trim();
    if (!name) return;
    if (students.find(s => s.student_name.toLowerCase() === name.toLowerCase())) return;
    setStudents(s => [...s, { student_name: name, status: 'Present' }]);
    setNewName('');
  };

  const removeStudent = (i) => setStudents(s => s.filter((_, idx) => idx !== i));

  const setStatus = (i, status) =>
    setStudents(s => s.map((st, idx) => idx === i ? { ...st, status } : st));

  const handleSave = async () => {
    if (!user?.email || !course || !date || students.length === 0) return;
    setSaving(true);
    const payload = { course, class_level: classLevel, date, teacher_email: user.email, records: students };
    if (existingId) {
      const updated = await updateAttendance(existingId, payload);
      setExistingId(updated?.id ?? existingId);
    } else {
      const created = await createAttendance(payload);
      setExistingId(created?.id || null);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const summary = {
    Present: students.filter(s => s.status === 'Present').length,
    Absent: students.filter(s => s.status === 'Absent').length,
    Late: students.filter(s => s.status === 'Late').length,
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-muted-foreground text-sm mt-1">Mark and track student attendance by course and date</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit mb-6">
        {[['mark', 'Mark Attendance'], ['history', 'History']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-all', activeTab === id ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'mark' && (
        <div className="space-y-6">
          {/* Session Config */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Session Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Course / Subject</Label>
                <Input value={course} onChange={e => setCourse(e.target.value)} placeholder="e.g. Mathematics" />
              </div>
              <div className="space-y-1.5">
                <Label>Class Level</Label>
                <Select value={classLevel} onValueChange={setClassLevel}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {CLASS_LEVELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
          </div>

          {course && date && (
            <>
              {/* Add Student */}
              <div className="flex gap-3">
                <Input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addStudent()}
                  placeholder="Add student name and press Enter..."
                  className="max-w-sm"
                />
                <Button variant="outline" onClick={addStudent}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add
                </Button>
              </div>

              {/* Summary */}
              {students.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(summary).map(([s, count]) => {
                    const Icon = statusIcons[s];
                    return (
                      <div key={s} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium', statusStyles[s])}>
                        <Icon className="w-4 h-4" />
                        {count} {s}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Student List */}
              {students.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Add students above to start marking attendance</p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student Name</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {students.map((s, i) => (
                        <tr key={i} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                          <td className="px-4 py-3 font-medium">{s.student_name}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              {STATUS_OPTIONS.map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => setStatus(i, opt)}
                                  className={cn(
                                    'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                                    s.status === opt ? statusStyles[opt] : 'border-border text-muted-foreground hover:border-slate-400'
                                  )}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => removeStudent(i)} className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {students.length > 0 && (
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : saved ? '✓ Saved!' : <><Save className="w-4 h-4 mr-2" />Save Attendance</>}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {loadingLogs ? (
            <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-25" />
              <p className="font-medium">No attendance records yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map(log => {
                const present = (log.records || []).filter(r => r.status === 'Present').length;
                const absent = (log.records || []).filter(r => r.status === 'Absent').length;
                const late = (log.records || []).filter(r => r.status === 'Late').length;
                const total = log.records?.length || 0;
                return (
                  <div key={log.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{log.course} {log.class_level ? `· ${log.class_level}` : ''}</p>
                        <p className="text-xs text-muted-foreground">{log.date} · {total} students</p>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{present} Present</span>
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{absent} Absent</span>
                        {late > 0 && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{late} Late</span>}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: total > 0 ? `${(present / total) * 100}%` : '0%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{total > 0 ? Math.round((present / total) * 100) : 0}% attendance rate</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}