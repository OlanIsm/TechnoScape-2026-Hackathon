import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native-web';
import { BrandMark } from '../components/BrandMark';
import { KoperasiBottomNav } from '../components/KoperasiBottomNav';
import { colors, fonts } from '../theme';

type KoperasiDashboardScreenProps = {
  onCollectivePress: () => void;
  onLogoutPress: () => void;
};

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function KoperasiDashboardScreen({ onCollectivePress, onLogoutPress }: KoperasiDashboardScreenProps) {
  const { height } = useWindowDimensions();

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <BrandMark size={28} />
            </View>
            <View>
              <Text style={styles.orgName}>KUD Tani Makmur</Text>
              <Text style={styles.statusText}>Koperasi disetujui</Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={onLogoutPress} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Keluar</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.title}>Beranda</Text>
            <Text style={styles.subtitle}>
              Ringkasan pengadaan berdasarkan transaksi koperasi yang sudah dicatat.
            </Text>
          </View>

          <View style={styles.metricGrid}>
            <MetricCard
              accentColor={colors.primary}
              label="Total Belanja"
              supportingText="+12% dari bulan lalu"
              value="Rp 145.5Jt"
            />
            <MetricCard
              accentColor={colors.soilBrown}
              label="Volume Pupuk"
              supportingText="Target pencatatan 85%"
              value="24.5 Ton"
            />
          </View>

          <VolumeMindCard />
          <PoolActiveCard />
        </View>

        <KoperasiBottomNav activeTab="home" onCollectivePress={onCollectivePress} />
      </View>
    </SafeAreaView>
  );
}

type MetricCardProps = {
  accentColor: string;
  label: string;
  supportingText: string;
  value: string;
};

function MetricCard({ accentColor, label, supportingText, value }: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: accentColor }]}>{value}</Text>
      <Text style={styles.metricSupporting}>{supportingText}</Text>
    </View>
  );
}

function VolumeMindCard() {
  return (
    <View style={styles.volumeMindCard}>
      <View style={styles.volumeMindHeader}>
        <View style={styles.volumeMindTitleRow}>
          <View style={styles.volumeIcon}>
            <Text style={styles.volumeIconText}>VM</Text>
          </View>
          <View>
            <Text style={styles.volumeTitle}>VolumeMind</Text>
            <Text style={styles.volumeSubtitle}>Prediksi Kebutuhan Bulan Depan</Text>
          </View>
        </View>
        <View style={styles.accuracyBadge}>
          <Text style={styles.accuracyText}>AKURASI</Text>
          <Text style={styles.accuracyValue}>94%</Text>
        </View>
      </View>

      <View style={styles.recommendationBox}>
        <View style={styles.recommendationGrid}>
          <InfoCell label="Rekomendasi Pemasok" value="PT Agro Nusa" />
          <InfoCell label="Kuantitas Optimal" value="12.5 Ton (Urea)" />
          <InfoCell label="Estimasi Biaya" value="Rp 68.750.000" />
          <InfoCell isSaving label="Potensi Penghematan" value="Rp 4.2Jt" />
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={() => undefined} style={styles.confirmButton}>
        <CartIcon />
        <Text style={styles.confirmText}>KONFIRMASI PEMESANAN</Text>
      </Pressable>
    </View>
  );
}

type InfoCellProps = {
  isSaving?: boolean;
  label: string;
  value: string;
};

function InfoCell({ isSaving = false, label, value }: InfoCellProps) {
  return (
    <View style={styles.infoCell}>
      <Text style={[styles.infoLabel, isSaving && styles.savingLabel]}>{label}</Text>
      <Text style={[styles.infoValue, isSaving && styles.savingValue]}>{value}</Text>
    </View>
  );
}

function CartIcon() {
  return (
    <View style={styles.cartIcon}>
      <View style={styles.cartHandle} />
      <View style={styles.cartBasket} />
      <View style={styles.cartWheelRow}>
        <View style={styles.cartWheel} />
        <View style={styles.cartWheel} />
      </View>
    </View>
  );
}

function PoolActiveCard() {
  return (
    <View style={styles.poolSection}>
      <View style={styles.poolHeader}>
        <Text style={styles.poolTitle}>Pool Aktif</Text>
        <Text style={styles.seeAll}>Lihat Semua &gt;</Text>
      </View>

      <View style={styles.poolCard}>
        <View style={styles.poolTopRow}>
          <View>
            <View style={styles.poolMetaRow}>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>PENDING</Text>
              </View>
              <Text style={styles.poolDeadline}>Berakhir: 2 Hari</Text>
            </View>
            <Text style={styles.poolName}>Pool NPK Mutiara Q3</Text>
          </View>
          <View style={styles.groupIcon}>
            <Text style={styles.groupIconText}>OO</Text>
            <View style={styles.groupDot} />
          </View>
        </View>

        <View style={styles.progressMeta}>
          <Text style={styles.progressLabel}>Progres Terkumpul</Text>
          <Text style={styles.progressValue}>65% (13/20 Ton)</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <Pressable accessibilityRole="button" onPress={() => undefined} style={styles.detailButton}>
          <Text style={styles.detailButtonText}>LIHAT DETAIL POOL</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  shell: {
    minHeight: '100%',
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingBottom: 84,
  },
  topBar: {
    minHeight: 72,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: 22,
  },
  orgName: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  statusText: {
    color: colors.successGreen,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  logoutButton: {
    minHeight: 40,
    justifyContent: 'center',
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  logoutText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  content: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  hero: {
    gap: 6,
    marginBottom: 4,
  },
  title: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minHeight: 138,
    backgroundColor: colors.surfaceCard,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
    padding: 14,
    ...cardShadow,
  },
  metricLabel: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  metricSupporting: {
    color: colors.successGreen,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  volumeMindCard: {
    backgroundColor: '#eaf7ff',
    borderColor: '#d1e7ef',
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 16,
    ...cardShadow,
  },
  volumeMindHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  volumeMindTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  volumeIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tertiaryContainer,
    borderRadius: 17,
  },
  volumeIconText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
  },
  volumeTitle: {
    color: colors.tertiary,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
  volumeSubtitle: {
    color: colors.tertiary,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 14,
  },
  accuracyBadge: {
    minWidth: 86,
    backgroundColor: 'rgba(43, 147, 72, 0.18)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  accuracyText: {
    color: colors.successGreen,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 11,
  },
  accuracyValue: {
    color: colors.successGreen,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 14,
  },
  recommendationBox: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 8,
    padding: 14,
  },
  recommendationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  infoCell: {
    width: '50%',
  },
  infoLabel: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  savingLabel: {
    color: colors.successGreen,
  },
  infoValue: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 2,
  },
  savingValue: {
    color: colors.successGreen,
    fontFamily: fonts.heading,
    fontSize: 20,
    lineHeight: 28,
  },
  confirmButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  cartIcon: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  cartHandle: {
    position: 'absolute',
    left: 0,
    top: 2,
    width: 5,
    height: 2,
    backgroundColor: colors.onPrimary,
    borderRadius: 1,
    transform: [{ rotate: '28deg' }],
  },
  cartBasket: {
    position: 'absolute',
    left: 4,
    top: 5,
    width: 10,
    height: 6,
    borderBottomColor: colors.onPrimary,
    borderBottomWidth: 2,
    borderLeftColor: colors.onPrimary,
    borderLeftWidth: 2,
    borderRightColor: colors.onPrimary,
    borderRightWidth: 2,
    borderRadius: 1,
  },
  cartWheelRow: {
    position: 'absolute',
    left: 5,
    bottom: 1,
    flexDirection: 'row',
    gap: 4,
  },
  cartWheel: {
    width: 3,
    height: 3,
    backgroundColor: colors.onPrimary,
    borderRadius: 2,
  },
  confirmText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  poolSection: {
    gap: 10,
  },
  poolHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poolTitle: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  seeAll: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  poolCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
    ...cardShadow,
  },
  poolTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poolMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 183, 3, 0.18)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  pendingText: {
    color: colors.warningAmber,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  poolDeadline: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 14,
  },
  poolName: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  groupIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.outlineVariant,
    borderRadius: 22,
    borderWidth: 1,
    position: 'relative',
  },
  groupIconText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
  },
  groupDot: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    width: 10,
    height: 10,
    backgroundColor: colors.secondary,
    borderColor: colors.surfaceCard,
    borderRadius: 5,
    borderWidth: 2,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 14,
  },
  progressValue: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    width: '65%',
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 999,
  },
  detailButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.secondary,
    borderRadius: 8,
    borderWidth: 1,
  },
  detailButtonText: {
    color: colors.secondary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 64,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: 'transparent',
  },
  homeIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  homeBase: {
    width: 14,
    height: 11,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  roundIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
  },
  roundDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  roundDotSmall: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginTop: 3,
  },
  noteIcon: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    gap: 3,
  },
  noteLine: {
    height: 2,
    borderRadius: 1,
  },
  notePencil: {
    width: 9,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '-35deg' }],
    alignSelf: 'flex-end',
  },
  logIcon: {
    width: 20,
    height: 16,
    borderRadius: 2,
    borderWidth: 1.5,
    position: 'relative',
  },
  logSlash: {
    position: 'absolute',
    left: 3,
    top: 6,
    width: 14,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '28deg' }],
  },
  logLine: {
    position: 'absolute',
    right: 3,
    bottom: 3,
    width: 8,
    height: 2,
    borderRadius: 1,
  },
  navText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  navTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
