import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Clock3, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const registeredEmail = location.state?.registered;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Please check your details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[var(--color-ledger-50)]">
      {/* Left — brand hero */}
      <div className="hidden md:flex flex-col justify-between relative overflow-hidden bg-[var(--color-ledger-950)] text-white p-12 paper-grain">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--color-brass-500), transparent 70%)' }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-[var(--color-brass-500)] flex items-center justify-center">
            <span className="font-display font-bold text-[var(--color-ledger-950)]">WT</span>
          </div>
          <div>
            <p className="font-display font-semibold text-lg leading-tight">WorkTrack</p>
            <p className="text-[11px] text-white/50 uppercase tracking-wide">Ikorodu Local Government Secretariat</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-brass-300)] mb-4">
            Official Staff Attendance Register
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-medium leading-[1.1]">
            Every clock-in, <br /> accounted for.
          </h1>
          <p className="mt-5 text-white/70 leading-relaxed">
            Sign in to record your daily attendance and keep an
            accurate register for the Secretariat — check in from anywhere.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-3 text-sm text-white/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-[var(--color-brass-400)]" />
            Self-registration open to all staff
          </div>
          <div className="flex items-center gap-2.5">
            <Clock3 size={16} className="text-[var(--color-brass-400)]" />
            8:00 AM – 4:00 PM government work hours enforced
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-[var(--color-brass-400)]" />
            No location restrictions — check in from anywhere
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="md:hidden flex items-center gap-2.5 mb-8">
            <div className="h-10 w-10 rounded-full bg-[var(--color-ledger-900)] flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">WT</span>
            </div>
            <div>
              <p className="font-display font-semibold text-base leading-tight">WorkTrack</p>
              <p className="text-[10px] text-[var(--color-ink-600)] uppercase tracking-wide">Ikorodu LG Secretariat</p>
            </div>
          </div>

          <h2 className="font-display text-2xl font-semibold text-[var(--color-ink-900)]">Sign in to your account</h2>
          <p className="text-sm text-[var(--color-ink-600)] mt-1.5 mb-8">
            Use the email and password for your staff account.
          </p>

          {registeredEmail && (
            <div className="mb-6 rounded-xl bg-[var(--color-status-productive-soft)] text-[var(--color-status-productive)] text-sm px-4 py-3 flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>
                Account created for <strong>{registeredEmail}</strong>. You can now sign in.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ikorodulg.gov.ng"
                className="w-full rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20 focus:border-[var(--color-ledger-900)] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20 focus:border-[var(--color-ledger-900)] transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-400)] hover:text-[var(--color-ink-900)]"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-[var(--color-status-absent-soft)] text-[var(--color-status-absent)] text-sm px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--color-ledger-900)] text-white font-medium py-2.5 hover:bg-[var(--color-ledger-800)] transition disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 rounded-xl bg-[var(--color-ledger-100)]/60 border border-[var(--color-ledger-100)] px-4 py-3 text-xs text-[var(--color-ink-600)] leading-relaxed">
            <span className="font-semibold text-[var(--color-ink-900)]">Demo accounts —</span> Admin:
            admin@ikorodulg.gov.ng / Admin@123 &nbsp;·&nbsp; Staff: adeola.bello@ikorodulg.gov.ng / Staff@123
          </div>

          <p className="mt-6 text-sm text-[var(--color-ink-600)] text-center">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[var(--color-ledger-900)] hover:underline">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
