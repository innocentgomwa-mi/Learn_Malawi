import { Link } from "react-router-dom";
import { UserPlus, MailCheck, BookOpen, ArrowRight } from "lucide-react";
import createAccountImage from "@/assets/onboarding-step-create-account.svg";
import verifyEmailImage from "@/assets/onboarding-step-verify-email.svg";
import exploreResourcesImage from "@/assets/onboarding-step-explore-resources.svg";

export default function RequireAccount({ resourceName }) {
  return (
    <div className="w-full px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 px-6 py-8 text-white sm:px-8">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <span>🔒</span> Access required
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">Create an account to access {resourceName}</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/80 sm:text-base">
            Learn Malawi resources are available for registered users. Follow these quick steps and start learning right away.
          </p>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white">
              <UserPlus className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold text-blue-950">Step 1: Create your account</h2>
            <p className="mt-1 text-xs text-blue-900/75">Open sign up, enter your details, and choose a secure password.</p>
            <img
              src={createAccountImage}
              alt="Create account form preview"
              className="mt-4 h-32 w-full rounded-xl border border-blue-200 object-cover"
            />
          </div>

          <div className="rounded-2xl border border-yellow-200 bg-yellow-50/70 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-blue-950">
              <MailCheck className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold text-blue-950">Step 2: Verify your email</h2>
            <p className="mt-1 text-xs text-blue-900/75">Check your inbox, confirm your account, then sign in.</p>
            <img
              src={verifyEmailImage}
              alt="Email verification preview"
              className="mt-4 h-32 w-full rounded-xl border border-yellow-200 object-cover"
            />
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold text-blue-950">Step 3: Explore resources</h2>
            <p className="mt-1 text-xs text-blue-900/75">Access study notes, tutorials, past papers, quizzes, and schedules.</p>
            <img
              src={exploreResourcesImage}
              alt="Learning resources dashboard preview"
              className="mt-4 h-32 w-full rounded-xl border border-blue-200 object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 border-t border-blue-100 bg-blue-50/40 px-6 py-6 sm:flex-row">
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-blue-950 shadow-sm transition hover:bg-yellow-300"
          >
            Create an account <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </div>
  );
}
