import { Link } from 'react-router-dom';
import {
  Clock3,
  ShieldCheck,
  UserCheck,
  UserX,
  Fingerprint,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Home,
} from 'lucide-react';

const features = [
  {
    icon: Fingerprint,
    title: 'Check in from anywhere',
    desc: 'One-tap clock-in and clock-out, no location restrictions — perfect for remote and field staff or for trying the system from your desk.',
  },
  {
    icon: Clock3,
    title: 'Government work hours',
    desc: 'Automatic on-time, late, and half-day classification against the 8:00 AM – 4:00 PM official work windows.',
  },
  {
    icon: BarChart3,
    title: 'Daily productivity scoring',
    desc: 'Every day is scored Productive, Partial, or Non-Productive so trends are visible at a glance across all departments.',
  },
  {
    icon: ShieldCheck,
    title: 'Admin oversight',
    desc: 'Admins review every account, and can activate, deactivate or permanently delete staff records as they choose.',
  },
];

const steps = [
  { n: '01', title: 'Create your account', desc: 'Sign up with your work email, then pick your department and position held.' },
  { n: '02', title: 'Sign in & clock in', desc: 'Record your check-in and check-out each work day in seconds.' },
  { n: '03', title: 'Admins verify', desc: 'Management reviews accounts and can deactivate, reactivate or delete any staff member.' },
];

const workRules = [
  { label: '≤ 8:00 AM', desc: 'On time' },
  { label: '8:01 – 9:00 AM', desc: 'Marked late' },
  { label: 'After 9:00 AM', desc: 'Half-day flagged' },
  { label: 'Before 4:00 PM', desc: 'Early exit' },
  { label: '≥ 4:00 PM', desc: 'Standard exit' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-ledger-50)] text-[var(--color-ink-900)]">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-[var(--color-ledger-50)]/90 backdrop-blur border-b border-[var(--color-ledger-100)]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--color-brass-500)] flex items-center justify-center">
              <span className="font-display font-bold text-[var(--color-ledger-950)]">WT</span>
            </div>
            <div>
              <p className="font-display font-semibold text-base leading-tight">WorkTrack</p>
              <p className="text-[10px] text-[var(--color-ink-600)] uppercase tracking-wide">Ikorodu LG Secretariat</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--color-ink-600)]">
            <a href="#features" className="hover:text-[var(--color-ink-900)]">Features</a>
            <a href="#how" className="hover:text-[var(--color-ink-900)]">How it works</a>
            <a href="#rules" className="hover:text-[var(--color-ink-900)]">Work hours</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link to="/login" className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-ink-900)] hover:bg-[var(--color-ledger-100)] transition">
              Sign in
            </Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-ledger-900)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--color-ledger-800)] transition">
              Create account <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--color-ledger-950)] text-white">
        <div
          className="pointer-events-none absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--color-brass-500), transparent 70%)' }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-28 grid md:grid-cols-[1.2fr_1fr] gap-12 items-center paper-grain">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-brass-300)] mb-4">
              Official Staff Attendance Register
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-medium leading-[1.05]">
              Every clock-in,
              <br />
              <span className="text-[var(--color-brass-400)]">accounted for.</span>
            </h1>
            <p className="mt-6 max-w-lg text-white/70 leading-relaxed">
              WorkTrack keeps an accurate, GPS-free daily attendance register for the Ikorodu
              Local Government Secretariat. Staff check in from anywhere, and admins get a live,
              reviewable register with one-click deactivation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brass-500)] text-[var(--color-ledger-950)] px-6 py-3 text-sm font-semibold hover:bg-[var(--color-brass-400)] transition"
              >
                Create staff account <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 text-white px-6 py-3 text-sm font-medium hover:bg-white/10 transition"
              >
                Sign in
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                ['5+', 'Departments'],
                ['Live', 'Daily register'],
                ['0', 'Geofence limits'],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-semibold text-[var(--color-brass-400)]">{v}</p>
                  <p className="text-xs text-white/50 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="rounded-3xl bg-white/[0.06] border border-white/15 backdrop-blur p-6 shadow-2xl shadow-black/30">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-brass-300)] mb-4">Today's Duty Stamp</p>
              <div className="font-mono text-5xl font-semibold tabular-nums">
                {new Date().toLocaleTimeString('en-GB', { hour12: false })}
              </div>
              <div className="mt-5 space-y-3 text-sm">
                {[
                  ['Check-in', '08:02 — on time'],
                  ['Check-out', '16:00 — standard'],
                  ['Productivity', 'Productive'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                    <span className="text-white/50">{k}</span>
                    <span className="font-mono text-white">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-brass-500)] text-[var(--color-ledger-950)] py-3 font-semibold text-sm">
                <Fingerprint size={16} /> Stamp verified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-brass-600)] mb-3">Features</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold">Built for trusts, not just time.</h2>
          <p className="mt-3 text-[var(--color-ink-600)] leading-relaxed">
            Simple enough for every staff member, strict enough for the HR office.
          </p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-[var(--color-ledger-100)] p-6 hover:shadow-lg hover:-translate-y-0.5 transition">
              <div className="h-10 w-10 rounded-xl bg-[var(--color-ledger-100)] text-[var(--color-ledger-800)] flex items-center justify-center mb-4">
                <f.icon size={19} />
              </div>
              <h3 className="font-display font-semibold text-[var(--color-ink-900)]">{f.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-ink-600)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white border-y border-[var(--color-ledger-100)]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-brass-600)] mb-3">How it works</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">Three steps to an accurate register.</h2>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-[var(--color-ledger-100)] bg-[var(--color-ledger-50)] p-6">
                <span className="font-display text-4xl font-semibold text-[var(--color-brass-400)]">{s.n}</span>
                <h3 className="font-display mt-3 text-lg font-semibold text-[var(--color-ink-900)]">{s.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-ink-600)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work hours rules */}
      <section id="rules" className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-brass-600)] mb-3">Work-hour rules</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">The government clock, enforced.</h2>
            <p className="mt-3 text-[var(--color-ink-600)] leading-relaxed">
              A day is scored Productive only when you check in by 8:00 AM and check out at or
              after 4:00 PM — a full 8-hour work day.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-[var(--color-ink-600)]">
                <CheckCircle2 size={16} className="text-[var(--color-status-productive)]" /> Fully productive days roll into department analytics
              </li>
              <li className="flex items-center gap-2.5 text-sm text-[var(--color-ink-600)]">
                <UserCheck size={16} className="text-[var(--color-ledger-700)]" /> Late or early exits are flagged as partial
              </li>
              <li className="flex items-center gap-2.5 text-sm text-[var(--color-ink-600)]">
                <UserX size={16} className="text-[var(--color-status-absent)]" /> Admins can deactivate, reactivate or delete accounts
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--color-ledger-100)] p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold mb-4">Classification windows</h3>
            <div className="space-y-2">
              {workRules.map((r) => (
                <div key={r.label} className="flex items-center justify-between rounded-xl bg-[var(--color-ledger-50)] px-4 py-3 text-sm">
                  <span className="font-mono font-medium text-[var(--color-ink-900)]">{r.label}</span>
                  <span className="text-[var(--color-ink-600)]">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
        <div className="rounded-3xl bg-[var(--color-ledger-950)] text-white p-8 md:p-12 text-center relative overflow-hidden paper-grain">
          <div
            className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, var(--color-brass-500), transparent 70%)' }}
          />
          <div className="relative z-10 max-w-xl mx-auto">
            <Home size={22} className="mx-auto text-[var(--color-brass-400)]" />
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3">Start recording attendance today</h2>
            <p className="mt-3 text-white/70">
              Create your staff account in under a minute, pick your department, and clock in on your next shift.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brass-500)] text-[var(--color-ledger-950)] px-6 py-3 text-sm font-semibold hover:bg-[var(--color-brass-400)] transition">
                Create account <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-white/20 text-white px-6 py-3 text-sm font-medium hover:bg-white/10 transition">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-ledger-100)] bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-ink-600)]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[var(--color-brass-500)] flex items-center justify-center">
              <span className="font-display font-bold text-[var(--color-ledger-950)] text-xs">WT</span>
            </div>
            <span>WorkTrack · Ikorodu Local Government Secretariat</span>
          </div>
          <p className="text-xs text-[var(--color-ink-400)]">Staff attendance management · 8:00 AM – 4:00 PM work hours</p>
        </div>
      </footer>
    </div>
  );
}