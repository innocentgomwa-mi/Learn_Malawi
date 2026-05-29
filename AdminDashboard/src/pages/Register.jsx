import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const ADMIN_SECRET_KEY = '26D7INNPEV';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (secretKey.trim() !== ADMIN_SECRET_KEY) {
      setErrorMessage('Invalid admin secret key.');
      return;
    }

    if (!agreementChecked) {
      setErrorMessage('You must agree to the admin terms and conditions before registering.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        firstName,
        lastName,
        email,
        password,
        role: 'Admin',
        secretKey,
        agreeTerms: agreementChecked,
      });
      navigate('/verify-email', { state: { email } });
    } catch (error) {
      console.error('Admin registration failed', error);
      const rawMessage = String(error?.data?.message || error?.message || 'Registration failed.');
      const normalized = rawMessage.toLowerCase();
      if (
        normalized.includes('already exists') ||
        normalized.includes('already registered') ||
        normalized.includes('already pending')
      ) {
        setErrorMessage('An account with this email already exists. Please sign in or use a different email.');
      } else {
        setErrorMessage(rawMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(180deg, #082f7a 0%, #1d4ed8 45%, #facc15 100%)' }}>
      <div className="w-full max-w-xl bg-white rounded-3xl border border-yellow-300/70 p-10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-blue-950">Register as Admin</h1>
          <p className="mt-3 text-sm text-blue-900/70">Create an administrator account using the secret admin key.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-blue-900">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950 focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950 focus:border-yellow-400 focus:outline-none"
              />
            </div>
          </div>

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
              minLength={6}
              className="mt-2 w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
              className="mt-2 w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900">Admin Secret Key</label>
            <input
              type="text"
              value={secretKey}
              onChange={(event) => setSecretKey(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950 focus:border-yellow-400 focus:outline-none"
            />
            <p className="mt-2 text-xs text-blue-900/50">Enter the admin registration secret key to complete signup.</p>
          </div>

          <div className="flex items-start rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={(event) => setAgreementChecked(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-900 focus:ring-yellow-400"
              />
              <span className="text-sm leading-5 text-blue-900">
                I agree to the <span className="font-semibold text-blue-950">admin terms and conditions</span> and understand that this account is for administrative use only.
              </span>
            </label>
          </div>

          {errorMessage && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-blue-950 transition hover:bg-yellow-300 disabled:opacity-50"
          >
            {isSubmitting ? 'Registering…' : 'Register as Admin'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-blue-900/70">
          <p>
            Already have an account?{' '}
            <a href="/login" className="font-semibold text-blue-900 hover:text-blue-700">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
