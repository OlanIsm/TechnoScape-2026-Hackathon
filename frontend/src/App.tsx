import { useEffect, useState } from 'react';
import { AdminApprovalScreen } from './screens/AdminApprovalScreen';
import { AuditLogScreen } from './screens/AuditLogScreen';
import { CollectiveBuyScreen } from './screens/CollectiveBuyScreen';
import { pools, type ProcurementPool } from './data/pools';
import { JoinPoolScreen } from './screens/JoinPoolScreen';
import { KoperasiDashboardScreen } from './screens/KoperasiDashboardScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SupplierMenuScreen } from './screens/MenuScreen';
import { RecordTransactionScreen } from './screens/RecordTransactionScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { SplashScreen } from './screens/SplashScreen';
import { api } from './services/api';


type Screen =
  | 'splash'
  | 'login'
  | 'register'
  | 'koperasi-dashboard'
  | 'collective-buy'
  | 'join-pool'
  | 'record-transaction'
  | 'audit-log'
  | 'supplier-menu'
  | 'admin';

function getCurrentUser() {
  const userJson = localStorage.getItem('volumemate_user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

function getDefaultScreenForRole(role: string): Screen {
  if (role === 'SUPPLIER') {
    return 'supplier-menu';
  }
  if (role === 'ADMIN') {
    return 'admin';
  }
  return 'koperasi-dashboard';
}

function getHashForScreen(screen: Screen): string {
  switch (screen) {
    case 'login':
      return 'login';
    case 'register':
      return 'register';
    case 'koperasi-dashboard':
      return 'koperasi';
    case 'collective-buy':
      return 'kolektif';
    case 'join-pool':
      return 'gabung-pool';
    case 'record-transaction':
      return 'catat';
    case 'audit-log':
      return 'log';
    case 'supplier-menu':
      return 'supplier';
    case 'admin':
      return 'admin';
    case 'splash':
    default:
      return '';
  }
}

function getValidatedScreen(hash: string): Screen {
  const user = getCurrentUser();
  const token = localStorage.getItem('volumemate_token');

  // If not logged in
  if (!token || !user) {
    if (hash === '#register') {
      return 'register';
    }
    if (hash === '#login') {
      return 'login';
    }
    if (hash === '' || hash === '#') {
      return 'splash';
    }
    return 'login'; // Redirect to login for protected pages
  }

  // If logged in
  const role = user.role;

  // If on public pages, redirect logged-in user to their dashboard
  if (!hash || hash === '#' || hash === '#login' || hash === '#register') {
    return getDefaultScreenForRole(role);
  }

  if (role === 'SUPPLIER') {
    if (hash === '#supplier') {
      return 'supplier-menu';
    }
    return 'supplier-menu'; // Redirect other hashes
  }

  if (role === 'ADMIN') {
    if (hash === '#admin') {
      return 'admin';
    }
    return 'admin'; // Redirect other hashes
  }

  // Koperasi roles (ADMIN_KOPERASI, ANGGOTA, etc.)
  if (hash === '#koperasi') {
    return 'koperasi-dashboard';
  }
  if (hash === '#kolektif') {
    return 'collective-buy';
  }
  if (hash === '#gabung-pool') {
    return 'join-pool';
  }
  if (hash === '#catat') {
    return 'record-transaction';
  }
  if (hash === '#log') {
    return 'audit-log';
  }

  return 'koperasi-dashboard'; // Default fallback for Koperasi
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => getValidatedScreen(window.location.hash));
  const [joinedPoolIds, setJoinedPoolIds] = useState<number[]>([2]);
  const [selectedJoinPool, setSelectedJoinPool] = useState<ProcurementPool>(pools[0]);
  const [collectiveNotice, setCollectiveNotice] = useState('');
  const [collectiveInitialTab, setCollectiveInitialTab] = useState<'open' | 'mine'>('open');

  useEffect(() => {
    const handleNavigation = () => {
      const currentHash = window.location.hash;
      const validatedScreen = getValidatedScreen(currentHash);
      const expectedHash = '#' + getHashForScreen(validatedScreen);

      if (currentHash !== expectedHash && !(currentHash === '' && expectedHash === '#')) {
        window.location.hash = getHashForScreen(validatedScreen);
      }
      setScreen(validatedScreen);
    };

    window.addEventListener('hashchange', handleNavigation);
    handleNavigation();

    return () => window.removeEventListener('hashchange', handleNavigation);
  }, []);

  const goToLogin = () => {
    api.clearToken();
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
    setCollectiveInitialTab('open');
    window.location.hash = 'kolektif';
    setScreen('collective-buy');
  };

  const goToJoinPool = (pool: ProcurementPool) => {
    setSelectedJoinPool(pool);
    window.location.hash = 'gabung-pool';
    setScreen('join-pool');
  };

  const confirmJoinPool = async (poolId: number, contributionTon: number) => {
    try {
      const pool = selectedJoinPool;
      if (!pool) return;

      const quantityKg = contributionTon * 1000;
      const unitPricePerKg = pool.unitPricePerTon / 1000;
      const totalPrice = quantityKg * unitPricePerKg;

      // 1. Record order in backend
      const order = (await api.recordTransaction({
        jenisPupuk: pool.product,
        quantity: quantityKg,
        supplierName: pool.supplier,
        tanggal: new Date().toISOString().split('T')[0],
        totalPrice: totalPrice,
      })) as any;

      // 2. Join pool in backend
      await api.joinPool(String(poolId), order.id);

      setJoinedPoolIds((currentIds) => (currentIds.includes(poolId) ? currentIds : [...currentIds, poolId]));
      setCollectiveNotice(`Berhasil bergabung ke pool dengan kontribusi ${contributionTon.toLocaleString('id-ID')} Ton.`);
      setCollectiveInitialTab('mine');
      window.location.hash = 'kolektif';
      setScreen('collective-buy');
    } catch (err: unknown) {
      alert('Gagal bergabung ke pool: ' + (err instanceof Error ? err.message : String(err)));
    }
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
        initialTab={collectiveInitialTab}
        joinedPoolIds={joinedPoolIds}
        onHomePress={goToKoperasiMenu}
        onJoinPoolPress={goToJoinPool}
        onLogPress={goToAuditLog}
        onLogoutPress={goToLogin}
        onRecordPress={goToRecordTransaction}
        onSuccessMessageShown={() => setCollectiveNotice('')}
        successMessage={collectiveNotice}
      />
    );
  }

  if (screen === 'join-pool') {
    return (
      <JoinPoolScreen
        onBackPress={goToCollectiveBuy}
        onConfirm={confirmJoinPool}
        pool={selectedJoinPool}
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
