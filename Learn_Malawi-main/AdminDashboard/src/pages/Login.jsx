import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const { login, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to sign in.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Sign in to Learn Malawi</h1>
          <p className="mt-3 text-sm text-slate-500">Enter your credentials to continue to the admin dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </div>

          {errorMessage && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
          )}

          <button
            type="submit"
            disabled={isLoadingAuth}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
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
