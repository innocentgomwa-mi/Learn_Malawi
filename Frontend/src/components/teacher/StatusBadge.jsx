export default function StatusBadge({ status = 'pending' }) {
  const normalized = String(status || 'pending').toLowerCase();
  const statusMap = {
    pending: 'bg-amber-100 text-amber-700',
<<<<<<< HEAD
    uploaded: 'bg-slate-100 text-slate-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  };
  const label = normalized === 'approved'
    ? 'Approved'
    : normalized === 'rejected'
      ? 'Rejected'
      : normalized === 'uploaded'
        ? 'Uploaded'
        : 'Pending';
=======
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  };
  const label = normalized === 'approved' ? 'Approved' : normalized === 'rejected' ? 'Rejected' : 'Pending';
>>>>>>> 4174fba (changes to admin dashboard)

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusMap[normalized] ?? 'bg-slate-100 text-slate-700'}`}>
      {label}
    </span>
  );
}
