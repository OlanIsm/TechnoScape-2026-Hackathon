import { useState } from 'react';
import { AdminApprovalScreen } from './screens/AdminApprovalScreen';
import { KoperasiDashboardScreen } from './screens/KoperasiDashboardScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SupplierMenuScreen } from './screens/MenuScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { SplashScreen } from './screens/SplashScreen';

type Screen = 'splash' | 'login' | 'register' | 'koperasi-dashboard' | 'supplier-menu' | 'admin';

function getInitialScreen(): Screen {
  if (window.location.hash === '#login') {
    return 'login';
  }

  if (window.location.hash === '#register') {
    return 'register';
  }

  if (window.location.hash === '#koperasi') {
    return 'koperasi-dashboard';
  }

  if (window.location.hash === '#supplier') {
    return 'supplier-menu';
  }

  if (window.location.hash === '#admin') {
    return 'admin';
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
    setScreen('koperasi-dashboard');
  };

  const goToSupplierMenu = () => {
    window.location.hash = 'supplier';
    setScreen('supplier-menu');
  };

  const goToAdmin = () => {
    window.location.hash = 'admin';
    setScreen('admin');
  };

  if (screen === 'login') {
    return (
      <LoginScreen
        onAdminLogin={goToAdmin}
        onKoperasiLogin={goToKoperasiMenu}
        onRegisterPress={goToRegister}
        onSupplierLogin={goToSupplierMenu}
      />
    );
  }

  if (screen === 'register') {
    return <RegisterScreen onBackPress={goToLogin} onLoginPress={goToLogin} />;
  }

  if (screen === 'koperasi-dashboard') {
    return <KoperasiDashboardScreen onLogoutPress={goToLogin} />;
  }

  if (screen === 'supplier-menu') {
    return <SupplierMenuScreen onLogoutPress={goToLogin} />;
  }

  if (screen === 'admin') {
    return <AdminApprovalScreen onLogoutPress={goToLogin} />;
  }

  return <SplashScreen onStartPress={goToLogin} />;
}
