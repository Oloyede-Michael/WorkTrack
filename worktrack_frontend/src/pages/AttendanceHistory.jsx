import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Topbar from '../components/Topbar';
import StatusBadge from '../components/StatusBadge';
import api from '../lib/api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
}

export default function AttendanceHistory() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/attendance/history', { params: { month, year, limit: 31 } })
      .then(({ data }) => {
        setRecords(data.records);
        setSummary(data.summary);
      })
      .finally(() => setLoading(false));
  }, [month, year]);

  return (
    <DashboardLayout>
      {({ openSidebar }) => (
        <>
          <Topbar title="Attendance History" subtitle="Your complete check-in / check-out record" onMenuClick={openSidebar} />

          <main className="p-4 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20"
              >
                {[now.getFullYear(), now.getFullYear() - 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {summary && (
                <div className="flex flex-wrap gap-4 ml-auto text-sm">
                  <span className="text-[var(--color-status-productive)] font-medium">{summary.productive} Productive</span>
                  <span className="text-[var(--color-status-partial)] font-medium">{summary.partial} Partial</span>
                  <span className="text-[var(--color-status-absent)] font-medium">{summary.absent} Absent</span>
                  <span className="text-[var(--color-ink-600)] font-medium">{Number(summary.total_hours || 0).toFixed(1)}h total</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[var(--color-ledger-100)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--color-ledger-50)] text-left text-[11px] uppercase tracking-wide text-[var(--color-ink-400)]">
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Check-In</th>
                      <th className="px-5 py-3 font-medium">Check-Out</th>
                      <th className="px-5 py-3 font-medium">Hours</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-ledger-100)]">
                    {loading && (
                      <tr><td colSpan={5} className="px-5 py-10 text-center text-[var(--color-ink-400)]">Loading records…</td></tr>
                    )}
                    {!loading && records.length === 0 && (
                      <tr><td colSpan={5} className="px-5 py-10 text-center text-[var(--color-ink-400)]">No attendance records for this period.</td></tr>
                    )}
                    {!loading && records.map((r) => (
                      <tr key={r.id} className="hover:bg-[var(--color-ledger-50)]/60">
                        <td className="px-5 py-3.5 font-medium text-[var(--color-ink-900)]">{fmtDate(r.work_date)}</td>
                        <td className="px-5 py-3.5 font-mono text-[var(--color-ink-600)]">{fmtTime(r.check_in_time)}</td>
                        <td className="px-5 py-3.5 font-mono text-[var(--color-ink-600)]">{fmtTime(r.check_out_time)}</td>
                        <td className="px-5 py-3.5 font-mono text-[var(--color-ink-600)]">{r.hours_worked ? Number(r.hours_worked).toFixed(1) : '0.0'}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={r.productivity_status} size="sm" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </>
      )}
    </DashboardLayout>
  );
}
