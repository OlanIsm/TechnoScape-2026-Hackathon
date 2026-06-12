import { useNavigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import logoutIcon from '../assets/logout-icon.svg';

export function AppTopBar() {
  const navigate = useNavigate();

  return (
    <div className="app-top-bar">
      <BrandLogo className="app-top-logo" />
      <button
        aria-label="Logout"
        className="logout-button"
        type="button"
        onClick={() => navigate('/login')}
      >
        <img alt="" src={logoutIcon} />
        <span>Keluar</span>
      </button>
    </div>
  );
}
