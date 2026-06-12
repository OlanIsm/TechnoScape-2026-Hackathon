import { useNavigate } from 'react-router-dom';

type ActiveTab = 'dashboard' | 'collective' | 'audit';

type MobileBottomNavProps = {
  activeTab: ActiveTab;
  onUnavailable?: (label: string) => void;
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  { id: 'collective', label: 'Borong Bareng', path: '/collective-buy', icon: UsersIcon },
  { id: 'audit', label: 'Audit', path: '', icon: NoteIcon },
] satisfies Array<{
  id: ActiveTab;
  label: string;
  path: string;
  icon: () => JSX.Element;
}>;

export function MobileBottomNav({ activeTab, onUnavailable }: MobileBottomNavProps) {
  const navigate = useNavigate();

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigasi aplikasi">
      {navItems.map((item) => {
        const Icon = item.icon;
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
            <Icon />
          </button>
        );
      })}
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3.8 10.5 12 3.6l8.2 6.9v9.1a1.9 1.9 0 0 1-1.9 1.9h-3.8v-6.2h-5v6.2H5.7a1.9 1.9 0 0 1-1.9-1.9v-9.1Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8.5 12.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.7.2a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8ZM2.7 20.5c.4-3.5 2.7-5.8 5.8-5.8s5.4 2.3 5.8 5.8H2.7Zm10.7 0a7.5 7.5 0 0 0-1.1-3.1 4.9 4.9 0 0 1 3.9-1.9c2.8 0 4.8 2 5.1 5H13.4Z" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6.2 3h9.3l3.3 3.3v14.1c0 1-.8 1.6-1.7 1.6H6.2c-1 0-1.8-.7-1.8-1.6V4.6c0-.9.8-1.6 1.8-1.6Zm8.5 1.8v2.4h2.4l-2.4-2.4ZM8 10h8v1.8H8V10Zm0 4h8v1.8H8V14Zm0 4h5.2v1.8H8V18Z" />
    </svg>
  );
}
