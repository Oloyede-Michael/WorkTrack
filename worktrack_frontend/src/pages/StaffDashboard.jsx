import { useEffect, useState, useCallback } from 'react';
import { Unlock, LogIn, LogOut, CheckCircle2, AlertTriangle, Flame } from 'lucide-react';
import Topbar from '../components/Topbar';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function MiniCalendar({ records, month, year }) {
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDow = first.getDay();
  const byDate = Object.fromEntries(records.map((r) => [new Date(r.work_date).getDate(), r]));
  const cells = [...Array(startDow).fill(null), ...Array(daysInMonth).fill(0).map((_, i) => i + 1)];

  const colorFor = (status) => {
    if (status === 'productive') return 'bg-[var(--color-status-productive)] text-white';
    if (status === 'partial') return 'bg-[var(--color-status-partial)] text-white';
    if (status === 'non_productive' || status === 'absent') return 'bg-[var(--color-status-absent)] text-white';
    return 'text-[var(--color-ink-600)]';
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-2 text-[11px] font-medium text-[var(--color-ink-400)] uppercase">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const rec = byDate[day];
          const isToday = new Date().getDate() === day && new Date().getMonth() + 1 === month && new Date().getFullYear() === year;
          return (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                rec ? colorFor(rec.productivity_status) : 'bg-[var(--color-ledger-50)] border border-[var(--color-ledger-100)]'
              } ${isToday ? 'ring-2 ring-[var(--color-brass-500)] ring-offset-1' : ''}`}
              title={rec ? rec.productivity_status : 'No record'}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-4 text-[11px] text-[var(--color-ink-600)]">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[var(--color-status-productive)]" />Productive</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[var(--color-status-partial)]" />Late / Early Exit</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[var(--color-status-absent)]" />Absent</span>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, historyRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/history', { params: { month: now.getMonth() + 1, year: now.getFullYear(), limit: 31 } }),
      ]);
      setToday(todayRes.data.record);
      setHistory(historyRes.data.records);
      setSummary(historyRes.data.summary);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCheckIn() {
    setMessage(null);
    setBusy(true);
    try {
      const { data } = await api.post('/attendance/check-in', {});
      setToday(data.record);
      setMessage({ type: 'success', text: data.message });
      load();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Could not check in.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckOut() {
    setMessage(null);
    setBusy(true);
    try {
      const { data } = await api.post('/attendance/check-out');
      setToday(data.record);
      setMessage({ type: 'success', text: data.message });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Could not check out.' });
    } finally {
      setBusy(false);
    }
  }

  const hasCheckedIn = !!today?.check_in_time;
  const hasCheckedOut = !!today?.check_out_time;

  return (
    <DashboardLayout>
      {({ openSidebar }) => (
        <>
          <Topbar
            title={`Welcome, ${user?.fullName?.split(' ')[0] || 'Staff'}`}
            subtitle={now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            onMenuClick={openSidebar}
          />

          <main className="p-4 md:p-8 space-y-6">
            {/* Check-in hero panel */}
            <div className="rounded-3xl bg-[var(--color-ledger-950)] text-white p-6 md:p-8 relative overflow-hidden paper-grain">
              <div
                className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, var(--color-brass-500), transparent 70%)' }}
              />
              <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-8 items-center">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-brass-300)] mb-2">Today's Duty Stamp</p>
                  <div className="font-mono text-4xl md:text-5xl font-semibold tabular-nums">
                    {now.toLocaleTimeString('en-GB', { hour12: false })}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
                    <span>Check-in: <strong className="font-mono">{fmtTime(today?.check_in_time)}</strong></span>
                    <span>Check-out: <strong className="font-mono">{fmtTime(today?.check_out_time)}</strong></span>
                    {today?.productivity_status && <StatusBadge status={today.productivity_status} />}
                  </div>
                  {message && (
                    <div
                      className={`mt-4 max-w-md rounded-xl px-4 py-2.5 text-sm flex items-start gap-2 ${
                        message.type === 'success' ? 'bg-white/10 text-white' : 'bg-[var(--color-status-absent)]/90 text-white'
                      }`}
                    >
                      {message.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
                      {message.text}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-3">
                  {!hasCheckedIn && (
                    <button
                      onClick={handleCheckIn}
                      disabled={busy}
                      className="group h-32 w-32 rounded-full bg-[var(--color-brass-500)] text-[var(--color-ledger-950)] flex flex-col items-center justify-center gap-1.5 font-semibold shadow-lg shadow-black/30 hover:bg-[var(--color-brass-400)] active:animate-stamp transition disabled:opacity-60"
                    >
                      <LogIn size={24} />
                      <span className="text-sm">{busy ? 'Checking…' : 'Check In'}</span>
                    </button>
                  )}
                  {hasCheckedIn && !hasCheckedOut && (
                    <button
                      onClick={handleCheckOut}
                      disabled={busy}
                      className="group h-32 w-32 rounded-full bg-white text-[var(--color-ledger-950)] flex flex-col items-center justify-center gap-1.5 font-semibold shadow-lg shadow-black/30 hover:bg-white/90 active:animate-stamp transition disabled:opacity-60"
                    >
                      <LogOut size={24} />
                      <span className="text-sm">{busy ? 'Saving…' : 'Check Out'}</span>
                    </button>
                  )}
                  {hasCheckedIn && hasCheckedOut && (
                    <div className="h-32 w-32 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex flex-col items-center justify-center gap-1.5 text-white/70">
                      <CheckCircle2 size={24} />
                      <span className="text-sm text-center px-2">Day complete</span>
                    </div>
                  )}
                  <p className="text-[11px] text-white/50 flex items-center gap-1.5">
                    <Unlock size={12} /> No location restrictions — check in from anywhere
                  </p>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Productive Days" value={summary?.productive ?? '—'} sublabel="This month" icon={Flame} accent="productive" />
              <StatCard label="Partial Days" value={summary?.partial ?? '—'} sublabel="Late or early exit" accent="partial" />
              <StatCard label="Absences" value={summary?.absent ?? '—'} sublabel="This month" accent="absent" />
              <StatCard label="Total Hours" value={summary?.total_hours ? Number(summary.total_hours).toFixed(1) : '0.0'} sublabel="Logged this month" accent="brass" />
            </div>

            {/* Calendar + info */}
            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
              <div className="bg-white rounded-2xl border border-[var(--color-ledger-100)] p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--color-ink-900)] mb-4">
                  {now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} Attendance
                </h3>
                {loading ? (
                  <div className="h-64 flex items-center justify-center text-[var(--color-ink-400)] text-sm">Loading calendar…</div>
                ) : (
                  <MiniCalendar records={history} month={now.getMonth() + 1} year={now.getFullYear()} />
                )}
              </div>

              <div className="bg-white rounded-2xl border border-[var(--color-ledger-100)] p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--color-ink-900)] mb-4">Government Work-Hour Rules</h3>
                <ul className="space-y-3 text-sm text-[var(--color-ink-600)]">
                  <li className="flex gap-3"><span className="font-mono text-[var(--color-ink-900)] shrink-0">≤ 08:00</span> Check in on time</li>
                  <li className="flex gap-3"><span className="font-mono text-[var(--color-ink-900)] shrink-0">08:01–09:00</span> Marked late</li>
                  <li className="flex gap-3"><span className="font-mono text-[var(--color-ink-900)] shrink-0">&gt; 09:00</span> Half-day flagged</li>
                  <li className="flex gap-3"><span className="font-mono text-[var(--color-ink-900)] shrink-0">&lt; 16:00</span> Early exit on check-out</li>
                  <li className="flex gap-3"><span className="font-mono text-[var(--color-ink-900)] shrink-0">≥ 16:00</span> Standard exit</li>
                </ul>
                <div className="mt-5 pt-5 border-t border-[var(--color-ledger-100)] text-xs text-[var(--color-ink-600)] leading-relaxed">
                  A day is marked <strong className="text-[var(--color-status-productive)]">Productive</strong> only when you check in by
                  8:00 AM <em>and</em> check out at or after 4:00 PM — 8 full work hours completed.
                </div>
              </div>
            </div>
          </main>
        </>
      )}
    </DashboardLayout>
  );
}
