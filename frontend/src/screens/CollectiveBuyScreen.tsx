<<<<<<< HEAD
import { useState, useEffect } from 'react';
import {
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
import { BrandMark } from '../components/BrandMark';
=======
import { useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View, type ViewStyle } from 'react-native-web';
import plusIcon from '../assets/plus_icon.svg';
>>>>>>> f53dd0f77fb50e4b647bf08268e7b5ad2c6a65fb
import { KoperasiBottomNav } from '../components/KoperasiBottomNav';
import { MainHeader } from '../components/MainHeader';
import { PoolCard } from '../components/PoolCard';
import { pools } from '../data/pools';
import { colors, fonts } from '../theme';
import { api } from '../services/api';

type CollectiveBuyScreenProps = {
  onHomePress: () => void;
  onLogPress: () => void;
  onLogoutPress: () => void;
  onRecordPress: () => void;
};

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function CollectiveBuyScreen({
  onHomePress,
  onLogPress,
  onLogoutPress,
  onRecordPress,
}: CollectiveBuyScreenProps) {
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'open' | 'mine'>('open');
  const [pools, setPools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');

  const loadPools = async () => {
    try {
      setIsLoading(true);
      const data = await api.getActivePools();
      setPools(data);
    } catch (err: any) {
      setNotice(err.message || 'Gagal memuat pool aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, []);

  const handleJoinPool = async (pool: any) => {
    try {
      setNotice(`Mendaftarkan partisipasi ke pool ${pool.name || ''}...`);
      
      // 1. Create a manual transaction of 5,000 kg NPK
      const order = await api.recordTransaction({
        jenisPupuk: pool.product?.name || 'NPK Phonska',
        quantity: 5000,
        supplierName: pool.product?.supplier?.name || 'Petrokimia',
        tanggal: new Date().toISOString().split('T')[0],
        totalPrice: 42500000,
      });

      // 2. Connect to pool
      await api.joinPool(pool.id, order.id);

      setNotice('Sukses bergabung ke pool! Progres volume dan harga ter-update secara real-time.');
      await loadPools();
      window.setTimeout(() => setNotice(''), 3000);
    } catch (err: any) {
      setNotice(err.message || 'Gagal bergabung ke pool.');
      window.setTimeout(() => setNotice(''), 3500);
    }
  };

  const handleCreatePool = async () => {
    try {
      setNotice('Menyiapkan proposal pool baru...');

      // Fetch real products from the database
      const products = await api.getProducts();

      if (!products || products.length === 0) {
        setNotice('Tidak ada produk tersedia di database. Hubungi admin.');
        window.setTimeout(() => setNotice(''), 3500);
        return;
      }

      // Pick the first available product
      const selectedProduct = products[0];
      const productId = selectedProduct.id;
      const productName = selectedProduct.name;

      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + 7);

      await api.createPool({
        name: `Pool ${productName} Bersama`,
        deadline: deadlineDate.toISOString(),
        productId: productId,
        targetVolumeKg: 20000,
      });

      setNotice('Proposal pool baru berhasil didaftarkan di ledger!');
      await loadPools();
      window.setTimeout(() => setNotice(''), 3000);
    } catch (err: any) {
      setNotice(err.message || 'Gagal membuat proposal pool baru.');
      window.setTimeout(() => setNotice(''), 3500);
    }
  };

  const handleLogout = () => {
    api.clearToken();
    onLogoutPress();
  };

  // Filter based on active tab and search query
  const filteredPools = pools.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.product?.supplier?.name?.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === 'mine') {
      // Show pools where current koperasi is participant
      // (For simple presentation, show all if empty or first 1)
      return matchesSearch;
    }
    return matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={[styles.shell, { height }]}>
<<<<<<< HEAD
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <BrandMark size={28} />
            </View>
            <Text style={styles.brandText}>VolumeMate</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Keluar</Text>
          </Pressable>
        </View>
=======
        <MainHeader onLogoutPress={onLogoutPress} />
>>>>>>> f53dd0f77fb50e4b647bf08268e7b5ad2c6a65fb

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

<<<<<<< HEAD
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

=======
>>>>>>> f53dd0f77fb50e4b647bf08268e7b5ad2c6a65fb
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
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          {isLoading ? (
            <View style={{ flex: 1, padding: 40, alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.body, color: colors.primary }}>Memuat daftar pool...</Text>
            </View>
          ) : (
            <View style={styles.poolList}>
              {filteredPools.length === 0 ? (
                <View style={[styles.poolCard, { alignItems: 'center', padding: 24 }]}>
                  <Text style={{ color: colors.outline, fontFamily: fonts.body, fontSize: 13 }}>
                    Tidak ada pool yang cocok.
                  </Text>
                </View>
              ) : (
                filteredPools.map((pool) => (
                  <PoolCard key={pool.id} onJoin={() => handleJoinPool(pool)} pool={pool} />
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

<<<<<<< HEAD
type PoolCardProps = {
  onJoin: () => void;
  pool: any;
};

function PoolCard({ onJoin, pool }: PoolCardProps) {
  // Aggregate volume from joined orders
  const totalTargetVolume = pool.targetVolumeKg || 10000;
  const currentVolume = pool.orders?.reduce((acc: number, o: any) => {
    return acc + (o.orderItems?.[0]?.quantity || 0);
  }, 0) || 0;

  const progressPercent = Math.min(100, Math.round((currentVolume / totalTargetVolume) * 100));
  const deadlineStr = pool.deadline ? new Date(pool.deadline).toLocaleDateString('id-ID') : 'Segera';

  // Find price tier
  const activePrice = pool.product?.priceTiers?.[0]?.pricePerKg || 9000;

  return (
    <View style={styles.poolCard}>
      <View style={styles.poolAccent} />
      <View style={styles.poolHeader}>
        <View style={styles.supplierRow}>
          <View style={styles.supplierIcon}>
            <Text style={styles.supplierIconText}>VM</Text>
          </View>
          <View style={styles.supplierTextWrap}>
            <Text style={styles.supplierName}>{pool.name || `Pool ${pool.product?.name}`}</Text>
            <Text style={styles.locationText}>{pool.product?.supplier?.name || 'Pemasok Terdaftar'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, styles.statusSuccess]}>
          <View style={styles.statusDot} />
          <Text style={[styles.statusText, styles.statusSuccessText]}>{pool.status}</Text>
        </View>
      </View>

      <View style={styles.productBox}>
        <InfoRow label="Produk" value={pool.product?.name || 'Pupuk'} />
        <InfoRow isPrice label="Harga Tier Aktif" value={`Rp ${activePrice.toLocaleString('id-ID')}/kg`} />
        <InfoRow label="Batas Waktu" value={deadlineStr} />
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>Progres Volume</Text>
            <Text style={styles.progressText}>{(currentVolume / 1000).toFixed(1)} / {(totalTargetVolume / 1000).toFixed(0)} Ton</Text>
          </View>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onJoin}
        style={styles.actionButton}
      >
        <Text style={styles.actionText}>Gabung Pool Ini</Text>
      </Pressable>
    </View>
  );
}

type InfoRowProps = {
  isPrice?: boolean;
  label: string;
  value: string;
};

function InfoRow({ isPrice = false, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, isPrice && styles.priceValue]}>{value}</Text>
    </View>
  );
}

=======
>>>>>>> f53dd0f77fb50e4b647bf08268e7b5ad2c6a65fb
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
  poolList: {
    gap: 16,
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
