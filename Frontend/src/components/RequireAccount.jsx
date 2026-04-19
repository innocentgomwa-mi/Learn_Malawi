import { Link } from "react-router-dom";

export default function RequireAccount({ resourceName }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center mb-6 rounded-full bg-primary/10 p-4 text-primary">
        <span className="text-2xl">🔒</span>
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-3">Create an account to access {resourceName}</h1>
      <p className="text-muted-foreground mb-6">
        Learning resources like {resourceName} are available only to registered students. Sign up now to unlock full access to notes, past papers, tutorials, and quizzes.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/register"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
        >
          Create an account
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition"
        >
          Already have an account?
        </Link>
      </div>
    </div>
  );
}
