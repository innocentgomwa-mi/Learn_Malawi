import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/apiClient';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequestCode = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    try {
      setRequesting(true);
      await apiClient.auth.forgotPassword(email.trim());
      setInfoMessage('A verification code has been sent to your email.');
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to request reset code.');
    } finally {
      setRequesting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }
    try {
      setResetting(true);
      await apiClient.auth.resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword: newPassword.trim(),
      });
      setInfoMessage('Password reset successful. You can now sign in.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to reset password.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(180deg, #082f7a 0%, #1d4ed8 45%, #facc15 100%)' }}>
      <div className="w-full max-w-md rounded-3xl border border-yellow-300/60 bg-white p-10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-blue-950">Forgot Password</h1>
          <p className="mt-3 text-sm text-blue-900/70">Request a reset code, then set a new password.</p>
        </div>

        <form onSubmit={handleRequestCode} className="space-y-4">
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
          <button
            type="submit"
            disabled={requesting}
            className="w-full rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-blue-950 transition hover:bg-yellow-300 disabled:opacity-50"
          >
            {requesting ? 'Sending code…' : 'Send reset code'}
          </button>
        </form>

        <form onSubmit={handleResetPassword} className="mt-6 space-y-4 border-t border-blue-100 pt-6">
          <div>
            <label className="block text-sm font-medium text-blue-900">Verification code</label>
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950 focus:border-yellow-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={6}
              className="mt-2 w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950 focus:border-yellow-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              className="mt-2 w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950 focus:border-yellow-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={resetting}
            className="w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            {resetting ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        {errorMessage && <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>}
        {infoMessage && <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{infoMessage}</div>}

        <div className="mt-6 text-center text-sm text-blue-900/70">
          <button type="button" onClick={() => navigate('/login')} className="font-semibold text-blue-900 hover:text-blue-700">
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}

