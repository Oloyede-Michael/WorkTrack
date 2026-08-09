import { Menu } from 'lucide-react';

export default function Topbar({ title, subtitle, onMenuClick, right }) {
  return (
    <header className="sticky top-0 z-30 bg-[var(--color-ledger-50)]/90 backdrop-blur border-b border-[var(--color-ledger-100)] px-4 md:px-8 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="md:hidden text-[var(--color-ink-900)]">
          <Menu size={22} />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-xl md:text-2xl font-semibold text-[var(--color-ink-900)] truncate">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--color-ink-600)] truncate">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}
