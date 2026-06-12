import { Menu } from 'lucide-react';
import { dashboardIcons } from '../../data/dashboardData';

type MobileTopBarProps = {
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
};

export function MobileTopBar({
  onOpenMenu,
  onOpenNotifications,
}: MobileTopBarProps) {
  const BellIcon = dashboardIcons.bell;

  return (
    <header className="mobile-topbar">
      <div className="mobile-title">
        <button className="icon-button" type="button" aria-label="Buka menu" onClick={onOpenMenu}>
          <Menu size={18} strokeWidth={2.2} />
        </button>
        <h1>Dashboard</h1>
      </div>
      <button
        className="notification-button"
        type="button"
        aria-label="Notifikasi"
        onClick={onOpenNotifications}
      >
        <BellIcon size={16} strokeWidth={2} />
        <span aria-hidden="true" />
      </button>
    </header>
  );
}
