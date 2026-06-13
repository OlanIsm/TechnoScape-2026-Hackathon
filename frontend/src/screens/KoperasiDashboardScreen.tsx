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
import growIcon from '../assets/grow_icon.svg';
import quantityIcon from '../assets/quantity_icon.svg';
import storeIcon from '../assets/store_icon.svg';
import upIcon from '../assets/up_icon.svg';
import { KoperasiBottomNav } from '../components/KoperasiBottomNav';
import { MainHeader } from '../components/MainHeader';
import { api } from '../services/api';
import { colors, fonts } from '../theme';

type KoperasiDashboardScreenProps = {
  onCollectivePress: () => void;
  onLogPress: () => void;
  onLogoutPress: () => void;
  onRecordPress: () => void;
};

type PoolOrder = {
  orderItems?: Array<{ quantity?: number }>;
};

type BackendPool = {
  id: string;
  currentVolumeKg?: number;
  deadline?: string;
  deadlineAt?: string;
  name?: string;
  orders?: PoolOrder[];
  product?: {
    name?: string;
  };
  status?: string;
  targetVolumeKg?: number;
};

type VolumeMindRecommendation = {
  angka_kg?: number;
  bulan_1?: string;
  explanation?: string;
  isVolumeHack?: boolean;
  savingsRp?: number;
  supplierName?: string;
  totalCost?: number;
};

type DashboardData = {
  akurasiPrediksi?: number;
  hematBulanIni?: number;
  rekomendasiVolumeMind?: VolumeMindRecommendation;
  stokCukupBulan?: number;
  stokPupukKg?: number;
  userName?: string;
  totalSoldKg?: number;
  totalRevenue?: number;
  koperasiName?: string;
};

type PendingProposal = {
  cooperative: string;
  dateSubmitted?: string;
  product: string;
  status?: string;
  supplierEmail?: string;
  target: string;
  value: string;
};

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

function parseVolumeKg(targetStr: string): number {
  const cleanStr = targetStr.replace(/[^0-9]/g, '');
  return parseInt(cleanStr, 10) || 0;
}

function mapLocalPoolToBackendPool(lp: any): BackendPool {
  const targetVol = parseVolumeKg(lp.target.includes('/') ? lp.target.split('/')[1] : lp.target);
  const prodName = lp.name.toLowerCase().includes('urea') ? 'Pupuk Urea Granul' : 'Pupuk NPK Phonska';
  const currentVol = parseVolumeKg(lp.target.split('/')[0]);

  // Dynamic price calculation based on currentVolume (patungan)
  let activePrice = 10000;
  if (prodName.toLowerCase().includes('npk') || prodName.toLowerCase().includes('phonska')) {
    if (currentVol >= 20000) activePrice = 7000;
    else if (currentVol >= 15000) activePrice = 8500;
    else if (currentVol >= 5000) activePrice = 9200;
    else activePrice = 10000;
  } else {
    if (currentVol >= 500) activePrice = 7000;
    else if (currentVol >= 100) activePrice = 7800;
    else activePrice = 8500;
  }

  return {
    id: lp.id,
    name: lp.name,
    status: 'ACTIVE',
    currentVolumeKg: currentVol,
    targetVolumeKg: targetVol,
    product: {
      name: prodName,
    },
    orders: lp.orders || [],
    deadline: lp.deadline || '7 Hari',
  };
}

function formatDeadline(deadline: string | undefined): string {
  if (!deadline) return 'Segera';
  if (deadline.toLowerCase().includes('hari')) {
    return deadline;
  }
  const parsed = Date.parse(deadline);
  if (isNaN(parsed)) {
    return deadline;
  }
  return new Date(parsed).toLocaleDateString('id-ID');
}

function loadPendingProposals(koperasiName?: string): PendingProposal[] {
  const proposalsJson = localStorage.getItem('volumemate_proposals');
  if (!proposalsJson) {
    return [];
  }

  try {
    const proposals = JSON.parse(proposalsJson) as PendingProposal[];
    return proposals.filter((proposal) => {
      const isPending = (proposal.status || 'PENDING') === 'PENDING';
      const isMine = koperasiName ? proposal.cooperative === koperasiName : true;
      return isPending && isMine;
    });
  } catch {
    return [];
  }
}

export function KoperasiDashboardScreen({
  onCollectivePress,
  onLogPress,
  onLogoutPress,
  onRecordPress,
}: KoperasiDashboardScreenProps) {
  const { height } = useWindowDimensions();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activePools, setActivePools] = useState<BackendPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMutationModal, setShowMutationModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [pendingProposals, setPendingProposals] = useState<PendingProposal[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [dash, pools, logs] = await Promise.all([
          api.getDashboard() as Promise<DashboardData>,
          api.getActivePools() as Promise<BackendPool[]>,
          api.getAuditLogs() as Promise<any[]>,
        ]);

        const localPoolsJson = localStorage.getItem('volumemate_approved_pools');
        const localPools = localPoolsJson ? JSON.parse(localPoolsJson) : [];
        const mappedLocalPools = localPools.map(mapLocalPoolToBackendPool);

        const combinedPools = [...pools];
        mappedLocalPools.forEach((lp: BackendPool) => {
          if (!combinedPools.some(cp => cp.id === lp.id)) {
            combinedPools.unshift(lp);
          }
        });

        setDashboardData(dash);
        setActivePools(combinedPools);
        setAuditLogs(logs);
        setPendingProposals(loadPendingProposals(dash.koperasiName));
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Gagal memuat data dasbor.'));
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
  const savings = Number(dashboardData?.hematBulanIni || 0);
  const stockKg = Number(dashboardData?.stokPupukKg || 0);

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={[styles.shell, { height }]}>
        <MainHeader onLogoutPress={handleLogout} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.contentScroll}
        >
          {isLoading ? (
            <View style={styles.stateBlock}>
              <Text style={styles.loadingText}>Memuat data dasbor...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateBlock}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              <View style={styles.hero}>
                <Text style={styles.title}>Beranda</Text>
                <Text style={styles.subtitle}>
                  Selamat datang, {dashboardData?.userName || 'Manager'}. Berikut adalah ringkasan pengadaan Anda.
                </Text>
              </View>

              <View style={styles.metricGrid}>
                <MetricCard
                  accentColor={colors.primary}
                  label="Hemat Bulan Ini"
                  supportingIcon={growIcon}
                  supportingText="Dari harga pasar eceran"
                  value={`Rp ${savings.toLocaleString('id-ID')}`}
                />
                <Pressable onPress={() => setShowMutationModal(true)} style={{ flex: 1 }}>
                  <MetricCard
                    accentColor={colors.soilBrown}
                    label="Volume Stok"
                    supportingIcon={upIcon}
                    supportingText={`Cukup untuk ${dashboardData?.stokCukupBulan || 0} bulan`}
                    value={`${(stockKg / 1000).toFixed(1)} Ton`}
                  />
                </Pressable>
              </View>
              <View style={styles.salesCard}>
                <View style={styles.salesHeaderRow}>
                  <Text style={styles.salesCardTitle}>Laporan Distribusi & Pendapatan</Text>
                  <View style={styles.outgoingBadge}>
                    <Text style={styles.outgoingBadgeText}>STOK KELUAR</Text>
                  </View>
                </View>

                <View style={styles.salesGrid}>
                  <View style={styles.salesCol}>
                    <Text style={styles.salesLabel}>Total Penyaluran</Text>
                    <Text style={[styles.salesValue, { color: colors.errorRed }]}>
                      {`${((dashboardData?.totalSoldKg || 0) / 1000).toFixed(1)} Ton`}
                    </Text>
                    <Text style={styles.salesSubtext}>Pupuk keluar ke petani</Text>
                  </View>

                  <View style={styles.salesDivider} />

                  <View style={styles.salesCol}>
                    <Text style={styles.salesLabel}>Total Pendapatan</Text>
                    <Text style={[styles.salesValue, { color: colors.successGreen }]}>
                      {`Rp ${(dashboardData?.totalRevenue || 0).toLocaleString('id-ID')}`}
                    </Text>
                    <Text style={styles.salesSubtext}>Dana penjualan diterima</Text>
                  </View>
                </View>
              </View>

              <VolumeMindCard
                accuracy={dashboardData?.akurasiPrediksi || 94.2}
                data={dashboardData?.rekomendasiVolumeMind}
              />
              <PoolActiveCard onDetailPress={onCollectivePress} pool={currentPool} />
              <PendingApprovalCard onOpenCollective={onCollectivePress} proposals={pendingProposals} />
            </>
          )}
        </ScrollView>

        {showMutationModal ? (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Detail Mutasi Stok</Text>
                <Pressable onPress={() => setShowMutationModal(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView style={styles.mutationScroll} showsVerticalScrollIndicator={false}>
                {auditLogs.filter(log => ['MANUAL_TRANSACTION', 'JOIN_POOL', 'CONFIRM_ORDER', 'OUTGOING_DISTRIBUTION'].includes(log.action)).length === 0 ? (
                  <Text style={styles.emptyText}>Belum ada riwayat pengadaan atau penyaluran pupuk.</Text>
                ) : (
                  auditLogs.map((log, index) => {
                    let details: any = {};
                    try {
                      details = JSON.parse(log.details);
                    } catch {
                      details = {};
                    }

                    const isManual = log.action === 'MANUAL_TRANSACTION';
                    const isJoin = log.action === 'JOIN_POOL';
                    const isConfirm = log.action === 'CONFIRM_ORDER';
                    const isDist = log.action === 'OUTGOING_DISTRIBUTION';

                    if (!isManual && !isJoin && !isConfirm && !isDist) return null;

                    const date = new Date(log.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });
                    
                    let quantityText = '';
                    if (isDist) {
                      quantityText = `-${(Number(details.quantity) / 1000).toFixed(1)} Ton`;
                    } else if (isManual) {
                      quantityText = `+${(Number(details.quantity) / 1000).toFixed(1)} Ton`;
                    } else if (isJoin) {
                      quantityText = `+${(Number(details.quantity) / 1000).toFixed(1)} Ton`;
                    } else {
                      quantityText = `+${(Number(details.totalVolume || 0) / 1000).toFixed(1)} Ton`;
                    }
                    
                    const fertilizerName = isDist 
                      ? (details.jenisPupuk || 'Pupuk')
                      : (isManual 
                          ? (details.jenisPupuk || 'Pupuk') 
                          : (isJoin ? (details.jenisPupuk || 'NPK Phonska') : 'Pupuk NPK Phonska'));

                    const labelText = isDist ? 'Penyaluran' : (isManual ? 'Manual' : 'Kolektif');
                    const labelColor = isDist ? colors.errorRed : (isManual ? '#0066CC' : colors.successGreen);
                    const labelBg = isDist ? 'rgba(208, 0, 0, 0.1)' : (isManual ? 'rgba(0, 102, 204, 0.1)' : 'rgba(40, 167, 69, 0.1)');

                    return (
                      <View key={log.id || index} style={styles.mutationItem}>
                        <View style={styles.mutationMeta}>
                          <Text style={styles.mutationDate}>{date}</Text>
                          <View style={[
                            styles.badge, 
                            { backgroundColor: labelBg }
                          ]}>
                            <Text style={[
                              styles.badgeText, 
                              { color: labelColor }
                            ]}>
                              {labelText}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.mutationInfo}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.mutationProduct}>{fertilizerName}</Text>
                            <Text style={styles.mutationSupplier}>
                              {isDist ? `Penerima: ${details.buyerName || 'Petani'}` : `Pemasok: ${isManual ? (details.supplierName || 'Pemasok') : 'CV Petrokimia Makmur'}`}
                            </Text>
                          </View>
                          <Text style={[styles.mutationQuantity, isDist && { color: colors.errorRed }]}>{quantityText}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        ) : null}

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

function MetricCard({
  accentColor,
  label,
  supportingIcon,
  supportingText,
  value,
}: {
  accentColor: string;
  label: string;
  supportingIcon: string;
  supportingText: string;
  value: string;
}) {
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

function VolumeMindCard({ data, accuracy }: { data?: VolumeMindRecommendation; accuracy: number }) {
  if (!data) {
    return null;
  }

  const volumeTon = (Number(data.angka_kg || 0) / 1000).toFixed(1);
  const savingsText = Number(data.savingsRp || 0) > 0 ? `Rp ${(Number(data.savingsRp) / 1000000).toFixed(1)}Jt` : 'Rp 0';

  return (
    <View style={styles.volumeMindCard}>
      <View style={styles.volumeMindHeader}>
        <View style={styles.volumeMindCopy}>
          <Text style={styles.volumeTitle}>VolumeMind</Text>
          <Text style={styles.volumeSubtitle}>Rekomendasi Pengadaan: {data.bulan_1 || 'Bulan Depan'}</Text>
        </View>
        <View style={styles.accuracyBadge}>
          <Text style={styles.accuracyText}>AKURASI</Text>
          <Text style={styles.accuracyValue}>{Number(accuracy).toFixed(1)}%</Text>
        </View>
      </View>

      <View style={styles.recommendationBox}>
        <View style={styles.recommendationGrid}>
          <InfoCell icon={storeIcon} label="Rekomendasi Pemasok" value={data.supplierName || '-'} />
          <InfoCell icon={quantityIcon} label="Kuantitas Optimal" value={`${volumeTon} Ton (NPK)`} />
          <InfoCell label="Estimasi Biaya" value={`Rp ${Number(data.totalCost || 0).toLocaleString('id-ID')}`} />
          <InfoCell
            isSaving
            label={data.isVolumeHack ? 'Hemat (Volume Hack)' : 'Potensi Penghematan'}
            value={savingsText}
          />
        </View>
        {data.explanation ? <Text style={styles.explanationText}>{data.explanation}</Text> : null}
      </View>
    </View>
  );
}

function InfoCell({
  icon,
  isSaving = false,
  label,
  value,
}: {
  icon?: string;
  isSaving?: boolean;
  label: string;
  value: string;
}) {
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

function PoolActiveCard({ pool, onDetailPress }: { onDetailPress: () => void; pool: BackendPool | null }) {
  if (!pool) {
    return (
      <View style={styles.poolSection}>
        <View style={styles.poolHeader}>
          <Text style={styles.poolTitle}>Pool Aktif</Text>
        </View>
        <View style={[styles.poolCard, styles.emptyCard]}>
          <Text style={styles.emptyText}>Belum ada pool aktif saat ini.</Text>
        </View>
      </View>
    );
  }

  const totalVolume = pool.targetVolumeKg || 1000;
  const currentVolume =
    pool.currentVolumeKg ||
    pool.orders?.reduce((acc, order) => acc + (order.orderItems?.[0]?.quantity || 0), 0) ||
    0;
  const progressPercent = Math.min(100, Math.round((currentVolume / totalVolume) * 100));
  const deadline = pool.deadlineAt || pool.deadline;

  return (
    <View style={styles.poolSection}>
      <View style={styles.poolHeader}>
        <Text style={styles.poolTitle}>Pool Aktif</Text>
        <Pressable accessibilityRole="button" onPress={onDetailPress}>
          <Text style={styles.seeAll}>Lihat Semua &gt;</Text>
        </Pressable>
      </View>

      <View style={styles.poolCard}>
        <View style={styles.poolTopRow}>
          <View style={styles.poolCopy}>
            <View style={styles.poolMetaRow}>
              <View style={[styles.pendingBadge, pool.status === 'ACTIVE' && styles.activeBadge]}>
                <Text style={[styles.pendingText, pool.status === 'ACTIVE' && styles.activeText]}>
                  {pool.status || 'ACTIVE'}
                </Text>
              </View>
              {deadline ? (
                <Text style={styles.poolDeadline}>Berakhir: {formatDeadline(deadline)}</Text>
              ) : null}
            </View>
            <Text style={styles.poolName}>{pool.name || `Pool ${pool.product?.name || 'Pupuk'}`}</Text>
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
    </View>
  );
}

function PendingApprovalCard({
  onOpenCollective,
  proposals,
}: {
  onOpenCollective: () => void;
  proposals: PendingProposal[];
}) {
  return (
    <View style={styles.pendingSection}>
      <View style={styles.poolHeader}>
        <Text style={styles.poolTitle}>Menunggu Approval Supplier</Text>
        <Pressable accessibilityRole="button" onPress={onOpenCollective}>
          <Text style={styles.seeAll}>Ajukan Lagi &gt;</Text>
        </Pressable>
      </View>

      {proposals.length === 0 ? (
        <View style={[styles.poolCard, styles.emptyCard]}>
          <Text style={styles.emptyText}>Belum ada proposal yang menunggu persetujuan supplier.</Text>
        </View>
      ) : (
        <View style={styles.pendingProposalList}>
          {proposals.map((proposal, index) => (
            <View key={`${proposal.cooperative}-${proposal.product}-${index}`} style={styles.pendingProposalCard}>
              <View style={styles.pendingProposalTop}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.pendingProposalProduct}>{proposal.product}</Text>
                  <Text style={styles.pendingProposalMeta}>
                    {proposal.target} - {proposal.value}
                  </Text>
                </View>
                <View style={styles.approvalBadge}>
                  <Text style={styles.approvalBadgeText}>PENDING</Text>
                </View>
              </View>
              <Text style={styles.pendingProposalDate}>
                Diajukan {proposal.dateSubmitted || 'hari ini'} - menunggu tinjauan pemasok
                {proposal.supplierEmail ? ` (${proposal.supplierEmail})` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
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
    gap: 16,
    paddingBottom: 96,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  contentScroll: {
    flex: 1,
  },
  stateBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
    padding: 40,
  },
  loadingText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  errorText: {
    color: colors.errorRed,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
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
  metricSupportingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  metricTrendIcon: {
    width: 12,
    height: 12,
  },
  metricSupporting: {
    color: colors.successGreen,
    flexShrink: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
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
    minHeight: 48,
    minWidth: 92,
    backgroundColor: 'rgba(43, 147, 72, 0.34)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  accuracyText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  accuracyValue: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
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
  savingLabel: {
    color: colors.successGreen,
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
  infoValue: {
    color: colors.primary,
    flexShrink: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
  },
  savingValue: {
    color: colors.successGreen,
  },
  explanationText: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 15,
    marginTop: 10,
  },
  poolSection: {
    gap: 10,
  },
  pendingSection: {
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
    color: colors.secondary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  poolCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(193, 200, 194, 0.48)',
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    padding: 16,
    ...cardShadow,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: 'center',
  },
  poolTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  poolCopy: {
    flex: 1,
    minWidth: 0,
  },
  poolMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pendingBadge: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeBadge: {
    backgroundColor: 'rgba(43, 147, 72, 0.18)',
  },
  pendingText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  activeText: {
    color: colors.successGreen,
  },
  poolDeadline: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  poolName: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: 8,
  },
  groupIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryContainer,
    borderRadius: 21,
    position: 'relative',
  },
  groupIconText: {
    color: colors.secondary,
    fontFamily: fonts.heading,
    fontSize: 11,
    fontWeight: '800',
  },
  groupDot: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 8,
    height: 8,
    backgroundColor: colors.successGreen,
    borderColor: colors.surfaceCard,
    borderRadius: 4,
    borderWidth: 1,
  },
  progressMeta: {
    alignItems: 'center',
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
  progressValue: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
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
  detailButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  detailButtonText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  pendingProposalList: {
    gap: 10,
  },
  pendingProposalCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(255, 183, 3, 0.42)',
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 14,
    ...cardShadow,
  },
  pendingProposalTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  pendingProposalProduct: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  pendingProposalMeta: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 2,
  },
  approvalBadge: {
    backgroundColor: 'rgba(255, 183, 3, 0.18)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  approvalBadgeText: {
    color: '#8A5A00',
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  pendingProposalDate: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '80%',
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
    borderColor: 'rgba(193, 200, 194, 0.48)',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
    paddingBottom: 12,
  },
  modalTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.outline,
    fontWeight: '600',
  },
  mutationScroll: {
    flex: 1,
  },
  mutationItem: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderColor: colors.surfaceContainerHigh,
    borderWidth: 1,
  },
  mutationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mutationDate: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.outline,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mutationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mutationProduct: {
    fontFamily: fonts.heading,
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
  },
  mutationSupplier: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.outline,
    marginTop: 2,
  },
  mutationQuantity: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '700',
    color: colors.successGreen,
  },
  salesCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(193, 200, 194, 0.48)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginVertical: 8,
    ...cardShadow,
  },
  salesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salesCardTitle: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  outgoingBadge: {
    backgroundColor: 'rgba(208, 0, 0, 0.1)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  outgoingBadgeText: {
    color: colors.errorRed,
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '800',
  },
  salesGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  salesCol: {
    flex: 1,
    gap: 2,
  },
  salesLabel: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  salesValue: {
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  salesSubtext: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 10,
  },
  salesDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.surfaceContainerHigh,
    marginHorizontal: 12,
  },
});
