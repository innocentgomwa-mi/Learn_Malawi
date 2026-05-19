import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function VerifyTokenPage() {
  const { verifyToken } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      setIsSubmitting(true);
      await verifyToken({ email, token });
      navigate('/login'); // Redirect to login after successful verification
    } catch (error) {
      setErrorMessage(error?.data?.message || error?.message || 'Token verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Verify Your Token</h1>
          <p className="mt-3 text-sm text-slate-500">Enter the token sent to your email to complete registration.</p>
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
            <label className="block text-sm font-medium text-slate-700">Verification Token</label>
            <input
              type="text"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </div>

          {errorMessage && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying…' : 'Verify Token'}
          </button>
        </form>
      </div>
    </div>
  );
}