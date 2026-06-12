import {
  Pressable,
  SafeAreaView,
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

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

const pendingAccounts = [
  {
    contact: 'Budi Santoso',
    name: 'Koperasi Tani Makmur',
    role: 'Koperasi',
    submittedAt: 'Diajukan 2 jam lalu',
  },
  {
    contact: 'Siti Rahma',
    name: 'PT Agro Sejahtera',
    role: 'Supplier',
    submittedAt: 'Diajukan 1 hari lalu',
  },
];

export function AdminApprovalScreen({ onLogoutPress }: AdminApprovalScreenProps) {
  const { height } = useWindowDimensions();

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <BrandMark size={28} />
            </View>
            <Text style={styles.brandText}>VolumeMate</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onLogoutPress} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Keluar</Text>
          </Pressable>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Persetujuan Akun</Text>
          <Text style={styles.subtitle}>
            Tinjau pendaftaran Koperasi dan Supplier. Password tidak ditampilkan ke Admin.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>?</Text>
          <TextInput
            accessibilityLabel="Cari nama organisasi"
            placeholder="Cari nama organisasi..."
            placeholderTextColor={colors.outline}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filterRow}>
          {['Semua', 'Koperasi', 'Supplier'].map((filter, index) => (
            <View key={filter} style={[styles.filterChip, index === 0 && styles.filterChipActive]}>
              <Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>
                {filter}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.list}>
          {pendingAccounts.map((account) => (
            <View key={account.name} style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <View style={styles.accountCopy}>
                  <View style={styles.accountTitleRow}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <View style={styles.rolePill}>
                      <Text style={styles.rolePillText}>{account.role}</Text>
                    </View>
                  </View>
                  <Text style={styles.accountMeta}>
                    {account.contact} - {account.submittedAt}
                  </Text>
                </View>
              </View>
              <View style={styles.reviewRow}>
                <Pressable accessibilityRole="button" onPress={() => undefined} style={styles.reviewButton}>
                  <Text style={styles.reviewButtonText}>Review</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
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
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  topBar: {
    minHeight: 72,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  logoCircle: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: 21,
  },
  brandText: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
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
  header: {
    gap: 8,
    marginBottom: 18,
    marginTop: 8,
  },
  title: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  searchBox: {
    minHeight: 48,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 12,
  },
  searchIcon: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 0,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
    fontWeight: '600',
    lineHeight: 16,
  },
  filterTextActive: {
    color: colors.onPrimary,
  },
  list: {
    gap: 12,
  },
  accountCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    ...cardShadow,
  },
  accountHeader: {
    paddingBottom: 14,
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
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  rolePill: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rolePillText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  accountMeta: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
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
    fontWeight: '600',
    letterSpacing: 0.6,
    lineHeight: 16,
  },
});
