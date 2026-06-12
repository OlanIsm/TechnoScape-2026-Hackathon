import { useState } from 'react';
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
import { BrandMark } from '../components/BrandMark';
import { colors, fonts } from '../theme';

type SupplierMenuScreenProps = {
  onLogoutPress: () => void;
};

type PendingProposal = {
  cooperative: string;
  location: string;
  product: string;
  target: string;
  value: string;
};

type RunningPool = {
  id: string;
  name: string;
  progress: number;
  status: 'OPEN FOR KOPERASI' | 'PAYMENT WAITING';
  target: string;
  value: string;
};

type SupplierMenu = 'proposal' | 'audit';

type SupplierAuditLog = {
  amount: string;
  cooperative: string;
  date: string;
  id: string;
  note?: string;
  product: string;
  status: 'SUCCESS' | 'DECLINED' | 'FUNDING CANCELED' | 'AUTO DECLINED';
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

const runningPools: RunningPool[] = [
  {
    id: '#PL-2026-11-001',
    name: 'Pool Urea KUD Blitar',
    progress: 75,
    status: 'OPEN FOR KOPERASI',
    target: '37.500 / 50.000 Kg',
    value: 'Rp 243.750.000',
  },
  {
    id: '#PL-2026-10-045',
    name: 'Pool NPK Jember Raya',
    progress: 100,
    status: 'PAYMENT WAITING',
    target: '100.000 / 100.000 Kg',
    value: 'Rp 850.000.000',
  },
];

const supplierAuditLogs: SupplierAuditLog[] = [
  {
    amount: '5.000 Sak',
    cooperative: 'KUD Tani Makmur Jaya',
    date: '24 Okt 2026, 14:30',
    id: 'PO-20261024-001',
    product: 'NPK Phonska (50kg)',
    status: 'SUCCESS',
    statusTone: 'success',
    total: 'Rp 875.000.000',
  },
  {
    amount: '2.000 Sak',
    cooperative: 'Koperasi Mekar Sari',
    date: '22 Okt 2026, 09:15',
    id: 'PO-20261022-042',
    note: 'Alasan: stok tidak mencukupi untuk deadline.',
    product: 'Urea Daun Buah',
    status: 'DECLINED',
    statusTone: 'error',
    total: 'Rp 320.000.000',
  },
  {
    amount: '1.000 Sak',
    cooperative: 'Gapoktan Lembang',
    date: '20 Okt 2026, 23:59',
    id: 'PO-20261020-112',
    product: 'ZA Petrokimia',
    status: 'FUNDING CANCELED',
    statusTone: 'warning',
    total: '-',
  },
  {
    amount: '500 Sak',
    cooperative: 'KUD Setia',
    date: '19 Okt 2026, 08:00',
    id: 'PO-20261018-055',
    product: 'KCL Mahkota',
    status: 'AUTO DECLINED',
    statusTone: 'muted',
    total: '-',
  },
];

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function SupplierMenuScreen({ onLogoutPress }: SupplierMenuScreenProps) {
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'pending' | 'running'>('pending');
  const [activeMenu, setActiveMenu] = useState<SupplierMenu>('proposal');
  const [notice, setNotice] = useState('');

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2400);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={[styles.shell, { height }]}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <BrandMark size={26} />
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
          {notice ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          {activeMenu === 'proposal' ? (
            <ProposalManagementContent
              activeTab={activeTab}
              onAction={showNotice}
              onTabChange={setActiveTab}
            />
          ) : (
            <SupplierAuditLogContent onAction={showNotice} />
          )}
        </ScrollView>

        <View style={styles.bottomNav}>
          {[
            { key: 'proposal', label: 'Proposal' },
            { key: 'audit', label: 'Audit Log' },
          ].map((item, index) => {
            const isActive = item.key === activeMenu;

            return (
            <Pressable
              accessibilityRole="button"
              key={item.key}
              onPress={() => setActiveMenu(item.key as SupplierMenu)}
              style={styles.navItem}
            >
              {isActive ? <View style={styles.activeDot} /> : null}
              <SupplierNavIcon index={index} isActive={isActive} />
              <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.label}</Text>
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
          <Text style={styles.title}>Log Audit Supplier</Text>
          <Text style={styles.subtitle}>Riwayat pool final dan keputusan supplier.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => onAction('Dummy: ekspor CSV supplier akan tersedia setelah API siap.')}
          style={styles.exportButton}
        >
          <Text style={styles.exportText}>Ekspor</Text>
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
        onPress={() => onAction('Dummy: memuat histori supplier berikutnya.')}
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
        {log.note ? <Text style={styles.auditNote}>{log.note}</Text> : null}
        <View style={styles.auditFooter}>
          <Text style={[styles.auditTotal, log.total === '-' && styles.auditTotalMuted]}>{log.total}</Text>
          <Text style={styles.auditDate}>{log.date}</Text>
        </View>
      </View>
    </View>
  );
}

type ProposalManagementContentProps = {
  activeTab: 'pending' | 'running';
  onAction: (message: string) => void;
  onTabChange: (tab: 'pending' | 'running') => void;
};

function ProposalManagementContent({ activeTab, onAction, onTabChange }: ProposalManagementContentProps) {
  return (
    <>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Supplier Utama</Text>
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
            <RunningPoolCard key={pool.id} onAction={onAction} pool={pool} />
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
  return (
    <View style={styles.proposalCard}>
      <View style={styles.cardHeader}>
        <View style={styles.coopRow}>
          <View style={styles.coopIcon}>
            <Text style={styles.coopIconText}>KT</Text>
          </View>
          <View style={styles.coopCopy}>
            <Text style={styles.coopName}>{proposal.cooperative}</Text>
            <Text style={styles.locationText}>{proposal.location}</Text>
          </View>
        </View>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>PENDING</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <InfoBlock label="Jenis Pupuk" value={proposal.product} />
        <InfoBlock label="Target Volume" value={proposal.target} />
        <View style={styles.valueBlock}>
          <Text style={styles.infoLabel}>Estimasi Nilai Pool</Text>
          <Text style={styles.valueText}>{proposal.value}</Text>
        </View>
      </View>

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
          onPress={() => onAction(`Dummy: review detail ${proposal.cooperative} akan dibuka nanti.`)}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Review Detail</Text>
        </Pressable>
      </View>
    </View>
  );
}

function RunningPoolCard({ onAction, pool }: { onAction: (message: string) => void; pool: RunningPool }) {
  const isComplete = pool.progress >= 100;

  return (
    <View style={[styles.runningCard, isComplete && styles.runningCardComplete]}>
      <View style={[styles.progressAccent, { width: `${pool.progress}%` }]} />
      <View style={styles.poolHeader}>
        <View style={styles.poolTitleWrap}>
          <Text style={styles.poolId}>ID: {pool.id}</Text>
          <Text style={styles.poolName}>{pool.name}</Text>
        </View>
        <View style={[styles.statusBadge, isComplete && styles.statusBadgeComplete]}>
          <Text style={[styles.statusText, isComplete && styles.statusTextComplete]}>{pool.status}</Text>
        </View>
      </View>

      <View style={styles.poolBody}>
        <View>
          <Text style={styles.infoLabel}>Terkumpul</Text>
          <Text style={styles.poolTarget}>{pool.target}</Text>
          <Text style={styles.poolValue}>{pool.value}</Text>
        </View>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercent}>{pool.progress}%</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => onAction(`Dummy: dashboard ${pool.name} akan dibuka nanti.`)}
        style={styles.outlineButton}
      >
        <Text style={styles.outlineButtonText}>
          {isComplete ? 'Cek Status Pembayaran' : 'Lihat Dashboard Pool'}
        </Text>
      </Pressable>
    </View>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SupplierNavIcon({ index, isActive }: { index: number; isActive: boolean }) {
  const color = isActive ? colors.secondary : colors.onSurfaceVariant;

  if (index === 0) {
    return (
      <View style={[styles.collectiveIcon, { borderColor: color }]}>
        <View style={[styles.collectiveDot, { backgroundColor: color, left: 3, top: 5 }]} />
        <View style={[styles.collectiveDot, { backgroundColor: color, right: 3, top: 5 }]} />
        <View style={[styles.collectiveDotLarge, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View style={[styles.logIcon, { borderColor: color }]}>
      <View style={[styles.logSlash, { backgroundColor: color }]} />
      <View style={[styles.logLine, { backgroundColor: color }]} />
    </View>
  );
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
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryContainer,
    borderRadius: 19,
  },
  brandText: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 25,
    fontWeight: '700',
    lineHeight: 32,
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
  proposalCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.surfaceContainerLow,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    padding: 15,
    ...cardShadow,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  coopRow: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
  },
  coopIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tertiaryContainer,
    borderRadius: 21,
  },
  coopIconText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
  },
  coopCopy: {
    flex: 1,
    minWidth: 0,
  },
  coopName: {
    color: colors.textMain,
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  locationText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 183, 3, 0.18)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  pendingText: {
    color: colors.warningAmber,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  infoGrid: {
    backgroundColor: colors.background,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 11,
    padding: 12,
  },
  infoBlock: {
    width: '50%',
  },
  infoLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    marginBottom: 4,
  },
  infoValue: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  valueBlock: {
    width: '100%',
    borderTopColor: colors.surfaceContainerHigh,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  valueText: {
    color: colors.secondary,
    fontFamily: fonts.heading,
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 28,
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
    backgroundColor: colors.surfaceCard,
    borderColor: colors.primary,
    borderRadius: 9,
    borderWidth: 1,
  },
  rejectText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 9,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  runningCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(193, 200, 194, 0.52)',
    borderLeftColor: colors.tertiaryContainer,
    borderLeftWidth: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    overflow: 'hidden',
    padding: 15,
    position: 'relative',
    ...cardShadow,
  },
  runningCardComplete: {
    borderLeftColor: colors.successGreen,
  },
  progressAccent: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 4,
    backgroundColor: colors.successGreen,
  },
  poolHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  poolTitleWrap: {
    flex: 1,
  },
  poolId: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 14,
  },
  poolName: {
    color: colors.textMain,
    fontFamily: fonts.heading,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: 3,
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 63, 99, 0.1)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusBadgeComplete: {
    backgroundColor: 'rgba(43, 147, 72, 0.16)',
  },
  statusText: {
    color: colors.tertiaryContainer,
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  statusTextComplete: {
    color: colors.successGreen,
  },
  poolBody: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poolTarget: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 26,
  },
  poolValue: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  progressCircle: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.successGreen,
    borderRadius: 27,
    borderWidth: 4,
  },
  progressPercent: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  outlineButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderColor: colors.outlineVariant,
    borderRadius: 9,
    borderWidth: 1,
  },
  outlineButtonText: {
    color: colors.textMain,
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
    justifyContent: 'center',
    backgroundColor: colors.surfaceCard,
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    ...cardShadow,
  },
  exportText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
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
  auditNote: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(208, 0, 0, 0.06)',
    borderRadius: 5,
    color: colors.errorRed,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
    marginTop: 6,
    paddingHorizontal: 7,
    paddingVertical: 5,
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
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 64,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: 'rgba(193, 200, 194, 0.5)',
    borderTopWidth: 1,
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    boxShadow: '0 -4px 12px rgba(27, 67, 50, 0.05)',
  },
  navItem: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    bottom: 5,
    width: 5,
    height: 5,
    backgroundColor: colors.primary,
    borderRadius: 3,
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
  collectiveIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    position: 'relative',
  },
  collectiveDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  collectiveDotLarge: {
    position: 'absolute',
    left: 8,
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
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
    color: colors.secondary,
    fontWeight: '800',
  },
});
