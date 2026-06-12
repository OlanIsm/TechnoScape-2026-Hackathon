import { bottomNavItems } from '../../data/dashboardData';

type BottomNavBarProps = {
  onNavigate: (label: string) => void;
};

export function BottomNavBar({ onNavigate }: BottomNavBarProps) {
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            className={item.active ? 'is-active' : ''}
            type="button"
            key={item.label}
            onClick={() => onNavigate(item.label)}
          >
            <Icon size={18} strokeWidth={2} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
