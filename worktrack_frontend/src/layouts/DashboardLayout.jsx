import { useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[var(--color-ledger-50)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        {typeof children === 'function' ? children({ openSidebar: () => setSidebarOpen(true) }) : children}
      </div>
    </div>
  );
}
