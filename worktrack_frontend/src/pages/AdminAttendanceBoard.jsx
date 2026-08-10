import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, PenSquare, MapPinOff, MapPin } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Topbar from '../components/Topbar';
import StatusBadge from '../components/StatusBadge';
import api from '../lib/api';

function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function localDateString(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

const FILTERS = [
  { key: 'all', label: 'All Staff' },
  { key: 'present', label: 'Present' },
  { key: 'late', label: 'Late' },
  { key: 'productive', label: 'Productive Today' },
  { key: 'absent', label: 'Absent' },
];

function OverrideModal({ record, onClose, onSaved }) {
  const [checkInTime, setCheckInTime] = useState(record.check_in_time ? new Date(record.check_in_time).toISOString().slice(0, 16) : '');
  const [checkOutTime, setCheckOutTime] = useState(record.check_out_time ? new Date(record.check_out_time).toISOString().slice(0, 16) : '');
  const [reason, setReason] = useState(record.override_reason || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const today = localDateString();

  async function handleSave() {
    if (!reason.trim()) {
      setError('A reason is required for official off-site assignment overrides.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/admin/override', {
        staffId: record.staff_id,
        workDate: today,
        checkInTime: checkInTime ? new Date(checkInTime).toISOString() : null,
        checkOutTime: checkOutTime ? new Date(checkOutTime).toISOString() : null,
        reason: reason.trim(),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save override.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg font-semibold text-[var(--color-ink-900)]">Manual Attendance Override</h3>
        <p className="text-sm text-[var(--color-ink-600)] mt-1 mb-5">
          {record.full_name} · {record.staff_id_number}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Check-in time</label>
            <input
              type="datetime-local"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-ledger-100)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Check-out time</label>
            <input
              type="datetime-local"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-ledger-100)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Reason for override</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Official off-site field assignment approved by supervisor"
              className="w-full rounded-xl border border-[var(--color-ledger-100)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20"
            />
          </div>
          {error && <p className="text-sm text-[var(--color-status-absent)]">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 rounded-xl border border-[var(--color-ledger-100)] py-2.5 text-sm font-medium text-[var(--color-ink-900)] hover:bg-[var(--color-ledger-50)]">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-[var(--color-ledger-900)] text-white py-2.5 text-sm font-medium hover:bg-[var(--color-ledger-800)] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Override'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAttendanceBoard() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overrideTarget, setOverrideTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/admin/attendance-board', { params: { filter, search } })
      .then(({ data }) => setRecords(data.records))
      .finally(() => setLoading(false));
  }, [filter, search]);

  useEffect(() => {
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [load]);

  return (
    <DashboardLayout>
      {({ openSidebar }) => (
        <>
          <Topbar title="Daily Attendance Board" subtitle="Live register for today, across all departments" onMenuClick={openSidebar} />

          <main className="p-4 md:p-8 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-400)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search staff name or ID…"
                  className="w-full rounded-xl border border-[var(--color-ledger-100)] bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <SlidersHorizontal size={15} className="text-[var(--color-ink-400)] mr-1" />
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                      filter === f.key
                        ? 'bg-[var(--color-ledger-900)] text-white'
                        : 'bg-white border border-[var(--color-ledger-100)] text-[var(--color-ink-600)] hover:border-[var(--color-ledger-900)]/30'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--color-ledger-100)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--color-ledger-50)] text-left text-[11px] uppercase tracking-wide text-[var(--color-ink-400)]">
                      <th className="px-6 py-3 font-medium">Staff</th>
                      <th className="px-6 py-3 font-medium">Department</th>
                      <th className="px-6 py-3 font-medium">Check-In</th>
                      <th className="px-6 py-3 font-medium">Check-Out</th>
                      <th className="px-6 py-3 font-medium">Location</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-ledger-100)]">
                    {loading && (
                      <tr><td colSpan={7} className="px-6 py-10 text-center text-[var(--color-ink-400)]">Loading register…</td></tr>
                    )}
                    {!loading && records.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-10 text-center text-[var(--color-ink-400)]">No staff match this filter.</td></tr>
                    )}
                    {!loading && records.map((r) => (
                      <tr key={r.staff_id} className="hover:bg-[var(--color-ledger-50)]/60">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[var(--color-ledger-100)] flex items-center justify-center text-xs font-semibold text-[var(--color-ledger-900)] shrink-0">
                              {r.full_name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[var(--color-ink-900)] truncate">{r.full_name}</p>
                              <p className="text-xs text-[var(--color-ink-400)] font-mono">{r.staff_id_number}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-[var(--color-ink-600)]">{r.department || '—'}</td>
                        <td className="px-6 py-3.5 font-mono text-[var(--color-ink-600)]">{fmtTime(r.check_in_time)}</td>
                        <td className="px-6 py-3.5 font-mono text-[var(--color-ink-600)]">{fmtTime(r.check_out_time)}</td>
                        <td className="px-6 py-3.5">
                          {r.check_in_time ? (
                            r.location_verified ? (
                              <span className="inline-flex items-center gap-1 text-xs text-[var(--color-status-productive)]"><MapPin size={13} /> Verified</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-[var(--color-status-absent)]"><MapPinOff size={13} /> Unverified</span>
                            )
                          ) : (
                            <span className="text-xs text-[var(--color-ink-400)]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={r.check_in_time ? r.productivity_status : 'absent'} size="sm" />
                          {r.is_override && <span className="ml-1.5 text-[10px] text-[var(--color-brass-600)] font-medium">Override</span>}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => setOverrideTarget(r)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ledger-900)] hover:text-[var(--color-brass-600)]"
                          >
                            <PenSquare size={13} /> Override
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>

          {overrideTarget && (
            <OverrideModal record={overrideTarget} onClose={() => setOverrideTarget(null)} onSaved={load} />
          )}
        </>
      )}
    </DashboardLayout>
  );
}
