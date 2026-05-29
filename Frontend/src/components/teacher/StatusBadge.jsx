export default function StatusBadge({ status = 'published' }) {
  const normalized = String(status || 'published').toLowerCase();
  const statusMap = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-blue-100 text-blue-700',
    published: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-700',
  };
  const label = normalized === 'approved' ? 'Approved' : normalized === 'published' ? 'Published' : normalized === 'rejected' ? 'Rejected' : 'Pending';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusMap[normalized] ?? 'bg-slate-100 text-slate-700'}`}>
      {label}
    </span>
  );
}
