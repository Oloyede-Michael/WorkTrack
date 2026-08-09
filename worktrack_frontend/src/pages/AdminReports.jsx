import { useEffect, useState } from 'react';
import { Download, FileText, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';
import Topbar from '../components/Topbar';
import api from '../lib/api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AdminReports() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [analytics, setAnalytics] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/reports/department-analytics', { params: { month, year } }),
      api.get('/reports/staff-ranking', { params: { month, year } }),
    ])
      .then(([a, r]) => {
        setAnalytics(a.data.departments);
        setRanking(r.data.ranking);
      })
      .finally(() => setLoading(false));
  }, [month, year]);

  async function handleExport(type) {
    setExporting(type);
    try {
      const res = await api.get(`/reports/export/${type}`, {
        params: { month, year },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `WorkTrack_Attendance_${year}-${String(month).padStart(2, '0')}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting('');
    }
  }

  const chartData = analytics.map((d) => ({
    name: d.department.length > 14 ? d.department.slice(0, 14) + '…' : d.department,
    'Productivity Rate': Number(d.productivity_rate),
  }));

  return (
    <DashboardLayout>
      {({ openSidebar }) => (
        <>
          <Topbar title="Reports & Export" subtitle="Department analytics and monthly summary export" onMenuClick={openSidebar} />

          <main className="p-4 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20"
              >
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20"
              >
                {[now.getFullYear(), now.getFullYear() - 1].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={exporting === 'csv'}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-ledger-100)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-ink-900)] hover:bg-[var(--color-ledger-50)] disabled:opacity-60"
                >
                  <Download size={15} /> {exporting === 'csv' ? 'Exporting…' : 'Export CSV'}
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exporting === 'pdf'}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-ledger-900)] text-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--color-ledger-800)] disabled:opacity-60"
                >
                  <FileText size={15} /> {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
              <div className="bg-white rounded-2xl border border-[var(--color-ledger-100)] p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--color-ink-900)] mb-1">Department Productivity Rate</h3>
                <p className="text-xs text-[var(--color-ink-400)] mb-4">% of days marked productive this month</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4E9DE" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#7c8377' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#20241f' }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E4E9DE', fontSize: 13 }} />
                    <Bar dataKey="Productivity Rate" fill="#0F3D2E" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl border border-[var(--color-ledger-100)] p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={17} className="text-[var(--color-brass-500)]" />
                  <h3 className="font-display text-lg font-semibold text-[var(--color-ink-900)]">Top Performers</h3>
                </div>
                <p className="text-xs text-[var(--color-ink-400)] mb-4">Ranked by productivity rate this month</p>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {ranking.slice(0, 8).map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 py-2 border-b border-[var(--color-ledger-100)] last:border-0">
                      <span className="font-mono text-xs text-[var(--color-ink-400)] w-5">{String(i + 1).padStart(2, '0')}</span>
                      <div className="h-7 w-7 rounded-full bg-[var(--color-ledger-100)] flex items-center justify-center text-[11px] font-semibold text-[var(--color-ledger-900)] shrink-0">
                        {s.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--color-ink-900)] truncate">{s.full_name}</p>
                        <p className="text-xs text-[var(--color-ink-400)] truncate">{s.department || '—'}</p>
                      </div>
                      <span className="text-sm font-semibold text-[var(--color-status-productive)]">{s.productivity_rate}%</span>
                    </div>
                  ))}
                  {!loading && ranking.length === 0 && (
                    <p className="text-sm text-[var(--color-ink-400)] py-6 text-center">No attendance data yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--color-ledger-100)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-ledger-100)]">
                <h3 className="font-display text-lg font-semibold text-[var(--color-ink-900)]">Department Analytics — Full Table</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--color-ledger-50)] text-left text-[11px] uppercase tracking-wide text-[var(--color-ink-400)]">
                      <th className="px-6 py-3 font-medium">Department</th>
                      <th className="px-6 py-3 font-medium">Staff</th>
                      <th className="px-6 py-3 font-medium">Productive</th>
                      <th className="px-6 py-3 font-medium">Partial</th>
                      <th className="px-6 py-3 font-medium">Non-Productive</th>
                      <th className="px-6 py-3 font-medium">Avg. Hours</th>
                      <th className="px-6 py-3 font-medium">Productivity Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-ledger-100)]">
                    {analytics.map((d) => (
                      <tr key={d.department} className="hover:bg-[var(--color-ledger-50)]/60">
                        <td className="px-6 py-3.5 font-medium text-[var(--color-ink-900)]">{d.department}</td>
                        <td className="px-6 py-3.5 text-[var(--color-ink-600)]">{d.staff_count}</td>
                        <td className="px-6 py-3.5 text-[var(--color-status-productive)]">{d.productive}</td>
                        <td className="px-6 py-3.5 text-[var(--color-status-partial)]">{d.partial}</td>
                        <td className="px-6 py-3.5 text-[var(--color-status-absent)]">{d.non_productive}</td>
                        <td className="px-6 py-3.5 text-[var(--color-ink-600)]">{d.avg_hours}h</td>
                        <td className="px-6 py-3.5 font-semibold text-[var(--color-ink-900)]">{d.productivity_rate}%</td>
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
