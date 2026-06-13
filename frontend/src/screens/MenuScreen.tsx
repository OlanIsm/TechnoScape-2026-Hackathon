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
import { MainHeader } from '../components/MainHeader';
import { api } from '../services/api';
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
  dateSubmitted?: string;
  notes?: string;
  pdfName?: string;
  pdfData?: string;
  status?: string;
  supplierEmail?: string;
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
    value: 'Rp 350.000.000',
    dateSubmitted: '10 Juni 2026, 09:30',
    notes: 'Kebutuhan mendesak untuk awal musim tanam gadu.',
    pdfName: 'proposal_urea_tani_makmur.pdf',
    status: 'PENDING',
    supplierEmail: 'supplier@petrokimia.com',
  },
  {
    cooperative: 'KUD Sumber Rejeki',
    location: 'Kab. Kediri, Jawa Timur',
    product: 'NPK Phonska Plus',
    target: '100.000 Kg',
    value: 'Rp 700.000.000',
    dateSubmitted: '11 Juni 2026, 14:15',
    notes: 'Pengadaan pupuk NPK bersubsidi untuk anggota.',
    pdfName: 'proposal_npk_sumber_rejeki.pdf',
    status: 'PENDING',
    supplierEmail: 'supplier@petrokimia.com',
  },
  {
    cooperative: 'Kop. Subur Mandiri',
    location: 'Kab. Blitar, Jawa Timur',
    product: 'SP-36 Super',
    target: '30.000 Kg',
    value: 'Rp 210.000.000',
    dateSubmitted: '12 Juni 2026, 11:00',
    notes: 'Rencana pengadaan pupuk fosfat SP-36.',
    pdfName: 'proposal_sp36_subur_mandiri.pdf',
    status: 'PENDING',
    supplierEmail: 'supplier@petrokimia.com',
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

function normalizeEmail(email?: string) {
  return (email || '').trim().toLowerCase();
}

function getCurrentSupplierEmail() {
  const userJson = localStorage.getItem('volumemate_user');
  if (!userJson) {
    return 'supplier@petrokimia.com';
  }

  try {
    const user = JSON.parse(userJson) as { email?: string };
    return normalizeEmail(user.email) || 'supplier@petrokimia.com';
  } catch {
    return 'supplier@petrokimia.com';
  }
}

function loadAllProposals() {
  const saved = localStorage.getItem('volumemate_proposals');
  return saved ? (JSON.parse(saved) as PendingProposal[]) : pendingProposals;
}

function filterProposalsForSupplier(proposals: PendingProposal[], supplierEmail: string) {
  const normalizedSupplierEmail = normalizeEmail(supplierEmail);
  return proposals.filter((proposal) => {
    const proposalSupplierEmail = normalizeEmail(proposal.supplierEmail);
    return proposalSupplierEmail === normalizedSupplierEmail;
  });
}

function isSameProposal(a: PendingProposal, b: PendingProposal) {
  return (
    a.cooperative === b.cooperative &&
    a.product === b.product &&
    a.target === b.target &&
    (a.dateSubmitted || '') === (b.dateSubmitted || '')
  );
}

function calculateEstimatedValue(product: string, volumeKg: number): number {
  const prodLower = product.toLowerCase();
  if (prodLower.includes('npk') || prodLower.includes('phonska')) {
    if (volumeKg >= 20000) return volumeKg * 7000;
    if (volumeKg >= 15000) return volumeKg * 8500;
    if (volumeKg >= 5000) return volumeKg * 9200;
    return volumeKg * 10000;
  }
  if (volumeKg >= 500) return volumeKg * 7000;
  if (volumeKg >= 100) return volumeKg * 7800;
  return volumeKg * 8500;
}

function calculateDbEstimatedValue(products: any[], productName: string, volumeKg: number): number {
  const product = products.find((p) =>
    p.name.toLowerCase().includes(productName.toLowerCase()) ||
    productName.toLowerCase().includes(p.name.toLowerCase())
  );
  
  if (!product || !product.priceTiers || product.priceTiers.length === 0) {
    return calculateEstimatedValue(productName, volumeKg);
  }
  
  // Find matching tier
  const matchingTier = product.priceTiers.find((tier: any) => {
    const min = tier.minVolume;
    const max = tier.maxVolume;
    return volumeKg >= min && (max === null || max === undefined || volumeKg <= max);
  }) || product.priceTiers[product.priceTiers.length - 1];
  
  const pricePerKg = matchingTier ? matchingTier.pricePerKg : 9000;
  return volumeKg * pricePerKg;
}

function parseVolumeKg(targetStr: string): number {
  const cleanStr = targetStr.replace(/[^0-9]/g, '');
  return parseInt(cleanStr, 10) || 0;
}

const mapDbAuditLogToSupplierAuditLog = (log: any): SupplierAuditLog | null => {
  try {
    const details = JSON.parse(log.details);
    const dateFormatted = new Date(log.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ', ' + new Date(log.createdAt).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const baseLog = {
      id: log.id.substring(0, 12).toUpperCase(),
      date: dateFormatted,
    };

    if (log.action === 'MANUAL_TRANSACTION') {
      return {
        ...baseLog,
        cooperative: log.user?.koperasi?.name || 'Koperasi Mitra',
        product: details.jenisPupuk || 'Pupuk',
        amount: `${(details.quantity || 0).toLocaleString('id-ID')} Kg`,
        total: `Rp ${(details.totalPrice || 0).toLocaleString('id-ID')}`,
        status: 'SUCCESS',
        statusTone: 'success',
        note: `Manual transaksi via supplier: ${details.supplierName || '-'}`,
      };
    }

    if (log.action === 'OUTGOING_DISTRIBUTION') {
      return {
        ...baseLog,
        cooperative: log.user?.koperasi?.name || 'Koperasi Mitra',
        product: details.jenisPupuk || 'Pupuk',
        amount: `${(details.quantity || 0).toLocaleString('id-ID')} Kg`,
        total: `Rp ${(details.totalPrice || 0).toLocaleString('id-ID')}`,
        status: 'SUCCESS',
        statusTone: 'success',
        note: `Distribusi ke Petani: ${details.buyerName || '-'}`,
      };
    }

    if (log.action === 'CONFIRM_ORDER') {
      return {
        ...baseLog,
        cooperative: log.user?.koperasi?.name || 'Koperasi Mitra',
        product: 'Konfirmasi Order',
        amount: '-',
        total: '-',
        status: 'SUCCESS',
        statusTone: 'success',
        note: `Order ${details.orderId || ''} dikonfirmasi.`,
      };
    }

    if (log.action === 'FINALIZE_POOL_SUCCESS') {
      return {
        ...baseLog,
        cooperative: 'VolumeMate System',
        product: 'Finalisasi Pool Sukses',
        amount: `${(details.totalVolumeKg || 0).toLocaleString('id-ID')} Kg`,
        total: '-',
        status: 'SUCCESS',
        statusTone: 'success',
        note: `Pool ${details.poolId || ''} berhasil diselesaikan.`,
      };
    }

    if (log.action === 'FINALIZE_POOL_FALLBACK_GRACE') {
      return {
        ...baseLog,
        cooperative: 'VolumeMate System',
        product: 'Grace Period Pool',
        amount: `${(details.totalVolumeKg || 0).toLocaleString('id-ID')} Kg`,
        total: '-',
        status: 'FUNDING CANCELED',
        statusTone: 'warning',
        note: `Pool diperpanjang hingga ${new Date(details.extendedDeadline).toLocaleDateString('id-ID')}`,
      };
    }

    return {
      ...baseLog,
      cooperative: log.user?.name || 'User',
      product: log.action,
      amount: '-',
      total: '-',
      status: 'SUCCESS',
      statusTone: 'success',
      note: log.details,
    };
  } catch (e) {
    return null;
  }
};

export function SupplierMenuScreen({ onLogoutPress }: SupplierMenuScreenProps) {
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'pending' | 'running'>('pending');
  const [activeMenu, setActiveMenu] = useState<SupplierMenu>('proposal');
  const [notice, setNotice] = useState('');
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supplierEmail = getCurrentSupplierEmail();

  // Local interactive states initialized from localStorage
  const [proposals, setProposals] = useState<PendingProposal[]>(() =>
    filterProposalsForSupplier(loadAllProposals(), supplierEmail),
  );
  const [pools, setPools] = useState<RunningPool[]>([]);
  const [auditLogs, setAuditLogs] = useState<SupplierAuditLog[]>(supplierAuditLogs);
  const [reviewingProposal, setReviewingProposal] = useState<PendingProposal | null>(null);
  const [deadlineText, setDeadlineText] = useState('7 Hari');

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2400);
  };

  const mapDbPoolToRunningPool = (bp: any, productsList: any[]): RunningPool => {
    const currentVolumeKg = bp.orders?.reduce((acc: number, order: any) => {
      return acc + (order.orderItems?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0);
    }, 0) || 0;
    const targetVolumeKg = bp.targetVolumeKg || 10000;
    const progress = Math.min(100, Math.round((currentVolumeKg / targetVolumeKg) * 100));
    
    const matchingProduct = productsList.find((p) => p.id === bp.productId) || bp.product;
    const activePrice = matchingProduct?.priceTiers?.[0]?.pricePerKg || 9000;
    const estimatedValue = targetVolumeKg * activePrice;

    return {
      id: bp.id,
      name: bp.name || `Pool ${bp.product?.name || 'Pupuk'}`,
      progress,
      status: progress >= 100 ? 'PAYMENT WAITING' : 'OPEN FOR KOPERASI',
      target: `${currentVolumeKg.toLocaleString('id-ID')} / ${targetVolumeKg.toLocaleString('id-ID')} Kg`,
      value: `Rp ${estimatedValue.toLocaleString('id-ID')}`,
    };
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [poolData, auditData, productData] = await Promise.all([
        api.getActivePools() as Promise<any[]>,
        api.getAuditLogs() as Promise<any[]>,
        api.getProducts() as Promise<any[]>,
      ]);

      setDbProducts(productData);

      // 1. Map and merge pools
      const mappedDbPools = poolData.map((p) => mapDbPoolToRunningPool(p, productData));
      const savedLocal = localStorage.getItem('volumemate_approved_pools');
      const localPools = savedLocal ? JSON.parse(savedLocal) : [];
      
      const combinedPools = [...localPools];
      mappedDbPools.forEach((dbp) => {
        if (!combinedPools.some((lp) => lp.id === dbp.id)) {
          combinedPools.push(dbp);
        }
      });
      runningPools.forEach((rp) => {
        if (!combinedPools.some((lp) => lp.id === rp.id)) {
          combinedPools.push(rp);
        }
      });
      setPools(combinedPools);

      // 2. Map and merge audit logs
      const mappedDbAudits = auditData
        .map(mapDbAuditLogToSupplierAuditLog)
        .filter((l): l is SupplierAuditLog => l !== null);

      const combinedAudits = [...mappedDbAudits];
      supplierAuditLogs.forEach((sal) => {
        if (!combinedAudits.some((l) => l.id === sal.id)) {
          combinedAudits.push(sal);
        }
      });
      setAuditLogs(combinedAudits);

    } catch (err) {
      console.error('Failed to load supplier data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (proposal: PendingProposal) => {
    const updatedAllProposals = loadAllProposals().filter((p) => !isSameProposal(p, proposal));
    setProposals(filterProposalsForSupplier(updatedAllProposals, supplierEmail));
    localStorage.setItem('volumemate_proposals', JSON.stringify(updatedAllProposals));

    const newPool: RunningPool = {
      id: `#PL-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: `Pool ${proposal.product.split(' ')[0]} ${proposal.cooperative.replace('Koperasi ', '').replace('KUD ', '')}`,
      progress: 0,
      status: 'OPEN FOR KOPERASI',
      target: `0 / ${proposal.target}`,
      value: proposal.value,
    };
    const updatedPools = [newPool, ...pools];
    setPools(updatedPools);

    const localPoolsOnly = updatedPools.filter((p) => p.id.startsWith('#'));
    localStorage.setItem('volumemate_approved_pools', JSON.stringify(localPoolsOnly));

    setReviewingProposal(null);
    showNotice(`Proposal ${proposal.cooperative} disetujui! Pool dibuka dengan batas waktu ${deadlineText}.`);
  };

  const handleReject = (proposal: PendingProposal) => {
    const updatedAllProposals = loadAllProposals().filter((p) => !isSameProposal(p, proposal));
    setProposals(filterProposalsForSupplier(updatedAllProposals, supplierEmail));
    localStorage.setItem('volumemate_proposals', JSON.stringify(updatedAllProposals));

    const newAuditLog: SupplierAuditLog = {
      id: `PO-2026${Math.floor(100000 + Math.random() * 900000)}`,
      cooperative: proposal.cooperative,
      product: proposal.product,
      amount: proposal.target,
      total: '-',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'DECLINED',
      statusTone: 'error',
      note: 'Ditolak oleh supplier.',
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);
    setReviewingProposal(null);
    showNotice(`Proposal dari ${proposal.cooperative} ditolak.`);
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
              onAction={showNotice}
              onTabChange={setActiveTab}
              pools={pools}
              proposals={proposals}
              onReviewProposal={(p) => setReviewingProposal(p)}
              onRejectProposal={(p) => handleReject(p)}
            />
          ) : (
            <SupplierAuditLogContent auditLogs={auditLogs} onAction={showNotice} />
          )}
        </ScrollView>

        {reviewingProposal ? (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Detail Proposal</Text>
                <Pressable onPress={() => setReviewingProposal(null)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  <Text style={styles.modalSectionTitle}>Status Pengajuan</Text>
                  <View style={styles.statusRow}>
                    <View style={styles.statusBadgePending}>
                      <Text style={styles.statusBadgeText}>{reviewingProposal.status || 'PENDING'}</Text>
                    </View>
                  </View>

                  <Text style={[styles.modalSectionTitle, { marginTop: 16 }]}>Informasi Pengaju</Text>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Nama Koperasi</Text>
                    <Text style={styles.modalInfoVal}>{reviewingProposal.cooperative}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Lokasi</Text>
                    <Text style={styles.modalInfoVal}>{reviewingProposal.location}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Kapan Diajukan</Text>
                    <Text style={styles.modalInfoVal}>{reviewingProposal.dateSubmitted || '13 Juni 2026, 17:00'}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Email Pemasok Tujuan</Text>
                    <Text style={styles.modalInfoVal}>{reviewingProposal.supplierEmail || '-'}</Text>
                  </View>

                  <Text style={[styles.modalSectionTitle, { marginTop: 16 }]}>Detail Kebutuhan</Text>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Jenis Pupuk</Text>
                    <Text style={styles.modalInfoVal}>{reviewingProposal.product}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Target Volume</Text>
                    <Text style={styles.modalInfoVal}>{reviewingProposal.target}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Catatan</Text>
                    <Text style={[styles.modalInfoVal, { maxWidth: 200, textAlign: 'right' }]}>
                      {reviewingProposal.notes || 'Tidak ada catatan tambahan.'}
                    </Text>
                  </View>

                  <Text style={[styles.modalSectionTitle, { marginTop: 16 }]}>Estimasi Nilai Total</Text>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Estimasi Koperasi</Text>
                    <Text style={styles.modalInfoVal}>
                      {reviewingProposal.value}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Estimasi Supplier (Sistem)</Text>
                    <Text style={[styles.modalInfoVal, styles.highlightValue]}>
                      {(() => {
                        const volumeKg = parseVolumeKg(reviewingProposal.target);
                        const estVal = calculateDbEstimatedValue(dbProducts, reviewingProposal.product, volumeKg);
                        return `Rp ${estVal.toLocaleString('id-ID')}`;
                      })()}
                    </Text>
                  </View>

                  <Text style={[styles.modalSectionTitle, { marginTop: 16 }]}>Lampiran Dokumen</Text>
                  <View style={styles.pdfAttachmentRow}>
                    <Text style={styles.pdfAttachmentName}>
                      📄 {reviewingProposal.pdfName || 'proposal_pengadaan.pdf'}
                    </Text>
                    <Pressable
                      onPress={() => {
                        if (reviewingProposal.pdfData) {
                          const newTab = window.open();
                          if (newTab) {
                            newTab.document.write(
                              `<iframe src="${reviewingProposal.pdfData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                            );
                          }
                        } else {
                          window.open("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank");
                        }
                      }}
                      style={styles.openPdfBtn}
                    >
                      <Text style={styles.openPdfBtnText}>Buka PDF</Text>
                    </Pressable>
                  </View>

                  <Text style={[styles.modalSectionTitle, { marginTop: 16 }]}>Atur Batas Waktu (Deadline)</Text>
                  <Text style={styles.modalInputHelp}>Pilih tenggat waktu pengumpulan dana oleh koperasi:</Text>
                  <View style={styles.deadlineOptions}>
                    {['7 Hari', '14 Hari', '30 Hari'].map((opt) => (
                      <Pressable
                        key={opt}
                        onPress={() => setDeadlineText(opt)}
                        style={[
                          styles.deadlineOptBtn,
                          deadlineText === opt && styles.deadlineOptBtnActive,
                        ]}
                      >
                        <Text style={[
                          styles.deadlineOptText,
                          deadlineText === opt && styles.deadlineOptTextActive,
                        ]}>
                          {opt}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable
                  onPress={() => handleReject(reviewingProposal)}
                  style={styles.modalRejectBtn}
                >
                  <Text style={styles.modalRejectText}>Tolak</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleApprove(reviewingProposal)}
                  style={styles.modalApproveBtn}
                >
                  <Text style={styles.modalApproveText}>Setujui & Buka Pool</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

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
  auditLogs: SupplierAuditLog[];
  onAction: (message: string) => void;
};

function SupplierAuditLogContent({ auditLogs, onAction }: SupplierAuditLogContentProps) {
  return (
    <>
      <View style={styles.auditHeader}>
        <View>
          <Text style={styles.title}>Log Audit Supplier</Text>
          <Text style={styles.subtitle}>Riwayat pool final dan keputusan supplier.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            window.open(api.exportCsvUrl(), '_blank');
          }}
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
        <AuditSummaryCard label="Total Final" value={String(auditLogs.length)} />
        <AuditSummaryCard isSuccess label="Sukses" value={String(auditLogs.filter(l => l.status === 'SUCCESS').length)} />
        <AuditSummaryCard isError label="Ditolak" value={String(auditLogs.filter(l => l.status === 'DECLINED').length)} />
        <AuditSummaryCard isWarning label="Batal/Gagal" value={String(auditLogs.filter(l => ['FUNDING CANCELED', 'AUTO DECLINED'].includes(l.status)).length)} />
      </View>

      <View style={styles.auditList}>
        {auditLogs.map((log) => (
          <SupplierAuditLogCard key={log.id} log={log} />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => onAction('Semua histori audit log supplier telah berhasil dimuat.')}
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
  pools: RunningPool[];
  proposals: PendingProposal[];
  onReviewProposal: (proposal: PendingProposal) => void;
  onRejectProposal: (proposal: PendingProposal) => void;
};

function ProposalManagementContent({
  activeTab,
  onAction,
  onTabChange,
  pools,
  proposals,
  onReviewProposal,
  onRejectProposal,
}: ProposalManagementContentProps) {
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
            Menunggu <Text style={styles.tabCount}>{proposals.length}</Text>
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onTabChange('running')}
          style={[styles.tabButton, activeTab === 'running' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === 'running' && styles.tabTextActive]}>
            Berjalan <Text style={styles.tabCountMuted}>{pools.length}</Text>
          </Text>
        </Pressable>
      </View>

      {activeTab === 'pending' ? (
        <View style={styles.section}>
          <View>
            <Text style={styles.sectionTitle}>Proposal Baru</Text>
            <Text style={styles.sectionSubtitle}>Menunggu persetujuan Anda untuk membuka pool.</Text>
          </View>
          {proposals.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada proposal pending.</Text>
          ) : (
            proposals.map((proposal) => (
              <PendingProposalCard
                key={proposal.cooperative}
                onAction={onAction}
                proposal={proposal}
                onReject={() => onRejectProposal(proposal)}
                onReview={() => onReviewProposal(proposal)}
              />
            ))
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <View>
            <Text style={styles.sectionTitle}>Pool Aktif</Text>
            <Text style={styles.sectionSubtitle}>Pantau progress pool yang sedang berjalan.</Text>
          </View>
          {pools.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada pool berjalan.</Text>
          ) : (
            pools.map((pool) => (
              <RunningPoolCard key={pool.id} onAction={onAction} pool={pool} />
            ))
          )}
        </View>
      )}
    </>
  );
}

function PendingProposalCard({
  onAction,
  proposal,
  onReject,
  onReview,
}: {
  onAction: (message: string) => void;
  proposal: PendingProposal;
  onReject: () => void;
  onReview: () => void;
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
          onPress={onReject}
          style={styles.rejectButton}
        >
          <Text style={styles.rejectText}>Tolak</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onReview}
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
        onPress={() => onAction('Dashboard detail pool aktif hanya dapat diakses oleh koperasi partisipan.')}
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 28, 21, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: colors.surfaceCard,
    width: '100%',
    maxWidth: 390,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
    gap: 16,
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  modalScroll: {
    flex: 1,
  },
  modalBody: {
    gap: 8,
  },
  modalSectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 6,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  modalInfoLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  modalInfoVal: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMain,
  },
  modalInputHelp: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.outline,
    marginBottom: 6,
  },
  deadlineOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  deadlineOptBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  deadlineOptBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  deadlineOptText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  deadlineOptTextActive: {
    color: colors.onPrimary,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
    paddingTop: 12,
  },
  modalRejectBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.errorRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalRejectText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.errorRed,
    fontWeight: '600',
  },
  modalApproveBtn: {
    flex: 2,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalApproveText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.outline,
    textAlign: 'center',
    marginVertical: 24,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  statusBadgePending: {
    backgroundColor: 'rgba(255, 183, 3, 0.15)',
    borderColor: 'rgba(255, 183, 3, 0.3)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.warningAmber,
    fontWeight: '800',
  },
  highlightValue: {
    color: colors.successGreen,
    fontWeight: '800',
    fontSize: 14,
  },
  pdfAttachmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.outlineVariant,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  pdfAttachmentName: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMain,
    flex: 1,
    marginRight: 10,
  },
  openPdfBtn: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  openPdfBtnText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
