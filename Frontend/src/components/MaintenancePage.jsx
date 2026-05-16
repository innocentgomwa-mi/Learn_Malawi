import React from 'react';

export default function MaintenancePage({ message }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 shadow-lg">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Maintenance Mode</h1>
        <p className="text-lg text-slate-600 mb-6">The platform is currently unavailable while we perform updates.</p>
        <div className="rounded-2xl bg-slate-100 p-6 text-left">
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">Message for users</p>
          <p className="text-base text-slate-800">{message || "We'll be back shortly. Thank you for your patience."}</p>
        </div>
      </div>
    </div>
  );
}
