// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchQuizzes, fetchAttendanceHistory } from '@/api';
import { filterByTeacher } from './teacherUtils';
import { BarChart2, Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CLASS_LEVELS = ['Standard 1','Standard 2','Standard 3','Standard 4','Standard 5','Standard 6','Standard 7','Standard 8','Form 1','Form 2','Form 3','Form 4'];

export default function TeacherAnalytics() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const getClassValue = (item) => item?.class || item?.class_level || item?.classLevel || '';
  const ALL_CLASSES_VALUE = 'all';

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        try {
        const [quizData, attendanceData] = await Promise.all([
          fetchQuizzes(),
          fetchAttendanceHistory(user.email),
        ]);

        const supportedQuizzes = Array.isArray(quizData) ? quizData : [];
        const supportedAttendance = Array.isArray(attendanceData) ? attendanceData : [];

        setQuizzes(filterByTeacher(supportedQuizzes, user.email));
        setAttendance(filterByTeacher(supportedAttendance, user.email));
      } catch (error) {
        console.warn('Failed to load analytics data:', error);
        setQuizzes([]);
        setAttendance([]);
      }
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user?.email]);

  const filteredQuizzes = selectedClass === ALL_CLASSES_VALUE ? quizzes : quizzes.filter(q => getClassValue(q) === selectedClass);
  const filteredAttendance = selectedClass === ALL_CLASSES_VALUE ? attendance : attendance.filter(a => getClassValue(a) === selectedClass);

  // Quiz topic mastery data
  const topicData = filteredQuizzes.map(q => ({
    name: q.title?.length > 18 ? q.title.slice(0, 18) + '…' : q.title || 'Untitled',
    questions: q.questions?.length || 0,
    subject: q.subject || 'General',
  }));

  // Attendance summary
  const attendanceSummary = filteredAttendance.reduce((acc, log) => {
    (log.records || []).forEach(r => {
      acc[r.status] = (acc[r.status] || 0) + 1;
    });
    return acc;
  }, { Present: 0, Absent: 0, Late: 0 });

  const totalStudentDays = Object.values(attendanceSummary).reduce((a, b) => a + b, 0);
  const avgEngagement = filteredAttendance.length > 0
    ? Math.round(filteredAttendance.reduce((sum, log) => {
        const records = log.records || [];
        const totalScore = records.reduce((rSum, r) => rSum + (r.engagement_score || 0), 0);
        return sum + (records.length > 0 ? totalScore / records.length : 0);
      }, 0) / filteredAttendance.length)
    : 0;
  const attendanceRate = totalStudentDays > 0
    ? Math.round((attendanceSummary.Present / totalStudentDays) * 100) : 0;

  // CSV Export
  const exportCSV = () => {
    const rows = [['Quiz Title', 'Subject', 'Class Level', 'Questions', 'Status']];
    filteredQuizzes.forEach(q => {
      rows.push([q.title || '', q.subject || '', getClassValue(q), q.questions?.length || 0, q.status || 'approved']);
    });
    rows.push([]);
    rows.push(['Attendance Summary']);
    rows.push(['Status', 'Count']);
    Object.entries(attendanceSummary).forEach(([k, v]) => rows.push([k, v]));
    rows.push(['Overall Attendance Rate', `${attendanceRate}%`]);

    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `learn-malawi-report-${selectedClass || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // PDF Export
  const exportPDF = async () => {
    setExporting(true);
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Learn Malawi – Analytics Report', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}  |  Class: ${selectedClass || 'All Classes'}`, 14, y);
    y += 12;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Quiz / Topic Summary', 14, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(14, y, 182, 7, 'F');
    doc.text('Title', 16, y + 5);
    doc.text('Subject', 80, y + 5);
    doc.text('Class', 130, y + 5);
    doc.text('Questions', 165, y + 5);
    y += 9;

    filteredQuizzes.forEach((q, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, y - 1, 182, 7, 'F');
      }
      doc.text((q.title || '').slice(0, 35), 16, y + 4);
      doc.text(q.subject || '', 80, y + 4);
      doc.text(getClassValue(q), 130, y + 4);
      doc.text(String(q.questions?.length || 0), 168, y + 4);
      y += 8;
    });

    y += 8;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Attendance Summary', 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Present: ${attendanceSummary.Present}`, 16, y);
    y += 6;
    doc.text(`Absent: ${attendanceSummary.Absent}`, 16, y);
    y += 6;
    doc.text(`Late: ${attendanceSummary.Late}`, 16, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Overall Attendance Rate: ${attendanceRate}%`, 16, y);

    doc.save(`learn-malawi-report-${selectedClass || 'all'}-${new Date().toISOString().split('T')[0]}.pdf`);
    setExporting(false);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">Track class performance, quiz coverage and attendance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All Classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CLASSES_VALUE}>All Classes</SelectItem>
              {CLASS_LEVELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV} disabled={loading}>
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button onClick={exportPDF} disabled={loading || exporting}>
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />} PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Quizzes', value: filteredQuizzes.length, color: 'text-blue-600' },
              { label: 'Total Questions', value: filteredQuizzes.reduce((a, q) => a + (q.questions?.length || 0), 0), color: 'text-sky-600' },
              { label: 'Attendance Rate', value: `${attendanceRate}%`, color: 'text-purple-600' },
              { label: 'Avg Engagement', value: `${avgEngagement}%`, color: 'text-emerald-600' },
              { label: 'Sessions Logged', value: filteredAttendance.length, color: 'text-orange-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-5">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Quiz chart */}
          {topicData.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold mb-4">Quiz Coverage by Topic</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topicData} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="questions" name="Questions" radius={[4, 4, 0, 0]}>
                    {topicData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${160 + i * 20}, 60%, 45%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Attendance breakdown */}
          {totalStudentDays > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold mb-4">Attendance Breakdown</h2>
              <div className="flex gap-6 items-center">
                <div className="flex-1 space-y-3">
                  {[['Present', attendanceSummary.Present, 'bg-blue-500'], ['Absent', attendanceSummary.Absent, 'bg-red-400'], ['Late', attendanceSummary.Late, 'bg-amber-400']].map(([label, count, color]) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{label}</span>
                        <span className="font-medium">{count} ({totalStudentDays > 0 ? Math.round((count / totalStudentDays) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`${color} h-2 rounded-full`} style={{ width: `${totalStudentDays > 0 ? (count / totalStudentDays) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {topicData.length === 0 && totalStudentDays === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <BarChart2 className="w-14 h-14 mx-auto mb-4 opacity-25" />
              <p className="font-medium">No data yet for the selected class</p>
              <p className="text-sm mt-1">Analytics appear once quizzes are approved and attendance is logged</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}