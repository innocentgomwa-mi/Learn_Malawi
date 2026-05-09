import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="w-full px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold text-foreground mb-4">Unauthorized Access</h1>
      <p className="text-base text-muted-foreground mb-6">
        You do not have permission to view this page. Please sign in with an admin or teacher account.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Go to Login
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
