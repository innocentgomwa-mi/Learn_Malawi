import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const CHALLENGE_KEY = 'admindashboard_2fa_challenge';
const EMAIL_KEY = 'admindashboard_2fa_email';

export default function TwoFactorVerifyPage() {
  const { verifyTwoFactor, isLoadingAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const stateChallengeId = location.state?.challengeId || '';
  const stateEmail = location.state?.email || '';

  const challengeId = stateChallengeId || window.sessionStorage.getItem(CHALLENGE_KEY) || '';
  const email = stateEmail || window.sessionStorage.getItem(EMAIL_KEY) || '';

  if (stateChallengeId) window.sessionStorage.setItem(CHALLENGE_KEY, stateChallengeId);
  if (stateEmail) window.sessionStorage.setItem(EMAIL_KEY, stateEmail);

  const clearChallenge = () => {
    window.sessionStorage.removeItem(CHALLENGE_KEY);
    window.sessionStorage.removeItem(EMAIL_KEY);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    try {
      if (!challengeId) {
        setErrorMessage('Missing verification challenge. Please sign in again.');
        return;
      }
      await verifyTwoFactor(challengeId, code.trim());
      clearChallenge();
      navigate('/', { replace: true });
    } catch (error) {
      setErrorMessage(error?.message || 'Invalid security code.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0c4a6e 45%, #2563eb 100%)' }}>
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Two-Factor Verification</h1>
          <p className="mt-3 text-sm text-slate-500">
            Enter the 6-digit code sent to {email || 'your email'}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Security code</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-sky-400 focus:outline-none"
            />
          </div>

          {errorMessage && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoadingAuth}
            className="w-full rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-50"
          >
            {isLoadingAuth ? 'Verifying…' : 'Confirm login'}
          </button>

          <button
            type="button"
            onClick={() => {
              clearChallenge();
              navigate('/login', { replace: true });
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  );
}

