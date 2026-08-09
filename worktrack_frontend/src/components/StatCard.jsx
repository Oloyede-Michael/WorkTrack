export default function StatCard({ label, value, sublabel, icon: Icon, accent = 'ledger', trend }) {
  const accents = {
    ledger: 'bg-[var(--color-ledger-900)] text-white',
    brass: 'bg-[var(--color-brass-500)] text-[var(--color-ink-900)]',
    productive: 'bg-[var(--color-status-productive)] text-white',
    partial: 'bg-[var(--color-status-partial)] text-white',
    absent: 'bg-[var(--color-status-absent)] text-white',
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-ledger-100)] p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-400)]">{label}</p>
          <p className="font-display text-3xl font-semibold mt-1.5 text-[var(--color-ink-900)]">{value}</p>
          {sublabel && <p className="text-xs text-[var(--color-ink-600)] mt-1">{sublabel}</p>}
        </div>
        {Icon && (
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${accents[accent]}`}>
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
      </div>
      {trend && <div className="mt-3 text-xs font-medium text-[var(--color-ink-600)]">{trend}</div>}
    </div>
  );
}
