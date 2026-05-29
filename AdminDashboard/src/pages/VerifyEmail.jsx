import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '@/api/apiClient';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState(
    location.state?.email
      ? 'A verification code was sent to your email. Enter it below to complete registration.'
      : 'Enter the verification code sent to your email to complete registration.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state?.email]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    if (!email) {
      setErrorMessage('Please provide the email used during registration.');
      return;
    }
    if (!code.trim()) {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.auth.verifyEmail({ email, code: code.trim() });
      navigate('/registration-success');
    } catch (error) {
      setErrorMessage(error?.data?.message || error?.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setErrorMessage('');
    if (!email) {
      setErrorMessage('Please provide the email used during registration to resend the code.');
      return;
    }

    try {
      setIsResending(true);
      await apiClient.auth.resendVerification({ email });
      setInfoMessage('A new verification code has been sent to your email.');
    } catch (error) {
      setErrorMessage(error?.data?.message || error?.message || 'Unable to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 p-10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Verify Your Email</h1>
          <p className="mt-3 text-sm text-slate-500">Finish admin signup by entering the verification code sent to your email.</p>
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
            <label className="block text-sm font-medium text-slate-700">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              maxLength={6}
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
            />
            <p className="mt-2 text-xs text-slate-500">The code is six digits and expires quickly. Check your inbox and spam folder.</p>
          </div>

          {infoMessage && (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{infoMessage}</div>
          )}

          {errorMessage && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying…' : 'Verify email'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center text-sm text-slate-500">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
          >
            {isResending ? 'Resending…' : 'Resend verification code'}
          </button>
          <p>
            Already have access?{' '}
            <button type="button" onClick={() => navigate('/login')} className="font-semibold text-slate-900 hover:text-slate-700">
              Sign in
            </button>
          </p>
          <p>
            Need to register again?{' '}
            <button type="button" onClick={() => navigate('/register')} className="font-semibold text-slate-900 hover:text-slate-700">
              Back to register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
