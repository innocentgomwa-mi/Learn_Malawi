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
  const [agreeTerms, setAgreeTerms] = useState(false);
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

    if (!agreeTerms) {
      setErrorMessage('You must agree to the terms and conditions.');
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
        agreeTerms: Boolean(agreeTerms), // Ensure agreeTerms is a boolean
      });
      navigate('/');
    } catch (error) {
      console.error('Admin registration failed', error);
      setErrorMessage(error?.data?.message || error?.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 p-10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Register as Admin</h1>
          <p className="mt-3 text-sm text-slate-500">Create an administrator account using the secret admin key.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
              />
            </div>
          </div>

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
              minLength={6}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Admin Secret Key</label>
            <input
              type="text"
              value={secretKey}
              onChange={(event) => setSecretKey(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
            />
            <p className="mt-2 text-xs text-slate-500">Enter the admin registration secret key to complete signup.</p>
          </div>

          <div>
            <label className="flex items-center text-sm text-slate-700">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(event) => setAgreeTerms(event.target.checked)}
                className="mr-2 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              />
              I agree to the terms and conditions
            </label>
          </div>

          {errorMessage && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Registering…' : 'Register as Admin'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            Already have an account?{' '}
            <a href="/login" className="font-semibold text-slate-900 hover:text-slate-700">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
