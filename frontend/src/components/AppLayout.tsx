import { Outlet } from 'react-router-dom';
import { Leaf, Wifi } from 'lucide-react';

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/dashboard" aria-label="VolumeMate dashboard">
          <span className="brand-mark">
            <Leaf size={20} aria-hidden="true" />
          </span>
          <span>VolumeMate</span>
        </a>
        <div className="network-status" aria-label="Status jaringan online">
          <Wifi size={16} aria-hidden="true" />
          <span>Online</span>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
