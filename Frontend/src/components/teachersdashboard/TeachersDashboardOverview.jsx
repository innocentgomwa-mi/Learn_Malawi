// @ts-nocheck
import { Link, useOutletContext } from 'react-router-dom';
import { BookOpen, FileText, PlayCircle, HelpCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

const resourceCards = [
  { label: 'Study Notes', key: 'notes', icon: BookOpen, color: 'bg-blue-500' },
  { label: 'Past Papers', key: 'papers', icon: FileText, color: 'bg-purple-500' },
  { label: 'Tutorials', key: 'tutorials', icon: PlayCircle, color: 'bg-orange-500' },
  { label: 'Quizzes', key: 'quizzes', icon: HelpCircle, color: 'bg-emerald-500' },
];

const statusCards = [
  { label: 'Pending Review', key: 'pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Approved', key: 'approved', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Rejected', key: 'rejected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
];

export default function TeachersDashboardOverview() {
  const { counts, statuses } = useOutletContext();

  return (
    <>
      <section id="section-overview" className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5 shrink-0">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <p className="text-sm text-blue-800">
            Resources you upload are submitted as <strong>pending</strong> and will be reviewed by an admin before they are published to students. You can only edit or delete your own resources.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {resourceCards.map(({ label, key, icon: Icon, color }) => (
            <Link
              key={key}
              to={`/teacher/${key === 'notes' ? 'study-notes' : key === 'papers' ? 'past-papers' : key}`}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-jakarta font-bold text-foreground">{counts[key]}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="section-status" className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Submission Status Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statusCards.map(({ label, key, icon: Icon, color, bg }) => (
            <div key={key} className={`${bg} rounded-xl p-5 flex items-center gap-4`}>
              <Icon className={`w-8 h-8 ${color}`} />
              <div>
                <p className={`text-2xl font-jakarta font-bold ${color}`}>{statuses[key]}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
