import { useState } from 'react';
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
import { KoperasiBottomNav } from '../components/KoperasiBottomNav';
import { colors, fonts } from '../theme';

type CollectiveBuyScreenProps = {
  onHomePress: () => void;
  onLogPress: () => void;
  onLogoutPress: () => void;
  onRecordPress: () => void;
};

type Pool = {
  action: 'join' | 'detail';
  deadline: string;
  id: number;
  location: string;
  price: string;
  product: string;
  progress: number;
  progressText: string;
  status: string;
  statusType: 'warning' | 'success';
  supplier: string;
};

const pools: Pool[] = [
  {
    action: 'join',
    deadline: '2 Hari Lagi',
    id: 1,
    location: 'Bontang, Kaltim',
    price: 'Rp 385.000 /sak',
    product: 'Urea Non-Subsidi 50kg',
    progress: 60,
    progressText: '600 / 1000 Ton',
    status: '2 Hari Lagi',
    statusType: 'warning',
    supplier: 'PT Pupuk Kaltim',
  },
  {
    action: 'detail',
    deadline: 'Hampir Penuh',
    id: 2,
    location: 'Surabaya, Jatim',
    price: 'Rp 650.000 /sak',
    product: 'NPK Mutiara 16-16-16',
    progress: 85,
    progressText: '425 / 500 Ton',
    status: 'Hampir Penuh',
    statusType: 'success',
    supplier: 'CV Tani Subur Jaya',
  },
  {
    action: 'join',
    deadline: '5 Hari Lagi',
    id: 3,
    location: 'Gresik, Jatim',
    price: 'Rp 172.000 /sak',
    product: 'SP-36 Super 50kg',
    progress: 42,
    progressText: '210 / 500 Ton',
    status: 'Terbuka',
    statusType: 'success',
    supplier: 'PT Agro Nusa',
  },
];

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
  const [notice, setNotice] = useState('');

  const showDummyNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2200);
  };

  const visiblePools = activeTab === 'open' ? pools : pools.slice(1, 2);

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={[styles.shell, { height }]}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <BrandMark size={28} />
            </View>
            <Text style={styles.brandText}>VolumeMate</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onLogoutPress} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Keluar</Text>
          </Pressable>
        </View>

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
              placeholder="Cari supplier atau jenis pupuk..."
              placeholderTextColor={colors.outline}
              style={styles.searchInput}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => showDummyNotice('Filter pool akan aktif setelah API tersedia.')}
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
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          <View style={styles.poolList}>
            {visiblePools.map((pool) => (
              <PoolCard key={pool.id} onAction={showDummyNotice} pool={pool} />
            ))}
          </View>
        </ScrollView>

        <Pressable
          accessibilityLabel="Buat pool baru"
          accessibilityRole="button"
          onPress={() => showDummyNotice('Form buat pool baru masih dummy untuk sekarang.')}
          style={styles.fab}
        >
          <Text style={styles.fabText}>+</Text>
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

type PoolCardProps = {
  onAction: (message: string) => void;
  pool: Pool;
};

function PoolCard({ onAction, pool }: PoolCardProps) {
  const statusStyle = pool.statusType === 'warning' ? styles.statusWarning : styles.statusSuccess;
  const statusTextStyle = pool.statusType === 'warning' ? styles.statusWarningText : styles.statusSuccessText;

  return (
    <View style={styles.poolCard}>
      <View style={styles.poolAccent} />
      <View style={styles.poolHeader}>
        <View style={styles.supplierRow}>
          <View style={styles.supplierIcon}>
            <Text style={styles.supplierIconText}>{pool.id === 2 ? 'TR' : 'PG'}</Text>
          </View>
          <View style={styles.supplierTextWrap}>
            <Text style={styles.supplierName}>{pool.supplier}</Text>
            <Text style={styles.locationText}>{pool.location}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, statusStyle]}>
          <View style={[styles.statusDot, pool.statusType === 'warning' && styles.statusDotWarning]} />
          <Text style={[styles.statusText, statusTextStyle]}>{pool.status}</Text>
        </View>
      </View>

      <View style={styles.productBox}>
        <InfoRow label="Produk" value={pool.product} />
        <InfoRow isPrice label="Harga Target" value={pool.price} />
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>Progres Volume</Text>
            <Text style={styles.progressText}>{pool.progressText}</Text>
          </View>
          <Text style={styles.progressPercent}>{pool.progress}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pool.progress}%` }]} />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          onAction(
            pool.action === 'join'
              ? `Dummy: kamu memilih gabung ke ${pool.supplier}.`
              : `Dummy: detail ${pool.supplier} akan dibuka nanti.`,
          )
        }
        style={[styles.actionButton, pool.action === 'detail' && styles.secondaryActionButton]}
      >
        <Text style={[styles.actionText, pool.action === 'detail' && styles.secondaryActionText]}>
          {pool.action === 'join' ? 'Gabung Pool Ini' : 'Lihat Detail'}
        </Text>
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
  topBar: {
    minHeight: 66,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  brandIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryContainer,
    borderRadius: 21,
  },
  brandText: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
  },
  logoutButton: {
    minHeight: 38,
    justifyContent: 'center',
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 13,
  },
  logoutText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
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
    minHeight: 50,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    borderColor: colors.surfaceVariant,
    borderRadius: 10,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 6,
    ...cardShadow,
  },
  searchIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
    position: 'relative',
  },
  searchLens: {
    position: 'absolute',
    left: 2,
    top: 2,
    width: 13,
    height: 13,
    borderColor: colors.outline,
    borderRadius: 7,
    borderWidth: 2,
  },
  searchHandle: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    width: 8,
    height: 2,
    backgroundColor: colors.outline,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    borderWidth: 0,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 14,
    height: 48,
  },
  filterButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  filterLineLong: {
    width: 18,
    height: 2,
    backgroundColor: colors.secondary,
    borderRadius: 1,
  },
  filterLineShort: {
    width: 10,
    height: 2,
    backgroundColor: colors.secondary,
    borderRadius: 1,
    marginTop: 4,
  },
  filterLineMid: {
    width: 14,
    height: 2,
    backgroundColor: colors.secondary,
    borderRadius: 1,
    marginTop: 4,
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
  poolCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(193, 200, 194, 0.72)',
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  supplierIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.surfaceVariant,
    borderRadius: 10,
    borderWidth: 1,
  },
  supplierIconText: {
    color: colors.secondary,
    fontFamily: fonts.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  supplierTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  supplierName: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 25,
  },
  locationText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 2,
  },
  statusBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusWarning: {
    backgroundColor: 'rgba(255, 183, 3, 0.1)',
    borderColor: 'rgba(255, 183, 3, 0.25)',
  },
  statusSuccess: {
    backgroundColor: 'rgba(43, 147, 72, 0.1)',
    borderColor: 'rgba(43, 147, 72, 0.22)',
  },
  statusDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.successGreen,
    borderRadius: 3,
  },
  statusDotWarning: {
    backgroundColor: colors.warningAmber,
  },
  statusText: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  statusWarningText: {
    color: colors.warningAmber,
  },
  statusSuccessText: {
    color: colors.successGreen,
  },
  productBox: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(225, 227, 228, 0.82)',
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
  secondaryActionButton: {
    backgroundColor: 'transparent',
    borderColor: colors.secondary,
    borderWidth: 1.5,
  },
  actionText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  secondaryActionText: {
    color: colors.secondary,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 82,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderColor: colors.surfaceContainerLowest,
    borderRadius: 28,
    borderWidth: 2,
    boxShadow: '0 10px 22px rgba(27, 67, 50, 0.22)',
  },
  fabText: {
    color: colors.onPrimary,
    fontFamily: fonts.heading,
    fontSize: 34,
    fontWeight: '600',
    lineHeight: 38,
    marginTop: -3,
  },
});
