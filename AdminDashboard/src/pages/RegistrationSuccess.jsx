import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function RegistrationSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0c4a6e 45%, #2563eb 100%)' }}>
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 p-10 shadow-xl text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-emerald-500" />
        </div>
        
        <h1 className="text-3xl font-semibold text-slate-900 mb-3">Congratulations!</h1>
        
        <p className="text-lg text-slate-600 mb-2">Your admin account has been successfully created.</p>
        
        <p className="text-sm text-slate-500 mb-8">Your email has been verified and you're ready to get started. Click the button below to sign in to your account.</p>

        <button
          onClick={() => navigate('/login')}
          className="w-full rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 mb-4"
        >
          Go to Sign In
        </button>

        <p className="text-xs text-slate-500">
          You can now access the admin dashboard with your registered email and password.
        </p>
      </div>
    </div>
  );
}
