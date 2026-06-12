import { useNavigate } from 'react-router-dom';
import logoutIcon from '../assets/logout-icon.svg';

type AppTopBarProps = {
  eyebrow: string;
};

export function AppTopBar({ eyebrow }: AppTopBarProps) {
  const navigate = useNavigate();

  return (
    <div className="app-top-bar">
      <button
        aria-label="Logout"
        className="logout-button"
        type="button"
        onClick={() => navigate('/login')}
      >
        <img alt="" src={logoutIcon} />
        <span>Keluar</span>
      </button>
      <span className="top-context-chip">{eyebrow}</span>
    </div>
  );
}
