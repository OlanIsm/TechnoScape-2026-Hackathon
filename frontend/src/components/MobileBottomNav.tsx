import { useNavigate } from 'react-router-dom';
import groupIcon from '../assets/nav-group.svg';
import homeIcon from '../assets/nav-home.svg';
import noteIcon from '../assets/nav-note.svg';

type ActiveTab = 'dashboard' | 'collective' | 'audit';

type MobileBottomNavProps = {
  activeTab: ActiveTab;
  onUnavailable?: (label: string) => void;
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: homeIcon },
  { id: 'collective', label: 'Borong Bareng', path: '/collective-buy', icon: groupIcon },
  { id: 'audit', label: 'Audit', path: '', icon: noteIcon },
] satisfies Array<{
  id: ActiveTab;
  label: string;
  path: string;
  icon: string;
}>;

export function MobileBottomNav({ activeTab, onUnavailable }: MobileBottomNavProps) {
  const navigate = useNavigate();

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigasi aplikasi">
      {navItems.map((item) => {
        const isActive = item.id === activeTab;

        return (
          <button
            aria-label={item.label}
            className={isActive ? 'is-active' : undefined}
            key={item.id}
            type="button"
            onClick={() => {
              if (isActive) {
                onUnavailable?.(`Kamu sudah berada di ${item.label}.`);
                return;
              }

              if (item.path) {
                navigate(item.path);
                return;
              }

              onUnavailable?.(`${item.label} belum tersedia di versi dummy.`);
            }}
          >
            <img alt="" src={item.icon} />
          </button>
        );
      })}
    </nav>
  );
}
