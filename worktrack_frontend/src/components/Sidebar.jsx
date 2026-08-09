import { NavLink } from 'react-router-dom';
import { LayoutGrid, History, Users, BarChart3, LogOut, Building2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const staffLinks = [
  { to: '/dashboard', label: 'My Dashboard', icon: LayoutGrid },
  { to: '/history', label: 'Attendance History', icon: History },
];

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/admin/board', label: 'Attendance Board', icon: Users },
  { to: '/admin/staff', label: 'Staff Management', icon: Building2 },
  { to: '/admin/reports', label: 'Reports & Export', icon: BarChart3 },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : staffLinks;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-0 h-screen w-64 shrink-0 bg-[var(--color-ledger-950)] text-white flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-[var(--color-brass-500)] flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-[var(--color-ledger-950)] text-sm">WT</span>
            </div>
            <div>
              <p className="font-display font-semibold text-[15px] leading-tight">WorkTrack</p>
              <p className="text-[10px] text-white/50 leading-tight tracking-wide uppercase">Ikorodu LG Secretariat</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 mt-2 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-brass-500)] text-[var(--color-ledger-950)]'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5 pt-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold shrink-0">
              {(user?.fullName || user?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName || user?.email}</p>
              <p className="text-[11px] text-white/50 truncate capitalize">{user?.role} {user?.staffIdNumber ? `· ${user.staffIdNumber}` : ''}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full mt-2 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={17} strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
