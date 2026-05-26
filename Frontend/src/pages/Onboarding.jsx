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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm"
        style={{ backgroundImage: "url('/images/forgot%20password.jpg')" }}
      />
      <div className="absolute inset-0 bg-slate-950/25" />

      <div className="relative w-full max-w-2xl">
        <div className="flex justify-center mb-[-2.5rem] relative z-10">
          <div
            className="h-24 w-20 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(180,180,255,0.45) 0%, rgba(130,100,220,0.55) 100%)',
              boxShadow: '0 0 32px 8px rgba(130,100,255,0.35), inset 0 1px 1px rgba(255,255,255,0.3)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <GraduationCap className="h-10 w-10 text-white/90" />
          </div>
        </div>

        <div
          className="rounded-3xl px-8 pt-14 pb-8"
          style={{
            background: 'rgba(100, 80, 180, 0.25)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.3)',
          }}
        >
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-white mb-3">Welcome to Learn Malawi</h1>
            <p className="text-white/65 text-sm leading-relaxed">
              Hi {user?.firstName || 'there'}, choose your role and finish setting up your account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            {roles.map(({ id, icon: Icon, title, desc, color, activeColor }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(/** @type {'student' | 'teacher'} */ (id))}
                className={`relative text-left rounded-3xl p-6 transition-all border-2 ${selected === id ? activeColor : 'border-white/10 hover:border-white/30'} ${color}`}
              >
                {selected === id && (
                  <CheckCircle className="absolute top-4 right-4 h-5 w-5 text-white" />
                )}
                <Icon className={`h-10 w-10 mb-4 ${id === 'student' ? 'text-emerald-700' : 'text-blue-700'}`} />
                <h2 className="font-poppins font-bold text-xl text-slate-950 mb-2">{title}</h2>
                <p className="text-sm text-slate-700 leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 rounded-2xl bg-rose-500/20 border border-rose-400/30 px-4 py-3 text-sm text-rose-200 text-center">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected || saving}
            className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-slate-900 transition hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(90deg, #00e5cc, #00cfff)' }}
          >
            {saving ? 'Setting up your account…' : 'Continue'}
            {!saving && <ChevronRight className="h-5 w-5" />}
          </button>

          <p className="mt-6 text-center text-xs text-white/70">You can always update this in your profile settings.</p>
        </div>
      </div>
    </div>
  );
}
