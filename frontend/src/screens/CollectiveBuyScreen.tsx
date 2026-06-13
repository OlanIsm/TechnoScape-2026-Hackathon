import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native-web';
import plusIcon from '../assets/plus_icon.svg';
import { KoperasiBottomNav } from '../components/KoperasiBottomNav';
import { MainHeader } from '../components/MainHeader';
import { PoolCard } from '../components/PoolCard';
import type { ProcurementPool } from '../data/pools';
import { api } from '../services/api';
import { colors, fonts } from '../theme';

type CollectiveBuyScreenProps = {
  initialTab?: 'open' | 'mine';
  joinedPoolIds?: Array<ProcurementPool['id']>;
  onDetailPoolPress: (pool: ProcurementPool) => void;
  onHomePress: () => void;
  onJoinPoolPress?: (pool: ProcurementPool) => void;
  onLogPress: () => void;
  onLogoutPress: () => void;
  onRecordPress: () => void;
  onSuccessMessageShown?: () => void;
  successMessage?: string;
};

type PoolOrder = {
  orderItems?: Array<{ quantity?: number }>;
  koperasiId?: string;
};

type BackendPool = {
  currentVolumeKg?: number;
  deadline?: string;
  deadlineAt?: string;
  id: string;
  name?: string;
  orders?: PoolOrder[];
  product?: {
    name?: string;
    priceTiers?: Array<{ pricePerKg?: number }>;
    supplier?: {
      name?: string;
    };
  };
  status?: string;
  targetVolumeKg?: number;
};

type Product = {
  id: string;
  name: string;
};

type ProfileResponse = {
  koperasiId?: string;
};

type RecordedOrder = {
  id: string;
};

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function CollectiveBuyScreen({
  initialTab = 'open',
  onDetailPoolPress,
  onHomePress,
  onJoinPoolPress,
  onLogPress,
  onLogoutPress,
  onRecordPress,
  onSuccessMessageShown,
  successMessage,
}: CollectiveBuyScreenProps) {
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'open' | 'mine'>(initialTab);
  const [pools, setPools] = useState<BackendPool[]>([]);
  const [myKoperasiId, setMyKoperasiId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success');

  const loadPools = async () => {
    try {
      setIsLoading(true);
      const [poolData, profile] = await Promise.all([
        api.getActivePools() as Promise<BackendPool[]>,
        api.getProfile() as Promise<ProfileResponse>,
      ]);
      setPools(poolData);
      if (profile && profile.koperasiId) {
        setMyKoperasiId(profile.koperasiId);
      }
    } catch (err: unknown) {
      setNoticeType('error');
      setNotice(getErrorMessage(err, 'Gagal memuat pool aktif.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    setNotice(successMessage);
    const timeoutId = window.setTimeout(() => {
      setNotice('');
      onSuccessMessageShown?.();
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [onSuccessMessageShown, successMessage]);

  const mapBackendPoolToProcurementPool = (
    bp: BackendPool,
    action: ProcurementPool['action'] = 'join',
  ): ProcurementPool => {
    const currentVolumeKg =
      bp.currentVolumeKg ||
      bp.orders?.reduce(
        (acc, order) =>
          acc + (order.orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0),
        0
      ) ||
      0;
    const targetVolumeKg = bp.targetVolumeKg || 10000;
    const activePricePerKg = bp.product?.priceTiers?.[0]?.pricePerKg || 9000;

    return {
      id: bp.id,
      product: bp.product?.name || 'Pupuk',
      supplier: bp.product?.supplier?.name || 'Pemasok Terdaftar',
      currentTon: currentVolumeKg / 1000,
      targetTon: targetVolumeKg / 1000,
      unitPricePerTon: activePricePerKg * 1000,
      action,
      location: bp.product?.supplier?.name || 'Indonesia',
      price: `Rp ${(activePricePerKg * 1000).toLocaleString('id-ID')} / Ton`,
      progress: Math.min(100, Math.round((currentVolumeKg / targetVolumeKg) * 100)),
      progressText: `${(currentVolumeKg / 1000).toFixed(1)} / ${(targetVolumeKg / 1000).toFixed(0)} Ton`,
      deadline: getDeadlineLabel(bp.deadlineAt || bp.deadline),
    };
  };

  const handleJoinPool = async (pool: BackendPool) => {
    if (onJoinPoolPress) {
      onJoinPoolPress(mapBackendPoolToProcurementPool(pool));
      return;
    }

    try {
      setNotice(`Mendaftarkan partisipasi ke pool ${pool.name || ''}...`);

      const order = (await api.recordTransaction({
        jenisPupuk: pool.product?.name || 'NPK Phonska',
        quantity: 5000,
        supplierName: pool.product?.supplier?.name || 'Petrokimia',
        tanggal: new Date().toISOString().split('T')[0],
        totalPrice: 42500000,
      })) as RecordedOrder;

      await api.joinPool(pool.id, order.id);

      setNoticeType('success');
      setNotice('Sukses bergabung ke pool! Progres volume dan harga ter-update secara real-time.');
      await loadPools();
      window.setTimeout(() => setNotice(''), 3000);
    } catch (err: unknown) {
      setNoticeType('error');
      setNotice(getErrorMessage(err, 'Gagal bergabung ke pool.'));
      window.setTimeout(() => setNotice(''), 3500);
    }
  };

  const handleCreatePool = async () => {
    try {
      setNotice('Menyiapkan proposal pool baru...');
      const products = (await api.getProducts()) as Product[];

      if (!products || products.length === 0) {
        setNotice('Tidak ada produk tersedia di database. Hubungi admin.');
        window.setTimeout(() => setNotice(''), 3500);
        return;
      }

      const selectedProduct = products[0];
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + 7);

      await api.createPool({
        name: `Pool ${selectedProduct.name} Bersama`,
        deadline: deadlineDate.toISOString(),
        productId: selectedProduct.id,
        targetVolumeKg: 20000,
      });

      setNoticeType('success');
      setNotice('Proposal pool baru berhasil didaftarkan di ledger!');
      await loadPools();
      window.setTimeout(() => setNotice(''), 3000);
    } catch (err: unknown) {
      setNoticeType('error');
      setNotice(getErrorMessage(err, 'Gagal membuat proposal pool baru.'));
      window.setTimeout(() => setNotice(''), 3500);
    }
  };

  const handleLogout = () => {
    api.clearToken();
    onLogoutPress();
  };

  const handleDetailPool = (pool: BackendPool) => {
    onDetailPoolPress(mapBackendPoolToProcurementPool(pool, 'detail'));
  };

  const visiblePools = pools.filter((pool) => {
    const isJoined = pool.orders?.some((order) => order.koperasiId === myKoperasiId) || false;
    return activeTab === 'mine' ? isJoined : !isJoined;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={[styles.shell, { height }]}>
        <MainHeader onLogoutPress={handleLogout} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.content}
        >
          <View style={styles.hero}>
            <Text style={styles.title}>Kolektif Pembelian</Text>
            <Text style={styles.subtitle}>
              Gabung dengan pool lain untuk mencapai target volume dan mendapatkan harga grosir terbaik.
            </Text>
          </View>

          <View style={styles.tabs}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setActiveTab('open')}
              style={[styles.tabButton, activeTab === 'open' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === 'open' && styles.tabTextActive]}>Pool Terbuka</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setActiveTab('mine')}
              style={[styles.tabButton, activeTab === 'mine' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === 'mine' && styles.tabTextActive]}>Pool Saya</Text>
            </Pressable>
          </View>

          {notice ? (
            <View style={[
              styles.notice,
              noticeType === 'error' && { backgroundColor: '#F8D7DA', borderColor: '#F5C6CB' }
            ]}>
              <Text style={[
                styles.noticeText,
                noticeType === 'error' && { color: '#721C24' }
              ]}>{notice}</Text>
            </View>
          ) : null}

          {isLoading ? (
            <View style={styles.loadingBlock}>
              <Text style={styles.loadingText}>Memuat daftar pool...</Text>
            </View>
          ) : (
            <View style={styles.poolList}>
              {visiblePools.length === 0 ? (
                <View style={[styles.poolCard, styles.emptyCard]}>
                  <Text style={styles.emptyText}>
                    {activeTab === 'open' ? 'Belum ada pool terbuka.' : 'Belum ada pool yang kamu ikuti.'}
                  </Text>
                </View>
              ) : (
                visiblePools.map((pool) => {
                  const isJoined = pool.orders?.some((order) => order.koperasiId === myKoperasiId) || false;

                  return (
                    <PoolCard
                      key={pool.id}
                      onAction={setNotice}
                      onDetailPress={() => handleDetailPool(pool)}
                      onJoinPress={() => handleJoinPool(pool)}
                      pool={mapBackendPoolToProcurementPool(pool, isJoined ? 'detail' : 'join')}
                    />
                  );
                })
              )}
            </View>
          )}
        </ScrollView>

        <Pressable
          accessibilityLabel="Buat pool baru"
          accessibilityRole="button"
          onPress={handleCreatePool}
          style={styles.fab}
        >
          <Image accessibilityElementsHidden resizeMode="contain" source={{ uri: plusIcon }} style={styles.fabIcon} />
        </Pressable>

        <KoperasiBottomNav
          activeTab="collective"
          onHomePress={onHomePress}
          onLogPress={onLogPress}
          onRecordPress={onRecordPress}
        />
      </View>
    </SafeAreaView>
  );
}

function getDeadlineLabel(deadline: string | undefined): string {
  if (!deadline) return 'Segera';
  const now = new Date();
  const target = new Date(deadline);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return 'Berakhir';
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return '1 hari lagi';
  if (diffDays <= 30) return `${diffDays} hari lagi`;
  return new Date(deadline).toLocaleDateString('id-ID');
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  shell: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingBottom: 72,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 96,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  hero: {
    gap: 8,
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 10,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.surfaceCard,
    ...cardShadow,
  },
  tabText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  tabTextActive: {
    color: colors.primary,
  },
  notice: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondaryFixedDim,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  loadingBlock: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  poolList: {
    gap: 16,
  },
  poolCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(193, 200, 194, 0.48)',
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
    overflow: 'hidden',
    padding: 18,
    position: 'relative',
    ...cardShadow,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 82,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    width: 56,
    height: 56,
  },
});
