import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const { login, isLoadingAuth, authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      const response = await login(email, password);
      if (response?.twoFactorRequired && response?.challengeId) {
        navigate('/verify-2fa', {
          state: {
            challengeId: response.challengeId,
            email: email.trim(),
          },
          replace: true,
        });
        return;
      }
      navigate('/');
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to sign in.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(180deg, #082f7a 0%, #1d4ed8 45%, #facc15 100%)' }}>
      <div className="w-full max-w-md bg-white rounded-3xl border border-yellow-300/70 p-10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-blue-950">Sign in to Learn Malawi</h1>
          <p className="mt-3 text-sm text-blue-900/70">Enter your credentials to continue to the admin dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-900">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div className="text-right">
              <a href="/forgot-password" className="text-sm font-semibold text-blue-900 hover:text-blue-700">
                Forgot password?
              </a>
            </div>

          {(errorMessage || authError?.type === 'forbidden') && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage || authError?.message}
            </div>
          )}

            <button
              type="submit"
              disabled={isLoadingAuth}
              className="w-full rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-blue-950 transition hover:bg-yellow-300 disabled:opacity-50"
            >
              {isLoadingAuth ? 'Signing in…' : 'Sign in'}
            </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            Need admin access?{' '}
            <a href="/register" className="font-semibold text-slate-900 hover:text-slate-700">
              Register as admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
