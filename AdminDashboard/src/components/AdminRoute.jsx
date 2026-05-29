import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { isAdminUser } from "@/lib/adminAuth";

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoadingAuth, authError } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  if (!isAuthenticated || authError?.type === "auth_required") {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminUser(user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <h1 className="text-xl font-semibold text-slate-900">Admin access only</h1>
          <p className="mt-3 text-sm text-slate-600">
            This dashboard is for Learn Malawi administrators. Sign in with an admin account, or use the main
            student/teacher site for other roles.
          </p>
          <a
            href="/login"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return children;
}
