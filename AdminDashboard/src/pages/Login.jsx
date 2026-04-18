import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const { login, register, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [school, setSchool] = useState('');
  const [level, setLevel] = useState('PSLC');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isRegistering) {
        await register({
          firstName,
          lastName,
          email,
          password,
          role: 'Admin',
          school,
          level,
        });
        setSuccessMessage('Registration successful! You can now log in.');
        setIsRegistering(false);
        // Clear form
        setFirstName('');
        setLastName('');
        setPassword('');
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to sign in.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">
            {isRegistering ? 'Register as Admin' : 'Sign in to Learn Malawi'}
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            {isRegistering
              ? 'Create an admin account to access the dashboard.'
              : 'Enter your credentials to continue to the admin dashboard.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && (
            <>
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

              <div>
                <label className="block text-sm font-medium text-slate-700">School</label>
                <input
                  type="text"
                  value={school}
                  onChange={(event) => setSchool(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Level</label>
                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
                >
                  <option value="PSLC">PSLC</option>
                  <option value="JCE">JCE</option>
                  <option value="MSCE">MSCE</option>
                </select>
              </div>
            </>
          )}

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

          {successMessage && (
            <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</div>
          )}

          <button
            type="submit"
            disabled={isLoadingAuth}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {isLoadingAuth ? (isRegistering ? 'Registering…' : 'Signing in…') : (isRegistering ? 'Register' : 'Sign in')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMessage('');
              setSuccessMessage('');
              setFirstName('');
              setLastName('');
              setSchool('');
              setLevel('PSLC');
              setPassword('');
            }}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            {isRegistering ? 'Already have an account? Sign in' : 'Need to register as admin? Register here'}
          </button>
        </div>
      </div>
    </div>
  );
}
