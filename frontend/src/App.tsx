import { useEffect, useState } from 'react';
import { AdminApprovalScreen } from './screens/AdminApprovalScreen';
import { AuditLogScreen } from './screens/AuditLogScreen';
import { CollectiveBuyScreen } from './screens/CollectiveBuyScreen';
import { KoperasiDashboardScreen } from './screens/KoperasiDashboardScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SupplierMenuScreen } from './screens/MenuScreen';
import { RecordTransactionScreen } from './screens/RecordTransactionScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { SplashScreen } from './screens/SplashScreen';

type Screen =
  | 'splash'
  | 'login'
  | 'register'
  | 'koperasi-dashboard'
  | 'collective-buy'
  | 'record-transaction'
  | 'audit-log'
  | 'supplier-menu'
  | 'admin';

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

  if (window.location.hash === '#kolektif') {
    return 'collective-buy';
  }

  if (window.location.hash === '#catat') {
    return 'record-transaction';
  }

  if (window.location.hash === '#log') {
    return 'audit-log';
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

  useEffect(() => {
    const syncScreenWithHash = () => setScreen(getInitialScreen());

    window.addEventListener('hashchange', syncScreenWithHash);

    return () => window.removeEventListener('hashchange', syncScreenWithHash);
  }, []);

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

  const goToCollectiveBuy = () => {
    window.location.hash = 'kolektif';
    setScreen('collective-buy');
  };

  const goToRecordTransaction = () => {
    window.location.hash = 'catat';
    setScreen('record-transaction');
  };

  const goToAuditLog = () => {
    window.location.hash = 'log';
    setScreen('audit-log');
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
    return (
      <KoperasiDashboardScreen
        onCollectivePress={goToCollectiveBuy}
        onLogPress={goToAuditLog}
        onLogoutPress={goToLogin}
        onRecordPress={goToRecordTransaction}
      />
    );
  }

  if (screen === 'collective-buy') {
    return (
      <CollectiveBuyScreen
        onHomePress={goToKoperasiMenu}
        onLogPress={goToAuditLog}
        onLogoutPress={goToLogin}
        onRecordPress={goToRecordTransaction}
      />
    );
  }

  if (screen === 'record-transaction') {
    return (
      <RecordTransactionScreen
        onCollectivePress={goToCollectiveBuy}
        onHomePress={goToKoperasiMenu}
        onLogPress={goToAuditLog}
        onLogoutPress={goToLogin}
      />
    );
  }

  if (screen === 'audit-log') {
    return (
      <AuditLogScreen
        onCollectivePress={goToCollectiveBuy}
        onHomePress={goToKoperasiMenu}
        onLogoutPress={goToLogin}
        onRecordPress={goToRecordTransaction}
      />
    );
  }

  if (screen === 'supplier-menu') {
    return <SupplierMenuScreen onLogoutPress={goToLogin} />;
  }

  if (screen === 'admin') {
    return <AdminApprovalScreen onLogoutPress={goToLogin} />;
  }

  return <SplashScreen onStartPress={goToLogin} />;
}
