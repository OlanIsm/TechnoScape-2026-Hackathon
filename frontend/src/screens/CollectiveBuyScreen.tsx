import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native-web';
import plusIcon from '../assets/plus_icon.svg';
import { KoperasiBottomNav } from '../components/KoperasiBottomNav';
import { MainHeader } from '../components/MainHeader';
import type { ProcurementPool } from '../data/pools';
import { api } from '../services/api';
import { colors, fonts } from '../theme';

type CollectiveBuyScreenProps = {
  initialTab?: 'open' | 'mine';
  joinedPoolIds?: number[];
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

type RecordedOrder = {
  id: string;
};

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function CollectiveBuyScreen({
  initialTab = 'open',
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
  const [search, setSearch] = useState('');

  const loadPools = async () => {
    try {
      setIsLoading(true);
      const [poolData, profile] = await Promise.all([
        api.getActivePools() as Promise<BackendPool[]>,
        api.getProfile() as Promise<any>,
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

  const mapBackendPoolToProcurementPool = (bp: BackendPool): ProcurementPool => {
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
      id: bp.id as any,
      product: bp.product?.name || 'Pupuk',
      supplier: bp.product?.supplier?.name || 'Pemasok Terdaftar',
      currentTon: currentVolumeKg / 1000,
      targetTon: targetVolumeKg / 1000,
      unitPricePerTon: activePricePerKg * 1000,
      action: 'join',
      location: bp.product?.supplier?.name || 'Indonesia',
      price: `Rp ${(activePricePerKg * 1000).toLocaleString('id-ID')} / Ton`,
      progress: Math.min(100, Math.round((currentVolumeKg / targetVolumeKg) * 100)),
      progressText: `${(currentVolumeKg / 1000).toFixed(1)} / ${(targetVolumeKg / 1000).toFixed(0)} Ton`,
      deadline: bp.deadline ? new Date(bp.deadline).toLocaleDateString('id-ID') : 'Segera',
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

  const filteredPools = pools.filter((pool) => {
    const query = search.toLowerCase();
    const matchesSearch = (
      pool.name?.toLowerCase().includes(query) ||
      pool.product?.name?.toLowerCase().includes(query) ||
      pool.product?.supplier?.name?.toLowerCase().includes(query)
    );

    if (!matchesSearch) {
      return false;
    }

    if (activeTab === 'mine') {
      return pool.orders?.some((order) => order.koperasiId === myKoperasiId);
    }

    return true;
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

          <View style={styles.searchWrap}>
            <View style={styles.searchIcon}>
              <View style={styles.searchLens} />
              <View style={styles.searchHandle} />
            </View>
            <TextInput
              accessibilityLabel="Cari supplier atau jenis pupuk"
              onChangeText={setSearch}
              placeholder="Cari supplier atau jenis pupuk..."
              placeholderTextColor={colors.outline}
              style={styles.searchInput}
              value={search}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setNotice('Filter pool ter-update otomatis saat Anda mengetik.')}
              style={styles.filterButton}
            >
              <View style={styles.filterLineLong} />
              <View style={styles.filterLineShort} />
              <View style={styles.filterLineMid} />
            </Pressable>
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
              {filteredPools.length === 0 ? (
                <View style={[styles.poolCard, styles.emptyCard]}>
                  <Text style={styles.emptyText}>Tidak ada pool yang cocok.</Text>
                </View>
              ) : (
                filteredPools.map((pool) => (
                  <BackendPoolCard key={pool.id} onJoin={() => handleJoinPool(pool)} pool={pool} myKoperasiId={myKoperasiId} />
                ))
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

function BackendPoolCard({ onJoin, pool, myKoperasiId }: { onJoin: () => void; pool: BackendPool; myKoperasiId: string | null }) {
  const totalTargetVolume = pool.targetVolumeKg || 10000;
  const currentVolume =
    pool.currentVolumeKg ||
    pool.orders?.reduce((acc, order) => acc + (order.orderItems?.[0]?.quantity || 0), 0) ||
    0;
  const progressPercent = Math.min(100, Math.round((currentVolume / totalTargetVolume) * 100));
  const deadline = pool.deadlineAt || pool.deadline;
  const deadlineLabel = getDeadlineLabel(deadline);
  const activePrice = pool.product?.priceTiers?.[0]?.pricePerKg || 9000;
  const isJoined = pool.orders?.some((order) => order.koperasiId === myKoperasiId);

  return (
    <View style={styles.poolCard}>
      <View style={styles.poolAccent} />
      <View style={styles.poolHeader}>
        <View style={styles.supplierRow}>
          <View style={styles.supplierIcon}>
            <Text style={styles.supplierIconText}>VM</Text>
          </View>
          <View style={styles.supplierTextWrap}>
            <Text style={styles.supplierName}>{pool.name || `Pool ${pool.product?.name || 'Pupuk'}`}</Text>
            <Text style={styles.locationText}>{pool.product?.supplier?.name || 'Pemasok Terdaftar'}</Text>
          </View>
        </View>
        <View style={styles.deadlineBadge}>
          <View style={styles.deadlineDot} />
          <Text style={styles.deadlineText}>{deadlineLabel}</Text>
        </View>
      </View>

      <View style={styles.productBox}>
        <InfoRow label="Produk" value={pool.product?.name || 'Pupuk'} />
        <InfoRow isPrice label="Harga Tier Aktif" value={`Rp ${activePrice.toLocaleString('id-ID')}/kg`} />
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>Progres Volume</Text>
            <Text style={styles.progressText}>
              {(currentVolume / 1000).toFixed(1)} / {(totalTargetVolume / 1000).toFixed(0)} Ton
            </Text>
          </View>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      <Pressable 
        accessibilityRole="button" 
        onPress={isJoined ? undefined : onJoin} 
        style={[styles.actionButton, isJoined && styles.actionButtonDisabled]}
      >
        <Text style={styles.actionText}>{isJoined ? 'Sudah Bergabung' : 'Gabung Pool Ini'}</Text>
      </Pressable>
    </View>
  );
}

function InfoRow({ isPrice = false, label, value }: { isPrice?: boolean; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, isPrice && styles.priceValue]}>{value}</Text>
    </View>
  );
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
  searchWrap: {
    minHeight: 48,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    ...cardShadow,
  },
  searchIcon: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  searchLens: {
    width: 12,
    height: 12,
    borderColor: colors.outline,
    borderRadius: 6,
    borderWidth: 2,
  },
  searchHandle: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 7,
    height: 2,
    backgroundColor: colors.outline,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  filterButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 17,
  },
  filterLineLong: {
    width: 18,
    height: 2,
    backgroundColor: colors.secondary,
    borderRadius: 1,
  },
  filterLineShort: {
    width: 12,
    height: 2,
    backgroundColor: colors.secondary,
    borderRadius: 1,
  },
  filterLineMid: {
    width: 15,
    height: 2,
    backgroundColor: colors.secondary,
    borderRadius: 1,
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
  poolAccent: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 96,
    height: 96,
    backgroundColor: 'rgba(174, 238, 203, 0.52)',
    borderBottomLeftRadius: 96,
  },
  poolHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  supplierRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  supplierIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryContainer,
    borderRadius: 19,
  },
  supplierIconText: {
    color: colors.secondary,
    fontFamily: fonts.heading,
    fontSize: 12,
    fontWeight: '800',
  },
  supplierTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  supplierName: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  locationText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 2,
  },
  deadlineBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    backgroundColor: 'rgba(255, 183, 3, 0.1)',
    borderColor: 'rgba(255, 183, 3, 0.25)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  deadlineDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.warningAmber,
    borderRadius: 3,
  },
  deadlineText: {
    color: colors.warningAmber,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  productBox: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  infoValue: {
    color: colors.primary,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'right',
  },
  priceValue: {
    color: colors.successGreen,
    fontSize: 13,
  },
  progressBlock: {
    gap: 8,
  },
  progressHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  progressText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 2,
  },
  progressPercent: {
    color: colors.secondary,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 999,
  },
  actionButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  actionButtonDisabled: {
    backgroundColor: colors.outline,
    opacity: 0.7,
  },
  actionText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    lineHeight: 16,
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
