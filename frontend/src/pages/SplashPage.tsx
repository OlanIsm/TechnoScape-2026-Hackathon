import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';

export function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      navigate('/login', { replace: true });
    }, 3000);

    return () => window.clearTimeout(redirectTimer);
  }, [navigate]);

  return (
    <main className="splash-screen" aria-label="VolumeMate splash screen">
      <section className="splash-brand" aria-label="VolumeMate">
        <BrandLogo className="splash-logo" />
      </section>
    </main>
  );
}
