import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Pencil, UserX, UserCheck2, Trash2, X } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Topbar from '../components/Topbar';
import api from '../lib/api';

function StaffFormModal({ staff, departments, onClose, onSaved }) {
  const isEdit = !!staff;
  const [form, setForm] = useState({
    fullName: staff?.full_name || '',
    email: staff?.email || '',
    password: '',
    staffIdNumber: staff?.staff_id_number || '',
    departmentId: staff?.department_id || '',
    position: staff?.position || '',
    phone: staff?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/staff/${staff.id}`, {
          fullName: form.fullName,
          departmentId: form.departmentId || null,
          position: form.position,
          phone: form.phone,
          staffIdNumber: form.staffIdNumber,
        });
      } else {
        await api.post('/staff', {
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          staffIdNumber: form.staffIdNumber,
          departmentId: form.departmentId || null,
          position: form.position,
          phone: form.phone,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save staff record.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl w-full max-w-lg p-6 animate-fade-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-semibold text-[var(--color-ink-900)]">
            {isEdit ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h3>
          <button type="button" onClick={onClose} className="text-[var(--color-ink-400)] hover:text-[var(--color-ink-900)]">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Full name</label>
            <input required value={form.fullName} onChange={(e) => set('fullName', e.target.value)}
              className="w-full rounded-xl border border-[var(--color-ledger-100)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20" />
          </div>

          {!isEdit && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Email address</label>
                <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-ledger-100)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Temporary password</label>
                <input required type="text" value={form.password} onChange={(e) => set('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl border border-[var(--color-ledger-100)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20" />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Staff ID</label>
              <input required value={form.staffIdNumber} onChange={(e) => set('staffIdNumber', e.target.value)}
                placeholder="ILG-2026-XXX"
                className="w-full rounded-xl border border-[var(--color-ledger-100)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Phone</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                className="w-full rounded-xl border border-[var(--color-ledger-100)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Department</label>
              <select value={form.departmentId} onChange={(e) => set('departmentId', e.target.value)}
                className="w-full rounded-xl border border-[var(--color-ledger-100)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20">
                <option value="">Select department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink-900)] mb-1.5">Position</label>
              <input value={form.position} onChange={(e) => set('position', e.target.value)}
                className="w-full rounded-xl border border-[var(--color-ledger-100)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20" />
            </div>
          </div>

          {error && <p className="text-sm text-[var(--color-status-absent)]">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[var(--color-ledger-100)] py-2.5 text-sm font-medium text-[var(--color-ink-900)] hover:bg-[var(--color-ledger-50)]">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[var(--color-ledger-900)] text-white py-2.5 text-sm font-medium hover:bg-[var(--color-ledger-800)] disabled:opacity-60">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Staff'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminStaffManagement() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState(undefined); // undefined = closed, null = new, obj = edit

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/staff', { params: { search } }),
      api.get('/staff/departments'),
    ])
      .then(([staffRes, deptRes]) => {
        setStaff(staffRes.data.staff);
        setDepartments(deptRes.data.departments);
      })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [load]);

  async function toggleActive(s) {
    await api.patch(`/staff/${s.id}/deactivate`);
    load();
  }

  async function handleDelete(s) {
    if (!window.confirm(`Permanently delete ${s.full_name} (${s.staff_id_number})? This cannot be undone.`)) return;
    try {
      await api.delete(`/staff/${s.id}`);
      load();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not delete staff member.');
    }
  }

  return (
    <DashboardLayout>
      {({ openSidebar }) => (
        <>
          <Topbar title="Staff Management" subtitle="Add, edit, deactivate or permanently delete staff accounts" onMenuClick={openSidebar} />

          <main className="p-4 md:p-8 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-400)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, ID, or email…"
                  className="w-full rounded-xl border border-[var(--color-ledger-100)] bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ledger-900)]/20"
                />
              </div>
              <button
                onClick={() => setModalTarget(null)}
                className="ml-auto inline-flex items-center gap-2 rounded-xl bg-[var(--color-ledger-900)] text-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--color-ledger-800)]"
              >
                <Plus size={16} /> Add Staff
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--color-ledger-100)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--color-ledger-50)] text-left text-[11px] uppercase tracking-wide text-[var(--color-ink-400)]">
                      <th className="px-6 py-3 font-medium">Staff</th>
                      <th className="px-6 py-3 font-medium">Department</th>
                      <th className="px-6 py-3 font-medium">Position</th>
                      <th className="px-6 py-3 font-medium">Email</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-ledger-100)]">
                    {loading && (
                      <tr><td colSpan={6} className="px-6 py-10 text-center text-[var(--color-ink-400)]">Loading staff…</td></tr>
                    )}
                    {!loading && staff.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-10 text-center text-[var(--color-ink-400)]">No staff found.</td></tr>
                    )}
                    {!loading && staff.map((s) => (
                      <tr key={s.id} className="hover:bg-[var(--color-ledger-50)]/60">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[var(--color-ledger-100)] flex items-center justify-center text-xs font-semibold text-[var(--color-ledger-900)] shrink-0">
                              {s.full_name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[var(--color-ink-900)] truncate">{s.full_name}</p>
                              <p className="text-xs text-[var(--color-ink-400)] font-mono">{s.staff_id_number}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-[var(--color-ink-600)]">{s.department_name || '—'}</td>
                        <td className="px-6 py-3.5 text-[var(--color-ink-600)]">{s.position || '—'}</td>
                        <td className="px-6 py-3.5 text-[var(--color-ink-600)]">{s.email}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                            s.is_active ? 'bg-[var(--color-status-productive-soft)] text-[var(--color-status-productive)]' : 'bg-[var(--color-status-absent-soft)] text-[var(--color-status-absent)]'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${s.is_active ? 'bg-[var(--color-status-productive)]' : 'bg-[var(--color-status-absent)]'}`} />
                            {s.is_active ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => setModalTarget(s)} className="text-[var(--color-ink-600)] hover:text-[var(--color-ledger-900)]" title="Edit">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => toggleActive(s)} className="text-[var(--color-ink-600)] hover:text-[var(--color-status-absent)]" title={s.is_active ? 'Deactivate' : 'Reactivate'}>
                              {s.is_active ? <UserX size={15} /> : <UserCheck2 size={15} />}
                            </button>
                            <button onClick={() => handleDelete(s)} className="text-[var(--color-ink-600)] hover:text-[var(--color-status-absent)]" title="Delete permanently">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>

          {modalTarget !== undefined && (
            <StaffFormModal
              staff={modalTarget}
              departments={departments}
              onClose={() => setModalTarget(undefined)}
              onSaved={load}
            />
          )}
        </>
      )}
    </DashboardLayout>
  );
}
