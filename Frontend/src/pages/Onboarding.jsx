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
      color: 'border-yellow-300/70 bg-yellow-400/15',
      activeColor: 'ring-2 ring-yellow-300',
    },
    {
      id: 'teacher',
      icon: Users,
      title: "I'm a Teacher",
      desc: 'Create and manage study notes, past papers, tutorials and quizzes for your students.',
      color: 'border-blue-300/70 bg-blue-400/10',
      activeColor: 'ring-2 ring-blue-300',
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
              background: 'linear-gradient(135deg, rgba(250,204,21,0.72) 0%, rgba(245,158,11,0.62) 100%)',
              boxShadow: '0 0 32px 8px rgba(250,204,21,0.35), inset 0 1px 1px rgba(255,255,255,0.28)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(30,58,138,0.35)',
            }}
          >
            <GraduationCap className="h-10 w-10 text-blue-950/90" />
          </div>
        </div>

        <div
          className="rounded-3xl px-8 pt-14 pb-8"
          style={{
            background: 'rgba(15, 23, 42, 0.42)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(250,204,21,0.32)',
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
                  <CheckCircle className="absolute top-4 right-4 h-5 w-5 text-yellow-200" />
                )}
                <Icon className={`h-10 w-10 mb-4 ${id === 'student' ? 'text-yellow-300' : 'text-blue-200'}`} />
                <h2 className="font-poppins font-bold text-xl text-white mb-2">{title}</h2>
                <p className="text-sm text-blue-100/85 leading-relaxed">{desc}</p>
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
            style={{ background: 'linear-gradient(90deg, #facc15, #f59e0b)' }}
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
