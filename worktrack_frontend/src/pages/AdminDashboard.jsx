import { useEffect, useState } from 'react';
import { Users, UserCheck, Clock3, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import api from '../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  const trendData = stats?.trend?.map((t) => ({
    date: new Date(t.work_date).toLocaleDateString('en-GB', { weekday: 'short' }),
    Productive: t.productive,
    Partial: t.partial,
    'Non-Productive': t.non_productive,
  })) || [];

  const deptData = stats?.departmentBreakdown?.map((d) => ({
    name: d.department.length > 12 ? d.department.slice(0, 12) + '…' : d.department,
    Present: d.present_count,
    Productive: d.productive_count,
    Total: d.staff_count,
  })) || [];

  return (
    <DashboardLayout>
      {({ openSidebar }) => (
        <>
          <Topbar title="Command Overview" subtitle="Real-time attendance across the Secretariat" onMenuClick={openSidebar} />

          <main className="p-4 md:p-8 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Staff" value={loading ? '—' : stats.totalStaff} icon={Users} accent="ledger" />
              <StatCard label="Present Today" value={loading ? '—' : stats.present} sublabel={loading ? '' : `${stats.absent} absent`} icon={UserCheck} accent="productive" />
              <StatCard label="Late / Half-Day" value={loading ? '—' : stats.late + stats.halfDay} icon={Clock3} accent="partial" />
              <StatCard label="Productive Today" value={loading ? '—' : stats.productiveToday} icon={TrendingUp} accent="brass" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[var(--color-ledger-100)] p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--color-ink-900)] mb-1">7-Day Productivity Trend</h3>
                <p className="text-xs text-[var(--color-ink-400)] mb-4">Daily breakdown across the Secretariat</p>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2F7D52" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#2F7D52" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4E9DE" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#7c8377' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#7c8377' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E4E9DE', fontSize: 13 }} />
                    <Area type="monotone" dataKey="Productive" stroke="#2F7D52" fill="url(#prodGrad)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl border border-[var(--color-ledger-100)] p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--color-ink-900)] mb-1">Department Snapshot</h3>
                <p className="text-xs text-[var(--color-ink-400)] mb-4">Present vs. total staff, today</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4E9DE" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7c8377' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#7c8377' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E4E9DE', fontSize: 13 }} />
                    <Bar dataKey="Total" fill="#E4E9DE" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Present" fill="#C89B3C" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Productive" fill="#0F3D2E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--color-ledger-100)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-ledger-100)]">
                <h3 className="font-display text-lg font-semibold text-[var(--color-ink-900)]">Department Breakdown — Today</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--color-ledger-50)] text-left text-[11px] uppercase tracking-wide text-[var(--color-ink-400)]">
                      <th className="px-6 py-3 font-medium">Department</th>
                      <th className="px-6 py-3 font-medium">Staff</th>
                      <th className="px-6 py-3 font-medium">Present</th>
                      <th className="px-6 py-3 font-medium">Productive</th>
                      <th className="px-6 py-3 font-medium">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-ledger-100)]">
                    {stats?.departmentBreakdown?.map((d) => (
                      <tr key={d.department} className="hover:bg-[var(--color-ledger-50)]/60">
                        <td className="px-6 py-3.5 font-medium text-[var(--color-ink-900)]">{d.department}</td>
                        <td className="px-6 py-3.5 text-[var(--color-ink-600)]">{d.staff_count}</td>
                        <td className="px-6 py-3.5 text-[var(--color-ink-600)]">{d.present_count}</td>
                        <td className="px-6 py-3.5 text-[var(--color-ink-600)]">{d.productive_count}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 rounded-full bg-[var(--color-ledger-100)] overflow-hidden">
                              <div
                                className="h-full bg-[var(--color-ledger-900)]"
                                style={{ width: `${d.staff_count ? (d.present_count / d.staff_count) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-[var(--color-ink-600)]">
                              {d.staff_count ? Math.round((d.present_count / d.staff_count) * 100) : 0}%
                            </span>
                          </div>
                        </td>
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
