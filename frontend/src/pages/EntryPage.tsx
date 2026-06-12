import { useEffect, useState } from 'react';
import { LandingPage } from './LandingPage';
import { SplashPage } from './SplashPage';

const DESKTOP_QUERY = '(min-width: 768px)';

export function EntryPage() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia(DESKTOP_QUERY).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);
    const updateViewportMode = () => setIsDesktop(mediaQuery.matches);

    updateViewportMode();
    mediaQuery.addEventListener('change', updateViewportMode);

    return () => mediaQuery.removeEventListener('change', updateViewportMode);
  }, []);

  return isDesktop ? <LandingPage /> : <SplashPage />;
}
