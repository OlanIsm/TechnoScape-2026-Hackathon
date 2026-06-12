import { useState } from 'react';
import { LoginScreen } from './screens/LoginScreen';
import { KoperasiMenuScreen, SupplierMenuScreen } from './screens/MenuScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { SplashScreen } from './screens/SplashScreen';

type Screen = 'splash' | 'login' | 'register' | 'koperasi-menu' | 'supplier-menu';

function getInitialScreen(): Screen {
  if (window.location.hash === '#login') {
    return 'login';
  }

  if (window.location.hash === '#register') {
    return 'register';
  }

  if (window.location.hash === '#koperasi') {
    return 'koperasi-menu';
  }

  if (window.location.hash === '#supplier') {
    return 'supplier-menu';
  }

  return 'splash';
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(getInitialScreen);

  const goToLogin = () => {
    window.location.hash = 'login';
    setScreen('login');
  };

  const goToRegister = () => {
    window.location.hash = 'register';
    setScreen('register');
  };

  const goToKoperasiMenu = () => {
    window.location.hash = 'koperasi';
    setScreen('koperasi-menu');
  };

  const goToSupplierMenu = () => {
    window.location.hash = 'supplier';
    setScreen('supplier-menu');
  };

  if (screen === 'login') {
    return (
      <LoginScreen
        onKoperasiLogin={goToKoperasiMenu}
        onRegisterPress={goToRegister}
        onSupplierLogin={goToSupplierMenu}
      />
    );
  }

  if (screen === 'register') {
    return <RegisterScreen onBackPress={goToLogin} onLoginPress={goToLogin} />;
  }

  if (screen === 'koperasi-menu') {
    return <KoperasiMenuScreen onLogoutPress={goToLogin} />;
  }

  if (screen === 'supplier-menu') {
    return <SupplierMenuScreen onLogoutPress={goToLogin} />;
  }

  return <SplashScreen onStartPress={goToLogin} />;
}
