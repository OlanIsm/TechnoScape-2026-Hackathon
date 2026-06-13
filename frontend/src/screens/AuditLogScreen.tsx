import { useState, useEffect } from 'react';
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

type PoolLog = {
  date: string;
  description: string;
  id: string;
  status: 'SUKSES' | 'GAGAL' | 'DIBATALKAN';
};

type AuditLog = {
  action: string;
  createdAt: string;
  details: string;
  id: string;
};

const poolLogs: PoolLog[] = [
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

export function AuditLogScreen({
  onCollectivePress,
  onHomePress,
  onLogoutPress,
  onRecordPress,
}: AuditLogScreenProps) {
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'manual' | 'pool'>('manual');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        setIsLoading(true);
        const data = (await api.getAuditLogs()) as AuditLog[];
        setLogs(data);
      } catch (err: unknown) {
        setNotice(getErrorMessage(err, 'Gagal memuat log audit.'));
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const handleExportCsv = () => {
    setNotice('Mengunduh laporan transaksi CSV...');
    const url = api.exportCsvUrl();
    window.open(url, '_blank');
    window.setTimeout(() => setNotice(''), 3000);
  };

  const handleLogout = () => {
    api.clearToken();
    onLogoutPress();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={[styles.shell, { height }]}>
        <MainHeader onLogoutPress={handleLogout} />

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
              onPress={handleExportCsv}
              style={styles.exportButton}
            >
              <DownloadIcon />
              <Text style={styles.exportText}>Export CSV</Text>
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
              <Text style={[styles.tabText, activeTab === 'manual' && styles.tabTextActive]}>Transaksi Ledger</Text>
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
              <Text style={{ fontFamily: fonts.body, color: colors.primary, fontSize: 14 }}>Memuat data log...</Text>
            </View>
          ) : activeTab === 'manual' ? (
            <ManualLogList logs={logs} />
          ) : (
            <PoolLogList onDetailPress={(msg) => {
              setNotice(msg);
              window.setTimeout(() => setNotice(''), 2400);
            }} />
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

function ManualLogList({ logs }: { logs: AuditLog[] }) {
  if (logs.length === 0) {
    return (
      <View style={{ padding: 24, alignItems: 'center' }}>
        <Text style={{ color: colors.outline, fontFamily: fonts.body, fontSize: 13 }}>Belum ada log transaksi.</Text>
      </View>
    );
  }

  return (
    <View style={styles.logList}>
      {logs.map((log) => (
        <ManualLogCard log={log} key={log.id} />
      ))}
    </View>
  );
}

function ManualLogCard({ log }: { log: AuditLog }) {
  const dateStr = new Date(log.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const parsed = parseDetails(log.details, log.action);
  const icon = getLogIcon(log.action);

  return (
    <View style={styles.manualCard}>
      <View style={styles.logIconCircle}>
        <Text style={styles.logIconText}>{icon}</Text>
      </View>
      <View style={styles.logContent}>
        <Text numberOfLines={1} style={styles.logTitle}>
          {parsed.title}
        </Text>
        <Text style={styles.logMeta}>
          {parsed.desc} - {dateStr}
        </Text>
        <Text style={styles.hashText}>Hash: {log.id.substring(0, 18).toUpperCase()}</Text>
      </View>
      <View style={styles.amountBlock}>
        <Text style={styles.amountText}>{parsed.qty}</Text>
        <Text style={styles.totalText}>{parsed.total}</Text>
      </View>
    </View>
  );
}

function getLogIcon(action: string) {
  switch (action) {
    case 'MANUAL_TRANSACTION': return 'TX';
    case 'CREATE_ORDER': return 'OR';
    case 'JOIN_POOL': return 'PL';
    case 'CONFIRM_ORDER': return 'CF';
    default: return 'LG';
  }
}

function parseDetails(details: string, action: string) {
  try {
    const data = JSON.parse(details);
    if (action === 'MANUAL_TRANSACTION') {
      return {
        title: `Transaksi: ${data.jenisPupuk}`,
        desc: `${data.supplierName || 'Pemasok Umum'}`,
        qty: `${data.quantity} kg`,
        total: `Rp ${data.totalPrice.toLocaleString('id-ID')}`
      };
    }
    if (action === 'CREATE_ORDER') {
      return {
        title: `Order Pengadaan`,
        desc: `Order ID: ${data.orderId.substring(0, 8)}...`,
        qty: `Baru`,
        total: `Rp ${data.totalPrice?.toLocaleString('id-ID') || '-'}`
      };
    }
    if (action === 'JOIN_POOL') {
      return {
        title: `Gabung Pool Patungan`,
        desc: `Pool ID: ${data.poolId.substring(0, 8)}...`,
        qty: `Partisipan`,
        total: `-`
      };
    }
    if (action === 'CONFIRM_ORDER') {
      return {
        title: `Konfirmasi Order Ledger`,
        desc: `Order ID: ${data.orderId.substring(0, 8)}...`,
        qty: `Selesai`,
        total: `-`
      };
    }
    return {
      title: action,
      desc: details,
      qty: '',
      total: ''
    };
  } catch {
    return {
      title: action,
      desc: details,
      qty: '',
      total: ''
    };
  }
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

type PoolLogListProps = {
  onDetailPress: (message: string) => void;
};

function PoolLogList({ onDetailPress }: PoolLogListProps) {
  return (
    <View style={styles.poolList}>
      {poolLogs.map((log) => (
        <View key={log.id} style={[styles.poolCard, getPoolCardStyle(log.status)]}>
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
              onPress={() => onDetailPress(`Dummy: detail ${log.id} akan dibuka nanti.`)}
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
});
