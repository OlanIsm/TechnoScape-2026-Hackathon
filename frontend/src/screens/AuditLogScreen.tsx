import { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native-web';
import { KoperasiBottomNav } from '../components/KoperasiBottomNav';
import { MainHeader } from '../components/MainHeader';
import { colors, fonts } from '../theme';
import { api } from '../services/api';

type AuditLogScreenProps = {
  onCollectivePress: () => void;
  onHomePress: () => void;
  onLogoutPress: () => void;
  onRecordPress: () => void;
};

type ManualLog = {
  amount: string;
  icon: string;
  product: string;
  supplier: string;
  time: string;
  total: string;
  hash?: string;
};

type PoolLog = {
  date: string;
  description: string;
  id: string;
  status: 'SUKSES' | 'GAGAL' | 'DIBATALKAN';
};

const dummyManualLogs: Array<{ dateLabel: string; items: ManualLog[] }> = [
  {
    dateLabel: 'HARI INI, 24 OKT 2026',
    items: [
      {
        amount: '50 Ton',
        icon: 'UR',
        product: 'Pupuk Urea Prill',
        supplier: 'PT Agro Maju',
        time: '10:45 WIB',
        total: 'Rp 425 Jt',
        hash: 'VM-UR-A7K2',
      },
      {
        amount: '120 Ton',
        icon: 'NP',
        product: 'Pupuk NPK 15-15-15',
        supplier: 'CV Tani Subur',
        time: '08:30 WIB',
        total: 'Rp 1.2 M',
        hash: 'VM-NP-B4R1',
      },
    ],
  },
  {
    dateLabel: 'KEMARIN, 23 OKT 2026',
    items: [
      {
        amount: '5 Ribu L',
        icon: 'OC',
        product: 'Pupuk Organik Cair',
        supplier: 'Kop. Makmur',
        time: '14:15 WIB',
        total: 'Rp 85 Jt',
        hash: 'VM-OC-C3D9',
      },
    ],
  },
];

const dummyPoolLogs: PoolLog[] = [
  {
    date: '21 Okt',
    description: 'Target volume 500 Ton Urea terpenuhi dengan 3 koperasi partisipan.',
    id: 'Pool #P-2026-089',
    status: 'SUKSES',
  },
  {
    date: '18 Okt',
    description: 'Batas waktu terlampaui. Target 200 Ton NPK hanya terkumpul 80 Ton.',
    id: 'Pool #P-2026-088',
    status: 'GAGAL',
  },
  {
    date: '15 Okt',
    description: 'Dibatalkan oleh inisiator setelah supplier mengubah batas minimum volume.',
    id: 'Pool #P-2026-087',
    status: 'DIBATALKAN',
  },
];

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const formatted = d.toLocaleDateString('id-ID', options).toUpperCase();
  
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  if (d.toDateString() === today.toDateString()) {
    return `HARI INI, ${formatted}`;
  } else if (d.toDateString() === yesterday.toDateString()) {
    return `KEMARIN, ${formatted}`;
  }
  return formatted;
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function AuditLogScreen({
  onCollectivePress,
  onHomePress,
  onLogoutPress,
  onRecordPress,
}: AuditLogScreenProps) {
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'manual' | 'pool'>('manual');
  const [notice, setNotice] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2400);
  };

  useEffect(() => {
    async function loadLogs() {
      try {
        setIsLoading(true);
        const data = await api.getAuditLogs();
        setLogs(data as any[]);
      } catch (err) {
        showNotice('Gagal memuat log audit: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const handleExport = () => {
    try {
      const url = api.exportCsvUrl();
      window.open(url, '_blank');
      showNotice('Mengunduh laporan CSV...');
    } catch (err) {
      showNotice('Gagal mengekspor data.');
    }
  };

  // Process manual logs
  const manualActions = ['MANUAL_TRANSACTION', 'CREATE_ORDER', 'CONFIRM_ORDER'];
  const filteredManualLogs = logs.filter((log) => manualActions.includes(log.action));

  const manualItemsMapped = filteredManualLogs.map((log) => {
    let details: any = {};
    try {
      details = JSON.parse(log.details);
    } catch {
      details = {};
    }

    const isManual = log.action === 'MANUAL_TRANSACTION';
    const product = isManual ? (details.jenisPupuk || 'Pupuk') : 'Pembelian Pupuk';
    const supplier = isManual ? (details.supplierName || 'Pemasok') : 'Sistem';
    const amount = isManual ? `${details.quantity} kg` : '-';
    const total = `Rp ${(details.totalPrice || 0).toLocaleString('id-ID')}`;
    const icon = isManual ? (details.jenisPupuk || 'PK').substring(0, 2).toUpperCase() : 'ORD';

    return {
      product,
      supplier,
      amount,
      total,
      time: formatTime(log.createdAt),
      dateLabel: formatDateLabel(log.createdAt),
      icon,
      hash: `VM-${icon}-${log.id.substring(0, 4).toUpperCase()}`,
    };
  });

  const groupedManualLogs: Array<{ dateLabel: string; items: ManualLog[] }> = [];
  manualItemsMapped.forEach((item) => {
    let group = groupedManualLogs.find((g) => g.dateLabel === item.dateLabel);
    if (!group) {
      group = { dateLabel: item.dateLabel, items: [] };
      groupedManualLogs.push(group);
    }
    group.items.push(item);
  });

  // Process pool logs
  const poolActions = ['JOIN_POOL', 'FINALIZE_POOL_SUCCESS', 'FINALIZE_POOL_FALLBACK_GRACE'];
  const filteredPoolLogs = logs.filter((log) => poolActions.includes(log.action));

  const mappedPoolLogs: PoolLog[] = filteredPoolLogs.map((log) => {
    let details: any = {};
    try {
      details = JSON.parse(log.details);
    } catch {
      details = {};
    }

    let description = '';
    let status: 'SUKSES' | 'GAGAL' | 'DIBATALKAN' = 'SUKSES';
    const poolIdShort = details.poolId ? details.poolId.substring(0, 8) : log.id.substring(0, 8);

    if (log.action === 'JOIN_POOL') {
      description = `Koperasi bergabung ke pool. Volume total: ${details.totalVolumeKg || 0} kg. Harga saat ini: Rp ${(details.activePricePerKg || 0).toLocaleString('id-ID')}/kg.`;
      status = 'SUKSES';
    } else if (log.action === 'FINALIZE_POOL_SUCCESS') {
      description = `Pool #${poolIdShort} diselesaikan sukses dengan total volume ${details.totalVolumeKg || 0} kg.`;
      status = 'SUKSES';
    } else if (log.action === 'FINALIZE_POOL_FALLBACK_GRACE') {
      const deadlineStr = details.extendedDeadline ? formatDateShort(details.extendedDeadline) : '2 hari';
      description = `Batas waktu pool terlampaui (${details.totalVolumeKg || 0} kg). Grace period aktif: deadline diperpanjang hingga ${deadlineStr}.`;
      status = 'GAGAL';
    }

    return {
      id: `Pool #${poolIdShort}`,
      date: formatDateShort(log.createdAt),
      description,
      status,
    };
  });

  const manualLogsToRender = groupedManualLogs.length > 0 ? groupedManualLogs : dummyManualLogs;
  const poolLogsToRender = mappedPoolLogs.length > 0 ? mappedPoolLogs : dummyPoolLogs;

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={[styles.shell, { height }]}>
        <MainHeader onLogoutPress={onLogoutPress} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.content}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Log Audit</Text>
              <Text style={styles.subtitle}>Riwayat transaksi append-only untuk laporan koperasi.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={handleExport}
              style={styles.exportButton}
            >
              <DownloadIcon />
              <Text style={styles.exportText}>Ekspor CSV</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              <FilterChip isActive label="Semua Tanggal" />
              <FilterChip label="Semua Pemasok" />
              <FilterChip label="Filter Lainnya" />
            </View>
          </ScrollView>

          <View style={styles.tabs}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setActiveTab('manual')}
              style={[styles.tabButton, activeTab === 'manual' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === 'manual' && styles.tabTextActive]}>Transaksi Manual</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setActiveTab('pool')}
              style={[styles.tabButton, activeTab === 'pool' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === 'pool' && styles.tabTextActive]}>Riwayat Pool</Text>
            </Pressable>
          </View>

          {notice ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Memuat log audit...</Text>
            </View>
          ) : activeTab === 'manual' ? (
            <ManualLogList items={manualLogsToRender} />
          ) : (
            <PoolLogList items={poolLogsToRender} onDetailPress={showNotice} />
          )}
        </ScrollView>

        <KoperasiBottomNav
          activeTab="log"
          onCollectivePress={onCollectivePress}
          onHomePress={onHomePress}
          onRecordPress={onRecordPress}
        />
      </View>
    </SafeAreaView>
  );
}

function ManualLogList({ items }: { items: Array<{ dateLabel: string; items: ManualLog[] }> }) {
  return (
    <View style={styles.logList}>
      {items.map((group) => (
        <View key={group.dateLabel} style={styles.dateGroup}>
          <View style={styles.dateSeparator}>
            <Text style={styles.dateLabel}>{group.dateLabel}</Text>
            <View style={styles.separatorLine} />
          </View>
          {group.items.map((item, idx) => (
            <ManualLogCard item={item} key={`${group.dateLabel}-${item.product}-${idx}`} />
          ))}
        </View>
      ))}
    </View>
  );
}

function ManualLogCard({ item }: { item: ManualLog }) {
  return (
    <View style={styles.manualCard}>
      <View style={styles.logIconCircle}>
        <Text style={styles.logIconText}>{item.icon}</Text>
      </View>
      <View style={styles.logContent}>
        <Text numberOfLines={1} style={styles.logTitle}>
          {item.product}
        </Text>
        <Text style={styles.logMeta}>
          {item.supplier} - {item.time}
        </Text>
        <Text style={styles.hashText}>Hash: {item.hash || 'VM-GEN-XXXX'}</Text>
      </View>
      <View style={styles.amountBlock}>
        <Text style={styles.amountText}>{item.amount}</Text>
        <Text style={styles.totalText}>{item.total}</Text>
      </View>
    </View>
  );
}

type PoolLogListProps = {
  items: PoolLog[];
  onDetailPress: (message: string) => void;
};

function PoolLogList({ items, onDetailPress }: PoolLogListProps) {
  return (
    <View style={styles.poolList}>
      {items.map((log, idx) => (
        <View key={`${log.id}-${idx}`} style={[styles.poolCard, getPoolCardStyle(log.status)]}>
          <View style={styles.poolTopRow}>
            <View>
              <View style={[styles.statusBadge, getStatusStyle(log.status)]}>
                <Text style={[styles.statusText, getStatusTextStyle(log.status)]}>{log.status}</Text>
              </View>
              <Text style={styles.poolTitle}>{log.id}</Text>
            </View>
            <Text style={styles.poolDate}>{log.date}</Text>
          </View>
          <Text style={styles.poolDescription}>{log.description}</Text>
          <View style={styles.poolFooter}>
            <View style={styles.avatarStack}>
              <View style={styles.avatarDot}>
                <Text style={styles.avatarText}>SM</Text>
              </View>
              <View style={[styles.avatarDot, styles.avatarOffset]}>
                <Text style={styles.avatarText}>TN</Text>
              </View>
              <View style={[styles.avatarDot, styles.avatarOffset]}>
                <Text style={styles.avatarText}>+1</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => onDetailPress(`Detail untuk ${log.id} sedang diverifikasi di blockchain.`)}
              style={styles.detailButton}
            >
              <Text style={styles.detailText}>Lihat Detail</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}


function FilterChip({ isActive = false, label }: { isActive?: boolean; label: string }) {
  return (
    <View style={[styles.filterChip, isActive && styles.filterChipActive]}>
      <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{label}</Text>
      <Text style={[styles.chevron, isActive && styles.chevronActive]}>v</Text>
    </View>
  );
}

function DownloadIcon() {
  return (
    <View style={styles.downloadIcon}>
      <View style={styles.downloadStem} />
      <View style={styles.downloadArrow} />
      <View style={styles.downloadBase} />
    </View>
  );
}

function getPoolCardStyle(status: PoolLog['status']) {
  if (status === 'SUKSES') {
    return styles.poolCardSuccess;
  }

  if (status === 'GAGAL') {
    return styles.poolCardFailed;
  }

  return styles.poolCardCanceled;
}

function getStatusStyle(status: PoolLog['status']) {
  if (status === 'SUKSES') {
    return styles.statusSuccess;
  }

  if (status === 'GAGAL') {
    return styles.statusFailed;
  }

  return styles.statusCanceled;
}

function getStatusTextStyle(status: PoolLog['status']) {
  if (status === 'SUKSES') {
    return styles.statusSuccessText;
  }

  if (status === 'GAGAL') {
    return styles.statusFailedText;
  }

  return styles.statusCanceledText;
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
    paddingTop: 10,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
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
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
    maxWidth: 210,
  },
  exportButton: {
    minHeight: 40,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 11,
    ...cardShadow,
  },
  exportText: {
    color: colors.secondary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  downloadIcon: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  downloadStem: {
    position: 'absolute',
    left: 7,
    top: 1,
    width: 2,
    height: 8,
    backgroundColor: colors.secondary,
    borderRadius: 1,
  },
  downloadArrow: {
    position: 'absolute',
    left: 4,
    top: 7,
    width: 8,
    height: 8,
    borderBottomColor: colors.secondary,
    borderBottomWidth: 2,
    borderRightColor: colors.secondary,
    borderRightWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  downloadBase: {
    position: 'absolute',
    left: 2,
    bottom: 1,
    width: 12,
    height: 2,
    backgroundColor: colors.secondary,
    borderRadius: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  filterChip: {
    minHeight: 38,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  filterChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  filterText: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  filterTextActive: {
    color: colors.onPrimary,
  },
  chevron: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 12,
  },
  chevronActive: {
    color: colors.onPrimary,
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
    backgroundColor: colors.surfaceContainerLowest,
    ...cardShadow,
  },
  tabText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
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
  logList: {
    gap: 16,
  },
  dateGroup: {
    gap: 10,
  },
  dateSeparator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  dateLabel: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceVariant,
  },
  manualCard: {
    minHeight: 78,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(193, 200, 194, 0.48)',
    borderRadius: 10,
    borderWidth: 1,
    padding: 13,
    ...cardShadow,
  },
  logIconCircle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryContainer,
    borderRadius: 24,
  },
  logIconText: {
    color: colors.secondary,
    fontFamily: fonts.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  logContent: {
    flex: 1,
    minWidth: 0,
  },
  logTitle: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  logMeta: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  hashText: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 13,
    marginTop: 4,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  amountText: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  totalText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  poolList: {
    gap: 12,
  },
  poolCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(193, 200, 194, 0.48)',
    borderLeftWidth: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 11,
    padding: 14,
    ...cardShadow,
  },
  poolCardSuccess: {
    borderLeftColor: colors.successGreen,
  },
  poolCardFailed: {
    borderLeftColor: colors.errorRed,
  },
  poolCardCanceled: {
    borderLeftColor: colors.outline,
  },
  poolTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusSuccess: {
    backgroundColor: 'rgba(43, 147, 72, 0.12)',
  },
  statusFailed: {
    backgroundColor: 'rgba(208, 0, 0, 0.1)',
  },
  statusCanceled: {
    backgroundColor: colors.surfaceVariant,
  },
  statusText: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 12,
  },
  statusSuccessText: {
    color: colors.successGreen,
  },
  statusFailedText: {
    color: colors.errorRed,
  },
  statusCanceledText: {
    color: colors.onSurfaceVariant,
  },
  poolTitle: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: 7,
  },
  poolDate: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  poolDescription: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  poolFooter: {
    alignItems: 'center',
    borderTopColor: colors.surfaceVariant,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 11,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatarDot: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.surfaceCard,
    borderRadius: 15,
    borderWidth: 2,
  },
  avatarOffset: {
    marginLeft: -8,
  },
  avatarText: {
    color: colors.secondary,
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  detailButton: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  detailText: {
    color: colors.secondary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
  },
});
