import { useEffect, useState } from 'react';
import { AdminApprovalScreen } from './screens/AdminApprovalScreen';
import { AuditLogScreen } from './screens/AuditLogScreen';
import { CollectiveBuyScreen } from './screens/CollectiveBuyScreen';
import { pools, type ProcurementPool } from './data/pools';
import { JoinPoolScreen } from './screens/JoinPoolScreen';
import { KoperasiDashboardScreen } from './screens/KoperasiDashboardScreen';
import { LoginScreen } from './screens/LoginScreen';
import { PoolDetailScreen } from './screens/PoolDetailScreen';
import { SupplierMenuScreen } from './screens/MenuScreen';
import { RecordTransactionScreen } from './screens/RecordTransactionScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { SplashScreen } from './screens/SplashScreen';
import { api } from './services/api';

type RecordedOrder = {
  id: string;
};

type Screen =
  | 'splash'
  | 'login'
  | 'register'
  | 'koperasi-dashboard'
  | 'collective-buy'
  | 'join-pool'
  | 'pool-detail'
  | 'record-transaction'
  | 'audit-log'
  | 'supplier-audit'
  | 'supplier-proposal'
  | 'admin';

function getInitialScreen(): Screen {
  const hash = decodeURIComponent(window.location.hash).toLowerCase();

  if (hash === '#login') {
    return 'login';
  }

  if (hash === '#register') {
    return 'register';
  }

  if (hash === '#koperasi') {
    return 'koperasi-dashboard';
  }

  if (hash === '#kolektif') {
    return 'collective-buy';
  }

  if (hash === '#gabung-pool') {
    return 'join-pool';
  }

  if (hash === '#detail-pool') {
    return 'pool-detail';
  }

  if (hash === '#catat') {
    return 'record-transaction';
  }

  if (hash === '#log') {
    return 'audit-log';
  }

  if (
    hash === '#supplier' ||
    hash === '#supplier-proposal' ||
    hash === '#manajemen-proposal' ||
    hash === '#manajemen proposal'
  ) {
    return 'supplier-proposal';
  }

  if (hash === '#supplier-audit' || hash === '#log-audit-supplier' || hash === '#log audit supplier') {
    return 'supplier-audit';
  }

  if (hash === '#admin') {
    return 'admin';
  }

  return 'splash';
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(getInitialScreen);
  const [joinedPoolIds, setJoinedPoolIds] = useState<Array<ProcurementPool['id']>>([2]);
  const [selectedJoinPool, setSelectedJoinPool] = useState<ProcurementPool>(pools[0]);
  const [selectedDetailPool, setSelectedDetailPool] = useState<ProcurementPool>(pools[1]);
  const [collectiveNotice, setCollectiveNotice] = useState('');
  const [collectiveInitialTab, setCollectiveInitialTab] = useState<'open' | 'mine'>('open');

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
    setCollectiveInitialTab('open');
    window.location.hash = 'kolektif';
    setScreen('collective-buy');
  };

  const goToJoinPool = (pool: ProcurementPool) => {
    setSelectedJoinPool(pool);
    window.location.hash = 'gabung-pool';
    setScreen('join-pool');
  };

  const goToPoolDetail = (pool: ProcurementPool) => {
    setSelectedDetailPool(pool);
    window.location.hash = 'detail-pool';
    setScreen('pool-detail');
  };

  const goToMyPools = () => {
    setCollectiveInitialTab('mine');
    window.location.hash = 'kolektif';
    setScreen('collective-buy');
  };

  const confirmJoinPool = async (poolId: ProcurementPool['id'], contributionTon: number) => {
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
      })) as RecordedOrder;

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
    window.location.hash = 'manajemen-proposal';
    setScreen('supplier-proposal');
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
        onDetailPoolPress={goToPoolDetail}
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
        onDetailPoolPress={goToPoolDetail}
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

  if (screen === 'pool-detail') {
    return <PoolDetailScreen onBackPress={goToMyPools} pool={selectedDetailPool} />;
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

  if (screen === 'supplier-proposal') {
    return <SupplierMenuScreen initialMenu="proposal" onDetailPoolPress={goToPoolDetail} onLogoutPress={goToLogin} />;
  }

  if (screen === 'supplier-audit') {
    return <SupplierMenuScreen initialMenu="audit" onDetailPoolPress={goToPoolDetail} onLogoutPress={goToLogin} />;
  }

  if (screen === 'admin') {
    return <AdminApprovalScreen onLogoutPress={goToLogin} />;
  }

  return <SplashScreen onStartPress={goToLogin} />;
}
