import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { authRegister } from '@/api';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [school, setSchool] = useState('');
  const [level, setLevel] = useState('PSLC');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultRole = location.state?.role === 'Teacher' ? 'Teacher' : 'Student';
  const [role, setRole] = useState(defaultRole);
  const roleLabel = role === 'Student' ? 'student' : 'teacher';
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [loading, setLoading] = useState(false);

  /**
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (!firstName || !lastName || !email || !password || !confirmPassword || !school || !level) {
      setError('Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please double-check and try again.');
      return;
    }

    setLoading(true);
    try {
      const normalizedRole = role.trim().charAt(0).toUpperCase() + role.trim().slice(1).toLowerCase();
      await authRegister({ firstName, lastName, email, password, role: normalizedRole, school, level });
      const loginResult = await login(email, password);
      if (loginResult.success) {
        navigate(role === 'Student' ? '/' : '/teacher', { replace: true });
      } else {
        setError(loginResult.message || 'Registration succeeded but login failed.');
      }
    } catch (registrationError) {
      const message = registrationError instanceof Error
        ? registrationError.message
        : String(registrationError);
      setError(message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-lg">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Create {roleLabel} access</p>
            <h1 className="mt-4 text-3xl font-bold text-foreground">Register a {roleLabel} account</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Complete the form below to set up a new account for the selected role.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground">
                First name
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Last name
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-foreground">
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              School
              <input
                type="text"
                value={school}
                onChange={(event) => setSchool(event.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Level
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="PSLC">PSLC</option>
                <option value="JCE">JCE</option>
                <option value="MSCE">MSCE</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-foreground">
              Role
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating account…' : 'Register account'}
            </button>
          </form>

          <div className="mt-8 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/90 hover:underline hover:underline-offset-2">
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
