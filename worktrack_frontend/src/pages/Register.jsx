import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Building2, UserRoundPlus, UserCheck, ShieldCheck } from 'lucide-react';
import api from '../lib/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    staffIdNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    departmentId: '',
    position: '',
    phone: '',
  });
  const [departments, setDepartments] = useState([]);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/auth/departments')
      .then(({ data }) => setDepartments(data.departments))
      .catch(() => setError('Could not load departments. Please try again.'));
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        fullName: form.fullName,
        staffIdNumber: form.staffIdNumber,
        email: form.email,
        password: form.password,
        departmentId: form.departmentId || null,
        position: form.position,
        phone: form.phone,
      });
      navigate('/login', { state: { registered: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--color-ledger-50)]">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-[var(--color-ledger-950)] text-white p-12 paper-grain">
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
            Staff Self-Registration
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-medium leading-[1.1]">
            Create your own <br /> attendance account.
          </h1>
          <p className="mt-5 text-white/70 leading-relaxed">
            Set up your staff account instantly — pick your department and position held.
            Your account is active as soon as you register; an administrator can deactivate
            or reactivate it at any time.
          </p>

          <div className="mt-8 space-y-3 text-sm text-white/60">
            <div className="flex items-center gap-2.5">
              <UserCheck size={16} className="text-[var(--color-brass-400)]" />
              Active right away — no approval wait
            </div>
            <div className="flex items-center gap-2.5">
              <Building2 size={16} className="text-[var(--color-brass-400)]" />
              Choose your department & position held
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-[var(--color-brass-400)]" />
              Admin review &amp; account control
            </div>
          </div>
        </div>

        <Link to="/login" className="relative z-10 flex items-center gap-2 text-sm text-white/60 hover:text-white transition">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
      </div>

      {/* Right — register form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-10 w-10 rounded-full bg-[var(--color-ledger-900)] flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">WT</span>
            </div>
            <p className="font-display font-semibold text-base">WorkTrack</p>
          </div>

          <h2 className="font-display text-2xl font-semibold text-[var(--color-ink-900)]">Create your staff account</h2>
          <p className="text-sm text-[var(--color-ink-600)] mt-1.5 mb-8">
            Fill in your details and choose your department and position held.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Full name</label>
              <input
                required
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                placeholder="e.g. Adeola Bello"
                className="w-full rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20 focus:border-[var(--color-ledger-900)] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Staff ID</label>
              <input
                required
                value={form.staffIdNumber}
                onChange={(e) => set('staffIdNumber', e.target.value)}
                placeholder="e.g. ILG-2026-001"
                className="w-full rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20 focus:border-[var(--color-ledger-900)] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Work email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@ikorodulg.gov.ng"
                className="w-full rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20 focus:border-[var(--color-ledger-900)] transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="Min. 6 characters"
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
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Confirm password</label>
                <input
                  required
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20 focus:border-[var(--color-ledger-900)] transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Department</label>
                <select
                  required
                  value={form.departmentId}
                  onChange={(e) => set('departmentId', e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20 focus:border-[var(--color-ledger-900)] transition"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Position held</label>
                <input
                  required
                  value={form.position}
                  onChange={(e) => set('position', e.target.value)}
                  placeholder="e.g. Admin Officer II"
                  className="w-full rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20 focus:border-[var(--color-ledger-900)] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Phone (optional)</label>
              <input
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20 focus:border-[var(--color-ledger-900)] transition"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-[var(--color-status-absent-soft)] text-[var(--color-status-absent)] text-sm px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-ledger-900)] text-white font-medium py-2.5 hover:bg-[var(--color-ledger-800)] transition disabled:opacity-60"
            >
              <UserRoundPlus size={16} />
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--color-ink-600)] text-center">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[var(--color-ledger-900)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}