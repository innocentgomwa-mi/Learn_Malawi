/**
 * @param {{ icon: import('react').ComponentType<{ className?: string }>, title: string, subtitle: string }} props
 */
export default function ResourcePageHero({ icon: Icon, title, subtitle }) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-6 sm:p-8 text-white shadow-sm">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-yellow-400/10" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
      </div>
      <div className="relative">
        <h1 className="mb-2 flex items-center gap-2 font-poppins text-3xl font-bold">
          <Icon className="h-8 w-8 text-yellow-400" />
          {title}
        </h1>
        <p className="max-w-2xl text-blue-100/90">{subtitle}</p>
      </div>
    </div>
  );
}
