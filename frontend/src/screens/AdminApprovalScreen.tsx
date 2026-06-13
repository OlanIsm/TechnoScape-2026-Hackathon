import { useMemo, useState } from 'react';
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
import { colors, fonts } from '../theme';

type AdminApprovalScreenProps = {
  onLogoutPress: () => void;
};

type PendingAccount = {
  address: string;
  contact: string;
  documentName: string;
  email: string;
  id: string;
  ktpName: string;
  name: string;
  phone: string;
  role: 'Koperasi' | 'Supplier';
  submittedAt: string;
};

const pendingAccounts: PendingAccount[] = [
  {
    address: 'Jl. Raya Pertanian No. 45, Desa Subur, Kec. Tanijaya, Kabupaten Bandung, Jawa Barat 40999',
    contact: 'Budi Santoso',
    documentName: 'Akta_Pendirian_Koperasi.pdf',
    email: 'budi.tani@makmur.co.id',
    id: 'ACC-2026-001',
    ktpName: 'KTP_Budi_Santoso.jpg',
    name: 'Koperasi Tani Makmur',
    phone: '+62 812-3456-7890',
    role: 'Koperasi',
    submittedAt: 'Diajukan 2 jam lalu',
  },
  {
    address: 'Jl. Industri Pupuk No. 12, Kawasan Agro Niaga, Surabaya, Jawa Timur 60293',
    contact: 'Siti Rahma',
    documentName: 'NIB_PT_Agro_Sejahtera.pdf',
    email: 'siti@agrosejahtera.id',
    id: 'ACC-2026-002',
    ktpName: 'KTP_Siti_Rahma.jpg',
    name: 'PT Agro Sejahtera',
    phone: '+62 811-2222-4411',
    role: 'Supplier',
    submittedAt: 'Diajukan 1 hari lalu',
  },
  {
    address: 'Dusun Mekarsari, Kec. Wates, Kabupaten Kediri, Jawa Timur 64174',
    contact: 'Ahmad Fauzi',
    documentName: 'Surat_Koperasi_Mekarsari.pdf',
    email: 'admin@mekarsari-kop.id',
    id: 'ACC-2026-003',
    ktpName: 'KTP_Ahmad_Fauzi.jpg',
    name: 'Koperasi Mekarsari',
    phone: '+62 857-9012-3344',
    role: 'Koperasi',
    submittedAt: 'Diajukan 3 hari lalu',
  },
];

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function AdminApprovalScreen({ onLogoutPress }: AdminApprovalScreenProps) {
  const { height } = useWindowDimensions();
  const [activeFilter, setActiveFilter] = useState<'Semua' | 'Koperasi' | 'Supplier'>('Semua');
  const [query, setQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<PendingAccount | null>(null);
  const [notice, setNotice] = useState('');

  const visibleAccounts = useMemo(() => {
    return pendingAccounts.filter((account) => {
      const matchesFilter = activeFilter === 'Semua' || account.role === activeFilter;
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        account.name.toLowerCase().includes(normalizedQuery) ||
        account.contact.toLowerCase().includes(normalizedQuery) ||
        account.email.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2400);
  };

  const closeReview = () => setSelectedAccount(null);

  const decideAccount = (action: 'disetujui' | 'ditolak') => {
    if (!selectedAccount) {
      return;
    }

    showNotice(`Dummy: ${selectedAccount.name} ${action}.`);
    closeReview();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={[styles.shell, { height }]}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <BrandMark size={34} />
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
          <View style={styles.header}>
            <Text style={styles.adminLabel}>Admin</Text>
            <Text style={styles.title}>Persetujuan Akun</Text>
            <Text style={styles.subtitle}>
              Tinjau akun Koperasi dan Supplier baru. Password tidak pernah ditampilkan ke admin.
            </Text>
          </View>

          {notice ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          <View style={styles.searchBox}>
            <SearchIcon />
            <TextInput
              accessibilityLabel="Cari nama organisasi"
              onChangeText={setQuery}
              placeholder="Cari nama organisasi..."
              placeholderTextColor={colors.outline}
              style={styles.searchInput}
              value={query}
            />
          </View>

          <View style={styles.filterRow}>
            {(['Semua', 'Koperasi', 'Supplier'] as const).map((filter) => {
              const isActive = filter === activeFilter;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{filter}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.summaryCard}>
            <View>
              <Text style={styles.summaryLabel}>Pending Account</Text>
              <Text style={styles.summaryValue}>{visibleAccounts.length}</Text>
            </View>
            <Text style={styles.summaryHint}>Menunggu review admin</Text>
          </View>

          <View style={styles.list}>
            {visibleAccounts.map((account) => (
              <AccountCard account={account} key={account.id} onReviewPress={setSelectedAccount} />
            ))}
          </View>
        </ScrollView>

        {selectedAccount ? (
          <ReviewSheet
            account={selectedAccount}
            onApprove={() => decideAccount('disetujui')}
            onClose={closeReview}
            onReject={() => decideAccount('ditolak')}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function AccountCard({
  account,
  onReviewPress,
}: {
  account: PendingAccount;
  onReviewPress: (account: PendingAccount) => void;
}) {
  return (
    <View style={styles.accountCard}>
      <View style={styles.accountTopRow}>
        <View style={styles.accountCopy}>
          <View style={styles.accountTitleRow}>
            <Text style={styles.accountName}>{account.name}</Text>
            <View style={[styles.rolePill, account.role === 'Supplier' && styles.rolePillSupplier]}>
              <Text style={styles.rolePillText}>{account.role}</Text>
            </View>
          </View>
          <Text style={styles.accountMeta}>
            {account.contact} - {account.submittedAt}
          </Text>
          <Text style={styles.emailText}>{account.email}</Text>
        </View>
      </View>
      <View style={styles.reviewRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onReviewPress(account)}
          style={styles.reviewButton}
        >
          <Text style={styles.reviewButtonText}>Review</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ReviewSheet({
  account,
  onApprove,
  onClose,
  onReject,
}: {
  account: PendingAccount;
  onApprove: () => void;
  onClose: () => void;
  onReject: () => void;
}) {
  return (
    <View style={styles.overlay}>
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.scrim} />
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <View style={styles.sheetTitleWrap}>
            <Text style={styles.sheetTitle}>Review: {account.name}</Text>
            <Text style={styles.sheetSubtitle}>Pengajuan {account.role}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>x</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Data Organisasi & Penanggung Jawab</Text>
            <View style={styles.detailGrid}>
              <DetailItem label="Nama Organisasi" value={account.name} />
              <DetailItem label="Role" value={account.role} />
              <DetailItem label="Penanggung Jawab" value={account.contact} />
              <DetailItem label="Email" value={account.email} />
              <DetailItem label="Nomor Telepon" value={account.phone} />
              <DetailItem isWide label="Alamat Lengkap" value={account.address} />
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Dokumen Pendukung</Text>
            <View style={styles.documentGrid}>
              <View style={styles.ktpPreview}>
                <Text style={styles.documentLabel}>Foto KTP Penanggung Jawab</Text>
                <View style={styles.ktpCard}>
                  <View style={styles.ktpPhoto} />
                  <View style={styles.ktpLines}>
                    <View style={styles.ktpLineLong} />
                    <View style={styles.ktpLineMid} />
                    <View style={styles.ktpLineShort} />
                  </View>
                </View>
                <Text style={styles.documentName}>{account.ktpName}</Text>
              </View>

              <View style={styles.pdfPreview}>
                <Text style={styles.documentLabel}>PDF Bukti / Legalitas</Text>
                <View style={styles.pdfCard}>
                  <Text style={styles.pdfIcon}>PDF</Text>
                  <Text numberOfLines={1} style={styles.pdfName}>
                    {account.documentName}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.sheetActions}>
          <Pressable accessibilityRole="button" onPress={onReject} style={styles.rejectButton}>
            <Text style={styles.rejectText}>Tolak</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onApprove} style={styles.approveButton}>
            <Text style={styles.approveText}>Setujui Akun</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function DetailItem({ isWide = false, label, value }: { isWide?: boolean; label: string; value: string }) {
  return (
    <View style={[styles.detailItem, isWide && styles.detailItemWide]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function SearchIcon() {
  return (
    <View style={styles.searchIcon}>
      <View style={styles.searchLens} />
      <View style={styles.searchHandle} />
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
    paddingBottom: 18,
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
    gap: 14,
    paddingBottom: 34,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    gap: 7,
  },
  adminLabel: {
    color: colors.secondary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.onSurface,
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
  searchBox: {
    minHeight: 48,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: 1,
    paddingLeft: 12,
  },
  searchIcon: {
    width: 22,
    height: 22,
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
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 14,
    minHeight: 48,
    paddingHorizontal: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    minHeight: 38,
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  filterChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  filterText: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  filterTextActive: {
    color: colors.onPrimary,
  },
  summaryCard: {
    minHeight: 92,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCard,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 10,
    borderWidth: 1,
    padding: 15,
    ...cardShadow,
  },
  summaryLabel: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginTop: 3,
  },
  summaryHint: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  list: {
    gap: 12,
  },
  accountCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 10,
    borderWidth: 1,
    padding: 15,
    ...cardShadow,
  },
  accountTopRow: {
    paddingBottom: 12,
  },
  accountCopy: {
    gap: 5,
  },
  accountTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accountName: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 26,
  },
  rolePill: {
    backgroundColor: colors.tertiaryFixed,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rolePillSupplier: {
    backgroundColor: colors.secondaryContainer,
  },
  rolePillText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
    textTransform: 'uppercase',
  },
  accountMeta: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  emailText: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  reviewRow: {
    alignItems: 'flex-end',
    borderTopColor: colors.surfaceVariant,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  reviewButton: {
    minHeight: 38,
    justifyContent: 'center',
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  reviewButtonText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 28, 21, 0.42)',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  sheetHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderBottomColor: colors.surfaceVariant,
    borderBottomWidth: 1,
    gap: 12,
    padding: 16,
  },
  sheetTitleWrap: {
    flex: 1,
  },
  sheetTitle: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 27,
  },
  sheetSubtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 17,
  },
  closeText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 20,
  },
  sheetBody: {
    gap: 18,
    padding: 16,
  },
  detailSection: {
    gap: 12,
  },
  detailSectionTitle: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  detailItem: {
    width: '50%',
    paddingRight: 10,
  },
  detailItemWide: {
    width: '100%',
  },
  detailLabel: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  detailValue: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 3,
  },
  documentGrid: {
    gap: 12,
  },
  ktpPreview: {
    gap: 7,
  },
  pdfPreview: {
    gap: 7,
  },
  documentLabel: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  ktpCard: {
    height: 112,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.outlineVariant,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  ktpPhoto: {
    width: 54,
    height: 70,
    backgroundColor: colors.tertiaryFixed,
    borderRadius: 6,
  },
  ktpLines: {
    flex: 1,
    gap: 8,
  },
  ktpLineLong: {
    height: 8,
    width: '90%',
    backgroundColor: colors.outlineVariant,
    borderRadius: 999,
  },
  ktpLineMid: {
    height: 8,
    width: '70%',
    backgroundColor: colors.outlineVariant,
    borderRadius: 999,
  },
  ktpLineShort: {
    height: 8,
    width: '46%',
    backgroundColor: colors.outlineVariant,
    borderRadius: 999,
  },
  documentName: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  pdfCard: {
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.outlineVariant,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  pdfIcon: {
    color: colors.errorRed,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  pdfName: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  sheetActions: {
    borderTopColor: colors.surfaceVariant,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 16,
  },
  rejectButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.errorRed,
    borderRadius: 9,
    borderWidth: 1,
  },
  rejectText: {
    color: colors.errorRed,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  approveButton: {
    flex: 1.15,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 9,
  },
  approveText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
});
