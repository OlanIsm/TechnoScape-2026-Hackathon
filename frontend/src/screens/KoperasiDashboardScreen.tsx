import { useState, useEffect } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native-web';
import growIcon from '../assets/grow_icon.svg';
import quantityIcon from '../assets/quantity_icon.svg';
import storeIcon from '../assets/store_icon.svg';
import upIcon from '../assets/up_icon.svg';
import { KoperasiBottomNav } from '../components/KoperasiBottomNav';
import { MainHeader } from '../components/MainHeader';
import { PoolCard } from '../components/PoolCard';
import { pools } from '../data/pools';
import { colors, fonts } from '../theme';
import { api } from '../services/api';

type KoperasiDashboardScreenProps = {
  onCollectivePress: () => void;
  onLogPress: () => void;
  onLogoutPress: () => void;
  onRecordPress: () => void;
};

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function KoperasiDashboardScreen({
  onCollectivePress,
  onLogPress,
  onLogoutPress,
  onRecordPress,
}: KoperasiDashboardScreenProps) {
  const { height } = useWindowDimensions();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activePools, setActivePools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [dash, pools] = await Promise.all([
          api.getDashboard(),
          api.getActivePools()
        ]);
        setDashboardData(dash);
        setActivePools(pools);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data dasbor.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = () => {
    api.clearToken();
    onLogoutPress();
  };

  const currentPool = activePools.length > 0 ? activePools[0] : null;

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
<<<<<<< HEAD
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <BrandMark size={28} />
            </View>
            <View>
              <Text style={styles.orgName}>{dashboardData?.koperasiName || 'Koperasi Sumber Makmur'}</Text>
              <Text style={styles.statusText}>Koperasi disetujui</Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Keluar</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <Text style={{ fontFamily: fonts.body, color: colors.primary, fontSize: 16 }}>Memuat data dasbor...</Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <Text style={{ fontFamily: fonts.body, color: colors.errorRed, fontSize: 14, textAlign: 'center' }}>{error}</Text>
=======
      <View style={[styles.shell, { height }]}>
        <MainHeader onLogoutPress={onLogoutPress} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.contentScroll}
        >
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
              supportingIcon={growIcon}
              supportingText="+12% dari bulan lalu"
              value="Rp 145.5Jt"
            />
            <MetricCard
              accentColor={colors.soilBrown}
              label="Volume Pupuk"
              supportingIcon={upIcon}
              supportingText="Target pencatatan 85%"
              value="24.5 Ton"
            />
>>>>>>> f53dd0f77fb50e4b647bf08268e7b5ad2c6a65fb
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.hero}>
              <Text style={styles.title}>Beranda</Text>
              <Text style={styles.subtitle}>
                Selamat datang, {dashboardData?.userName || 'Manager'}. Berikut adalah ringkasan pengadaan Anda.
              </Text>
            </View>

<<<<<<< HEAD
            <View style={styles.metricGrid}>
              <MetricCard
                accentColor={colors.primary}
                label="Hemat Bulan Ini"
                supportingText="Dari harga pasar eceran"
                value={`Rp ${(dashboardData?.hematBulanIni || 0).toLocaleString('id-ID')}`}
              />
              <MetricCard
                accentColor={colors.soilBrown}
                label="Volume Stok"
                supportingText={`Cukup untuk ${dashboardData?.stokCukupBulan || 0} bulan`}
                value={`${((dashboardData?.stokPupukKg || 0) / 1000).toFixed(1)} Ton`}
              />
            </View>

            <VolumeMindCard data={dashboardData?.rekomendasiVolumeMind} accuracy={dashboardData?.akurasiPrediksi || 94.2} />
            <PoolActiveCard pool={currentPool} onDetailPress={onCollectivePress} />
          </View>
        )}
=======
          <VolumeMindCard />
          <PoolActiveCard />
        </ScrollView>
>>>>>>> f53dd0f77fb50e4b647bf08268e7b5ad2c6a65fb

        <KoperasiBottomNav
          activeTab="home"
          onCollectivePress={onCollectivePress}
          onLogPress={onLogPress}
          onRecordPress={onRecordPress}
        />
      </View>
    </SafeAreaView>
  );
}

type MetricCardProps = {
  accentColor: string;
  label: string;
  supportingIcon: string;
  supportingText: string;
  value: string;
};

function MetricCard({ accentColor, label, supportingIcon, supportingText, value }: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: accentColor }]}>{value}</Text>
      <View style={styles.metricSupportingRow}>
        <Image accessibilityElementsHidden resizeMode="contain" source={{ uri: supportingIcon }} style={styles.metricTrendIcon} />
        <Text style={styles.metricSupporting}>{supportingText}</Text>
      </View>
    </View>
  );
}

function VolumeMindCard({ data, accuracy }: { data: any; accuracy: number }) {
  if (!data) return null;

  const volumeTon = (data.angka_kg / 1000).toFixed(1);
  const costJt = (data.totalCost / 1000000).toFixed(1);
  const savingsText = data.savingsRp > 0 ? `Rp ${(data.savingsRp / 1000000).toFixed(1)}Jt` : 'Rp 0';

  return (
    <View style={styles.volumeMindCard}>
      <View style={styles.volumeMindHeader}>
<<<<<<< HEAD
        <View style={styles.volumeMindTitleRow}>
          <View style={styles.volumeIcon}>
            <Text style={styles.volumeIconText}>VM</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.volumeTitle}>VolumeMind</Text>
            <Text style={styles.volumeSubtitle}>Rekomendasi Pengadaan: {data.bulan_1}</Text>
          </View>
        </View>
        <View style={styles.accuracyBadge}>
          <Text style={styles.accuracyText}>AKURASI</Text>
          <Text style={styles.accuracyValue}>{accuracy.toFixed(1)}%</Text>
=======
        <View style={styles.volumeMindCopy}>
          <Text style={styles.volumeTitle}>VolumeMind</Text>
          <Text style={styles.volumeSubtitle}>Prediksi Kebutuhan Bulan Depan</Text>
        </View>
        <View style={styles.accuracyBadge}>
          <Text style={styles.accuracyText}>AKURASI 94%</Text>
>>>>>>> f53dd0f77fb50e4b647bf08268e7b5ad2c6a65fb
        </View>
      </View>

      <View style={styles.recommendationBox}>
        <View style={styles.recommendationGrid}>
<<<<<<< HEAD
          <InfoCell label="Rekomendasi Pemasok" value={data.supplierName} />
          <InfoCell label="Kuantitas Optimal" value={`${volumeTon} Ton (NPK)`} />
          <InfoCell label="Estimasi Biaya" value={`Rp ${data.totalCost.toLocaleString('id-ID')}`} />
          <InfoCell isSaving label={data.isVolumeHack ? "Hemat (Volume Hack)" : "Potensi Penghematan"} value={savingsText} />
=======
          <InfoCell icon={storeIcon} label="Rekomendasi Pemasok" value="PT Agro Nusa" />
          <InfoCell icon={quantityIcon} label="Kuantitas Optimal" value="12.5 Ton (Urea)" />
          <InfoCell label="Estimasi Biaya" value="Rp 68.750.000" />
          <InfoCell isSaving label="Potensi Penghematan" value="Rp 4.2Jt" />
>>>>>>> f53dd0f77fb50e4b647bf08268e7b5ad2c6a65fb
        </View>
        {data.explanation ? (
          <Text style={{ marginTop: 10, fontSize: 11, color: colors.outline, fontStyle: 'italic', lineHeight: 15 }}>
            {data.explanation}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

type InfoCellProps = {
  icon?: string;
  isSaving?: boolean;
  label: string;
  value: string;
};

function InfoCell({ icon, isSaving = false, label, value }: InfoCellProps) {
  return (
    <View style={styles.infoCell}>
      <Text style={[styles.infoLabel, isSaving && styles.savingLabel]}>{label}</Text>
      <View style={styles.infoValueRow}>
        {icon ? <Image accessibilityElementsHidden resizeMode="contain" source={{ uri: icon }} style={styles.infoIcon} /> : null}
        <Text style={[styles.infoValue, isSaving && styles.savingValue]}>{value}</Text>
      </View>
    </View>
  );
}

<<<<<<< HEAD
function PoolActiveCard({ pool, onDetailPress }: { pool: any; onDetailPress: () => void }) {
  if (!pool) {
    return (
      <View style={styles.poolSection}>
        <View style={styles.poolHeader}>
          <Text style={styles.poolTitle}>Pool Aktif</Text>
        </View>
        <View style={[styles.poolCard, { alignItems: 'center', padding: 24 }]}>
          <Text style={{ color: colors.outline, fontFamily: fonts.body, fontSize: 13, textAlign: 'center' }}>
            Belum ada pool aktif saat ini.
          </Text>
        </View>
      </View>
    );
  }

  const totalVolume = pool.targetVolumeKg || 1000;
  const currentVolume = pool.currentVolumeKg || 0;
  const progressPercent = Math.min(100, Math.round((currentVolume / totalVolume) * 100));
=======
function PoolActiveCard() {
  const activePool = pools[1];
>>>>>>> f53dd0f77fb50e4b647bf08268e7b5ad2c6a65fb

  return (
    <View style={styles.poolSection}>
      <View style={styles.poolHeader}>
        <Text style={styles.poolTitle}>Pool Aktif</Text>
<<<<<<< HEAD
        <Pressable onPress={onDetailPress}>
          <Text style={styles.seeAll}>Lihat Semua &gt;</Text>
        </Pressable>
      </View>

      <View style={styles.poolCard}>
        <View style={styles.poolTopRow}>
          <View>
            <View style={styles.poolMetaRow}>
              <View style={[styles.pendingBadge, pool.status === 'ACTIVE' && { backgroundColor: 'rgba(43, 147, 72, 0.18)' }]}>
                <Text style={[styles.pendingText, pool.status === 'ACTIVE' && { color: colors.successGreen }]}>
                  {pool.status}
                </Text>
              </View>
              {pool.deadlineAt ? (
                <Text style={styles.poolDeadline}>
                  Berakhir: {new Date(pool.deadlineAt).toLocaleDateString('id-ID')}
                </Text>
              ) : null}
            </View>
            <Text style={styles.poolName}>{pool.name || `Pool ${pool.product?.name}`}</Text>
          </View>
          <View style={styles.groupIcon}>
            <Text style={styles.groupIconText}>OO</Text>
            <View style={styles.groupDot} />
          </View>
        </View>

        <View style={styles.progressMeta}>
          <Text style={styles.progressLabel}>Progres Terkumpul</Text>
          <Text style={styles.progressValue}>
            {progressPercent}% ({(currentVolume / 1000).toFixed(1)}/{(totalVolume / 1000).toFixed(1)} Ton)
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <Pressable accessibilityRole="button" onPress={onDetailPress} style={styles.detailButton}>
          <Text style={styles.detailButtonText}>IKUTI POOL PATUNGAN</Text>
        </Pressable>
      </View>
=======
      </View>

      <PoolCard onAction={() => undefined} pool={activePool} />
>>>>>>> f53dd0f77fb50e4b647bf08268e7b5ad2c6a65fb
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
  content: {
    gap: 16,
    paddingBottom: 96,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  contentScroll: {
    flex: 1,
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
    flexShrink: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  metricSupportingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  metricTrendIcon: {
    width: 12,
    height: 12,
  },
  volumeMindCard: {
    backgroundColor: '#b7dcff',
    borderColor: colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 18,
    ...cardShadow,
  },
  volumeMindHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  volumeMindCopy: {
    flex: 1,
  },
  volumeTitle: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  volumeSubtitle: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  accuracyBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 104,
    backgroundColor: 'rgba(43, 147, 72, 0.34)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  accuracyText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  recommendationBox: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  recommendationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 18,
  },
  infoCell: {
    width: '50%',
    minWidth: 0,
    paddingRight: 8,
  },
  infoLabel: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 8,
    fontWeight: '600',
    lineHeight: 11,
  },
  infoValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  infoIcon: {
    width: 13,
    height: 13,
  },
  savingLabel: {
    color: colors.successGreen,
  },
  infoValue: {
    color: colors.primary,
    fontFamily: fonts.body,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
  },
  savingValue: {
    color: colors.successGreen,
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
