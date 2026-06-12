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
import { colors, fonts } from '../theme';

type MenuItem = {
  description: string;
  label: string;
};

type MenuScreenProps = {
  items: MenuItem[];
  onLogoutPress: () => void;
  subtitle: string;
  title: string;
};

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

const koperasiItems: MenuItem[] = [
  {
    description: 'Ringkasan pengadaan dan metrik transaksi koperasi.',
    label: 'Beranda',
  },
  {
    description: 'Lihat, buat, dan ikuti pembelian pupuk bersama.',
    label: 'Kolektif Beli',
  },
  {
    description: 'Catat pembelian pupuk manual atau offline.',
    label: 'Catat Transaksi',
  },
  {
    description: 'Lihat transaksi final dan riwayat pool selesai.',
    label: 'Audit Log',
  },
];

const supplierItems: MenuItem[] = [
  {
    description: 'Tinjau proposal pool yang menunggu keputusan.',
    label: 'Pending Pool',
  },
  {
    description: 'Pantau pool yang sudah diterima dan sedang berjalan.',
    label: 'Pool Berjalan',
  },
  {
    description: 'Lihat outcome final terkait pemasok.',
    label: 'Audit Log',
  },
];

export function KoperasiMenuScreen({ onLogoutPress }: Pick<MenuScreenProps, 'onLogoutPress'>) {
  return (
    <MenuScreen
      items={koperasiItems}
      onLogoutPress={onLogoutPress}
      subtitle="Masuk sebagai koperasi. Pilih menu yang ingin dikerjakan."
      title="Menu Koperasi"
    />
  );
}

export function SupplierMenuScreen({ onLogoutPress }: Pick<MenuScreenProps, 'onLogoutPress'>) {
  return (
    <MenuScreen
      items={supplierItems}
      onLogoutPress={onLogoutPress}
      subtitle="Masuk sebagai pemasok. Kelola proposal dan audit pool."
      title="Menu Supplier"
    />
  );
}

function MenuScreen({ items, onLogoutPress, subtitle, title }: MenuScreenProps) {
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
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.menuList}>
          {items.map((item, index) => (
            <Pressable
              accessibilityRole="button"
              key={item.label}
              onPress={() => undefined}
              style={styles.menuCard}
            >
              <View style={styles.menuNumber}>
                <Text style={styles.menuNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.menuCopy}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
            </Pressable>
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
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
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
    marginBottom: 20,
    marginTop: 12,
  },
  title: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  menuList: {
    gap: 12,
  },
  menuCard: {
    minHeight: 96,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    padding: 16,
    ...cardShadow,
  },
  menuNumber: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryContainer,
    borderRadius: 18,
  },
  menuNumberText: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  menuCopy: {
    flex: 1,
  },
  menuLabel: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  menuDescription: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
});
