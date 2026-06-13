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
import auditLogIcon from '../assets/audit_log_icon.svg';
import homeIcon from '../assets/home_icon.svg';
import { MainHeader } from '../components/MainHeader';
import { PoolCard } from '../components/PoolCard';
import type { ProcurementPool } from '../data/pools';
import { colors, fonts } from '../theme';

type SupplierMenuScreenProps = {
  initialMenu?: SupplierMenu;
  onDetailPoolPress: (pool: ProcurementPool) => void;
  onLogoutPress: () => void;
};

type PendingProposal = {
  cooperative: string;
  location: string;
  product: string;
  target: string;
  value: string;
};

type SupplierMenu = 'proposal' | 'audit';

type SupplierAuditLog = {
  amount: string;
  cooperative: string;
  date: string;
  id: string;
  product: string;
  status: 'SUKSES' | 'DITOLAK' | 'PENDANAAN DIBATALKAN' | 'DITOLAK OTOMATIS';
  statusTone: 'success' | 'error' | 'warning' | 'muted';
  total: string;
};

const pendingProposals: PendingProposal[] = [
  {
    cooperative: 'Koperasi Tani Makmur',
    location: 'Kab. Malang, Jawa Timur',
    product: 'Urea N46 (Non-Subsidi)',
    target: '50.000 Kg',
    value: 'Rp 325.000.000',
  },
  {
    cooperative: 'KUD Sumber Rejeki',
    location: 'Kab. Kediri, Jawa Timur',
    product: 'NPK Phonska Plus',
    target: '100.000 Kg',
    value: 'Rp 850.000.000',
  },
  {
    cooperative: 'Kop. Subur Mandiri',
    location: 'Kab. Blitar, Jawa Timur',
    product: 'SP-36 Super',
    target: '30.000 Kg',
    value: 'Rp 96.000.000',
  },
];

const runningPools: ProcurementPool[] = [
  {
    action: 'detail',
    currentTon: 37.5,
    deadline: '4 Hari Lagi',
    id: '#PL-2026-11-001',
    location: 'Blitar, Jawa Timur',
    price: 'Rp 6.500.000 / Ton',
    product: 'Urea KUD Blitar',
    progress: 75,
    progressText: '37.5 / 50.0 Ton',
    supplier: 'Pool Urea KUD Blitar',
    targetTon: 50,
    unitPricePerTon: 6500000,
  },
  {
    action: 'detail',
    currentTon: 100,
    deadline: 'Menunggu Pembayaran',
    id: '#PL-2026-10-045',
    location: 'Jember, Jawa Timur',
    price: 'Rp 8.500.000 / Ton',
    product: 'NPK Jember Raya',
    progress: 100,
    progressText: '100.0 / 100.0 Ton',
    supplier: 'Pool NPK Jember Raya',
    targetTon: 100,
    unitPricePerTon: 8500000,
  },
];

const supplierAuditLogs: SupplierAuditLog[] = [
  {
    amount: '5.000 Sak',
    cooperative: 'KUD Tani Makmur Jaya',
    date: '24 Okt 2026, 14:30',
    id: 'PO-20261024-001',
    product: 'NPK Phonska (50kg)',
    status: 'SUKSES',
    statusTone: 'success',
    total: 'Rp 875.000.000',
  },
  {
    amount: '2.000 Sak',
    cooperative: 'Koperasi Mekar Sari',
    date: '22 Okt 2026, 09:15',
    id: 'PO-20261022-042',
    product: 'Urea Daun Buah',
    status: 'DITOLAK',
    statusTone: 'error',
    total: 'Rp 320.000.000',
  },
  {
    amount: '1.000 Sak',
    cooperative: 'Gapoktan Lembang',
    date: '20 Okt 2026, 23:59',
    id: 'PO-20261020-112',
    product: 'ZA Petrokimia',
    status: 'PENDANAAN DIBATALKAN',
    statusTone: 'warning',
    total: '-',
  },
  {
    amount: '500 Sak',
    cooperative: 'KUD Setia',
    date: '19 Okt 2026, 08:00',
    id: 'PO-20261018-055',
    product: 'KCL Mahkota',
    status: 'DITOLAK OTOMATIS',
    statusTone: 'muted',
    total: '-',
  },
];

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function SupplierMenuScreen({
  initialMenu = 'proposal',
  onDetailPoolPress,
  onLogoutPress,
}: SupplierMenuScreenProps) {
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'pending' | 'running'>('pending');
  const [activeMenu, setActiveMenu] = useState<SupplierMenu>(initialMenu);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setActiveMenu(initialMenu);
  }, [initialMenu]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2400);
  };

  const changeMenu = (menu: SupplierMenu) => {
    setActiveMenu(menu);
    window.location.hash = menu === 'proposal' ? 'manajemen-proposal' : 'log-audit-supplier';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={[styles.shell, { height }]}>
        <MainHeader onLogoutPress={onLogoutPress} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.content}
        >
          {notice ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          {activeMenu === 'proposal' ? (
            <ProposalManagementContent
              activeTab={activeTab}
              onDetailPoolPress={onDetailPoolPress}
              onAction={showNotice}
              onTabChange={setActiveTab}
            />
          ) : (
            <SupplierAuditLogContent onAction={showNotice} />
          )}
        </ScrollView>

        <View style={styles.bottomNav}>
          {[
            { icon: homeIcon, key: 'proposal', label: 'Manajemen Proposal' },
            { icon: auditLogIcon, key: 'audit', label: 'Audit Log' },
          ].map((item) => {
            const isActive = item.key === activeMenu;

            return (
              <Pressable
                accessibilityLabel={item.label}
                accessibilityRole="button"
                key={item.key}
                onPress={() => changeMenu(item.key as SupplierMenu)}
                style={styles.navItem}
              >
                {isActive ? <View style={styles.activePill} /> : null}
                <Image
                  accessibilityElementsHidden
                  resizeMode="contain"
                  source={{ uri: item.icon }}
                  style={[styles.navIcon, isActive && styles.navIconActive]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

type SupplierAuditLogContentProps = {
  onAction: (message: string) => void;
};

function SupplierAuditLogContent({ onAction }: SupplierAuditLogContentProps) {
  return (
    <>
      <View style={styles.auditHeader}>
        <View>
          <Text style={styles.title}>Log Audit Pemasok</Text>
          <Text style={styles.subtitle}>Riwayat pool final dan keputusan pemasok.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => onAction('Dummy: ekspor CSV pemasok akan tersedia setelah API siap.')}
          style={styles.exportButton}
        >
          <DownloadIcon />
          <Text style={styles.exportText}>Ekspor CSV</Text>
        </Pressable>
      </View>

      <View style={styles.filterCard}>
        <Text style={styles.filterLabel}>Periode</Text>
        <Text style={styles.filterValue}>Semua Waktu</Text>
      </View>

      <View style={styles.summaryGrid}>
        <AuditSummaryCard label="Total Final" value="142" />
        <AuditSummaryCard isSuccess label="Sukses" value="118" />
        <AuditSummaryCard isError label="Ditolak" value="12" />
        <AuditSummaryCard isWarning label="Batal/Gagal" value="12" />
      </View>

      <View style={styles.auditList}>
        {supplierAuditLogs.map((log) => (
          <SupplierAuditLogCard key={log.id} log={log} />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => onAction('Dummy: memuat histori pemasok berikutnya.')}
        style={styles.loadMoreButton}
      >
        <Text style={styles.loadMoreText}>Muat Lebih Banyak</Text>
      </Pressable>
    </>
  );
}

function AuditSummaryCard({
  isError = false,
  isSuccess = false,
  isWarning = false,
  label,
  value,
}: {
  isError?: boolean;
  isSuccess?: boolean;
  isWarning?: boolean;
  label: string;
  value: string;
}) {
  const valueStyle = [
    styles.summaryValue,
    isSuccess && styles.summarySuccess,
    isError && styles.summaryError,
    isWarning && styles.summaryWarning,
  ];

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={valueStyle}>{value}</Text>
    </View>
  );
}

function SupplierAuditLogCard({ log }: { log: SupplierAuditLog }) {
  return (
    <View style={[styles.auditCard, log.statusTone === 'warning' && styles.auditCardMuted]}>
      <View style={styles.auditIconWrap}>
        <View style={[styles.auditStatusIcon, getAuditIconStyle(log.statusTone)]}>
          <Text style={[styles.auditStatusIconText, getAuditIconTextStyle(log.statusTone)]}>
            {getAuditIconText(log.statusTone)}
          </Text>
        </View>
      </View>
      <View style={styles.auditBody}>
        <View style={styles.auditTitleRow}>
          <Text style={styles.auditProduct}>{log.product}</Text>
          <View style={[styles.auditBadge, getAuditBadgeStyle(log.statusTone)]}>
            <Text style={styles.auditBadgeText}>{log.status}</Text>
          </View>
        </View>
        <Text style={styles.auditCoop}>{log.cooperative}</Text>
        <Text style={styles.auditMeta}>
          ID: {log.id} - Vol: {log.amount}
        </Text>
        <View style={styles.auditFooter}>
          <Text style={[styles.auditTotal, log.total === '-' && styles.auditTotalMuted]}>{log.total}</Text>
          <Text style={styles.auditDate}>{log.date}</Text>
        </View>
      </View>
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

type ProposalManagementContentProps = {
  activeTab: 'pending' | 'running';
  onAction: (message: string) => void;
  onDetailPoolPress: (pool: ProcurementPool) => void;
  onTabChange: (tab: 'pending' | 'running') => void;
};

function ProposalManagementContent({
  activeTab,
  onAction,
  onDetailPoolPress,
  onTabChange,
}: ProposalManagementContentProps) {
  return (
    <>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Pemasok Utama</Text>
        <Text style={styles.title}>Manajemen Proposal</Text>
        <Text style={styles.subtitle}>Kelola proposal dan progress pool pesanan dari berbagai koperasi.</Text>
      </View>

      <View style={styles.tabs}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onTabChange('pending')}
          style={[styles.tabButton, activeTab === 'pending' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Menunggu <Text style={styles.tabCount}>3</Text>
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onTabChange('running')}
          style={[styles.tabButton, activeTab === 'running' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === 'running' && styles.tabTextActive]}>
            Berjalan <Text style={styles.tabCountMuted}>2</Text>
          </Text>
        </Pressable>
      </View>

      {activeTab === 'pending' ? (
        <View style={styles.section}>
          <View>
            <Text style={styles.sectionTitle}>Proposal Baru</Text>
            <Text style={styles.sectionSubtitle}>Menunggu persetujuan Anda untuk membuka pool.</Text>
          </View>
          {pendingProposals.map((proposal) => (
            <PendingProposalCard key={proposal.cooperative} onAction={onAction} proposal={proposal} />
          ))}
        </View>
      ) : (
        <View style={styles.section}>
          <View>
            <Text style={styles.sectionTitle}>Pool Aktif</Text>
            <Text style={styles.sectionSubtitle}>Pantau progress pool yang sedang berjalan.</Text>
          </View>
          {runningPools.map((pool) => (
            <PoolCard key={pool.id} onAction={onAction} onDetailPress={onDetailPoolPress} pool={pool} />
          ))}
        </View>
      )}
    </>
  );
}

function PendingProposalCard({
  onAction,
  proposal,
}: {
  onAction: (message: string) => void;
  proposal: PendingProposal;
}) {
  const pendingPool = mapPendingProposalToPool(proposal);

  return (
    <PoolCard
      footer={
        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onAction(`Dummy: proposal ${proposal.cooperative} ditolak.`)}
            style={styles.rejectButton}
          >
            <Text style={styles.rejectText}>Tolak</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onAction(`Dummy: proposal ${proposal.cooperative} diterima.`)}
            style={styles.acceptButton}
          >
            <Text style={styles.acceptButtonText}>Terima</Text>
          </Pressable>
        </View>
      }
      onAction={onAction}
      pool={pendingPool}
      priceLabel="Estimasi Nilai Pool"
    />
  );
}

function mapPendingProposalToPool(proposal: PendingProposal): ProcurementPool {
  const targetTon = Number(proposal.target.replace(/[^\d]/g, '')) / 1000 || 50;

  return {
    action: 'detail',
    currentTon: 0,
    deadline: 'MENUNGGU',
    id: proposal.cooperative,
    location: proposal.location,
    price: proposal.value,
    product: proposal.product,
    progress: 0,
    progressText: `0 / ${targetTon.toLocaleString('id-ID')} Ton`,
    supplier: proposal.cooperative,
    targetTon,
    unitPricePerTon: 0,
  };
}

function getAuditIconText(tone: SupplierAuditLog['statusTone']) {
  if (tone === 'success') {
    return 'OK';
  }

  if (tone === 'error') {
    return '!';
  }

  if (tone === 'warning') {
    return 'T';
  }

  return 'A';
}

function getAuditIconStyle(tone: SupplierAuditLog['statusTone']) {
  if (tone === 'success') {
    return styles.auditStatusSuccess;
  }

  if (tone === 'error') {
    return styles.auditStatusError;
  }

  if (tone === 'warning') {
    return styles.auditStatusWarning;
  }

  return styles.auditStatusMuted;
}

function getAuditIconTextStyle(tone: SupplierAuditLog['statusTone']) {
  if (tone === 'success') {
    return styles.auditTextSuccess;
  }

  if (tone === 'error') {
    return styles.auditTextError;
  }

  if (tone === 'warning') {
    return styles.auditTextWarning;
  }

  return styles.auditTextMuted;
}

function getAuditBadgeStyle(tone: SupplierAuditLog['statusTone']) {
  if (tone === 'success') {
    return styles.auditBadgeSuccess;
  }

  if (tone === 'error') {
    return styles.auditBadgeError;
  }

  if (tone === 'warning') {
    return styles.auditBadgeWarning;
  }

  return styles.auditBadgeMuted;
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
  heroCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(193, 200, 194, 0.54)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    ...cardShadow,
  },
  eyebrow: {
    color: colors.secondary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginTop: 4,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 10,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    minHeight: 40,
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
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabCount: {
    color: colors.warningAmber,
  },
  tabCountMuted: {
    color: colors.outline,
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
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 28,
  },
  sectionSubtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorRed,
    borderColor: colors.errorRed,
    borderRadius: 9,
    borderWidth: 1,
  },
  rejectText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  acceptButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successGreen,
    borderRadius: 9,
  },
  acceptButtonText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  auditHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
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
  filterCard: {
    minHeight: 46,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCard,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 13,
    ...cardShadow,
  },
  filterLabel: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  filterValue: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    width: '48.5%',
    minHeight: 94,
    justifyContent: 'center',
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(193, 200, 194, 0.48)',
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    ...cardShadow,
  },
  summaryLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 13,
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: colors.textMain,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  summarySuccess: {
    color: colors.successGreen,
  },
  summaryError: {
    color: colors.errorRed,
  },
  summaryWarning: {
    color: colors.warningAmber,
  },
  auditList: {
    gap: 10,
  },
  auditCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(193, 200, 194, 0.48)',
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    ...cardShadow,
  },
  auditCardMuted: {
    opacity: 0.82,
  },
  auditIconWrap: {
    paddingTop: 2,
  },
  auditStatusIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  auditStatusSuccess: {
    backgroundColor: 'rgba(43, 147, 72, 0.1)',
  },
  auditStatusError: {
    backgroundColor: 'rgba(208, 0, 0, 0.1)',
  },
  auditStatusWarning: {
    backgroundColor: 'rgba(255, 183, 3, 0.14)',
  },
  auditStatusMuted: {
    backgroundColor: 'rgba(193, 200, 194, 0.35)',
  },
  auditStatusIconText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
  auditTextSuccess: {
    color: colors.successGreen,
  },
  auditTextError: {
    color: colors.errorRed,
  },
  auditTextWarning: {
    color: colors.warningAmber,
  },
  auditTextMuted: {
    color: colors.outline,
  },
  auditBody: {
    flex: 1,
    minWidth: 0,
  },
  auditTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 4,
  },
  auditProduct: {
    color: colors.textMain,
    flexShrink: 1,
    fontFamily: fonts.heading,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  auditBadge: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  auditBadgeSuccess: {
    backgroundColor: colors.successGreen,
  },
  auditBadgeError: {
    backgroundColor: colors.errorRed,
  },
  auditBadgeWarning: {
    backgroundColor: colors.warningAmber,
  },
  auditBadgeMuted: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  auditBadgeText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 11,
  },
  auditCoop: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  auditMeta: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 3,
  },
  auditFooter: {
    alignItems: 'center',
    borderTopColor: colors.surfaceVariant,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
  },
  auditTotal: {
    color: colors.textMain,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  auditTotalMuted: {
    color: colors.outline,
  },
  auditDate: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 14,
  },
  loadMoreButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  loadMoreText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 12,
    left: 32,
    right: 32,
    height: 64,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.secondary,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'space-around',
    paddingHorizontal: 14,
    boxShadow: '0 8px 15px rgba(96, 76, 49, 0.35)',
  },
  navItem: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    width: 58,
    height: 58,
    backgroundColor: '#e8e2e2',
    borderRadius: 999,
    boxShadow: '0 7px 12px rgba(96, 76, 49, 0.22)',
  },
  navIcon: {
    width: 28,
    height: 28,
  },
  navIconActive: {
    width: 30,
    height: 30,
  },
});
