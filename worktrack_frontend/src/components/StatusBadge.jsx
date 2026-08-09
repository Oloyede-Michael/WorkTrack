const CONFIG = {
  productive: { label: 'Productive', dot: 'bg-[var(--color-status-productive)]', text: 'text-[var(--color-status-productive)]', bg: 'bg-[var(--color-status-productive-soft)]' },
  partial: { label: 'Partial', dot: 'bg-[var(--color-status-partial)]', text: 'text-[var(--color-status-partial)]', bg: 'bg-[var(--color-status-partial-soft)]' },
  non_productive: { label: 'Non-Productive', dot: 'bg-[var(--color-status-absent)]', text: 'text-[var(--color-status-absent)]', bg: 'bg-[var(--color-status-absent-soft)]' },
  absent: { label: 'Absent', dot: 'bg-[var(--color-status-absent)]', text: 'text-[var(--color-status-absent)]', bg: 'bg-[var(--color-status-absent-soft)]' },
  on_time: { label: 'On Time', dot: 'bg-[var(--color-status-productive)]', text: 'text-[var(--color-status-productive)]', bg: 'bg-[var(--color-status-productive-soft)]' },
  late: { label: 'Late', dot: 'bg-[var(--color-status-partial)]', text: 'text-[var(--color-status-partial)]', bg: 'bg-[var(--color-status-partial-soft)]' },
  half_day: { label: 'Half-Day', dot: 'bg-[var(--color-status-absent)]', text: 'text-[var(--color-status-absent)]', bg: 'bg-[var(--color-status-absent-soft)]' },
  early_exit: { label: 'Early Exit', dot: 'bg-[var(--color-status-partial)]', text: 'text-[var(--color-status-partial)]', bg: 'bg-[var(--color-status-partial-soft)]' },
  standard_exit: { label: 'Standard Exit', dot: 'bg-[var(--color-status-productive)]', text: 'text-[var(--color-status-productive)]', bg: 'bg-[var(--color-status-productive-soft)]' },
  present: { label: 'Present', dot: 'bg-[var(--color-status-productive)]', text: 'text-[var(--color-status-productive)]', bg: 'bg-[var(--color-status-productive-soft)]' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const cfg = CONFIG[status] || { label: status || 'Unknown', dot: 'bg-ink-400', text: 'text-ink-600', bg: 'bg-ledger-100' };
  const sizeCls = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${cfg.bg} ${cfg.text} ${sizeCls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
