import { useState } from 'react';
import { GraduationCap, BookOpen, Users, ChevronRight, CheckCircle } from 'lucide-react';
import { updateProfile } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';

const roleMap = {
  student: 'Student',
  teacher: 'Teacher',
};

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(/** @type {'student' | 'teacher' | null} */ (null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  const roles = [
    {
      id: 'student',
      icon: BookOpen,
      title: "I'm a Student",
      desc: 'Access study notes, past papers, quizzes, tutorials and track your learning progress.',
      color: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20',
      activeColor: 'ring-2 ring-emerald-500',
    },
    {
      id: 'teacher',
      icon: Users,
      title: "I'm a Teacher",
      desc: 'Create and manage study notes, past papers, tutorials and quizzes for your students.',
      color: 'border-blue-400 bg-blue-50 dark:bg-blue-950/20',
      activeColor: 'ring-2 ring-blue-500',
    },
  ];

  const handleContinue = async () => {
    if (!selected) return;
    setError(null);

    if (!user) {
      navigate('/register', { state: { role: roleMap[selected] } });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ role: roleMap[selected] });
      await refreshUser?.();
      navigate(selected === 'teacher' ? '/teacher' : '/');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : String(updateError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-primary rounded-2xl p-3 mb-4">
            <GraduationCap className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="font-poppins text-3xl font-bold text-foreground mb-2">Welcome to Learn Malawi!</h1>
          <p className="text-muted-foreground">
            Hi {user?.firstName || 'there'}, tell us who you are to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {roles.map(({ id, icon: Icon, title, desc, color, activeColor }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(/** @type {'student' | 'teacher'} */ (id))}
              className={`relative text-left border-2 rounded-2xl p-6 transition-all ${color} ${selected === id ? activeColor : 'border-border hover:border-primary/50'}`}
            >
              {selected === id && (
                <CheckCircle className="absolute top-4 right-4 h-5 w-5 text-primary" />
              )}
              <Icon className={`h-10 w-10 mb-4 ${id === 'student' ? 'text-emerald-600' : 'text-blue-600'}`} />
              <h2 className="font-poppins font-bold text-xl text-foreground mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected || saving}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Setting up your account…' : 'Continue'}
          {!saving && <ChevronRight className="h-5 w-5" />}
        </button>

        <p className="text-center text-xs text-muted-foreground mt-4">You can always update this in your profile settings.</p>
      </div>
    </div>
  );
}
