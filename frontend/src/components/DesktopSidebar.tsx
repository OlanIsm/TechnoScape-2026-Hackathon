import { useNavigate } from 'react-router-dom';
import sidebarLogo from '../assets/volumemate-sidebar-logo.svg';

type DesktopSection = 'dashboard' | 'collective' | 'audit';

type DesktopSidebarProps = {
  activeSection: DesktopSection;
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { id: 'collective', label: 'Borong Bareng', path: '/collective-buy' },
  { id: 'audit', label: 'Catatan Audit', path: '' },
] satisfies Array<{
  id: DesktopSection;
  label: string;
  path: string;
}>;

export function DesktopSidebar({ activeSection }: DesktopSidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="desktop-sidebar">
      <img alt="VolumeMate" className="desktop-sidebar-logo" src={sidebarLogo} />
      <nav className="desktop-menu" aria-label="Menu desktop">
        {menuItems.map((item) => (
          <button
            className={item.id === activeSection ? 'is-active' : undefined}
            key={item.id}
            type="button"
            onClick={() => {
              if (item.path) {
                navigate(item.path);
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
