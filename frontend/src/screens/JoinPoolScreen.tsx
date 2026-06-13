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
import type { ProcurementPool } from '../data/pools';
import { colors, fonts } from '../theme';

type JoinPoolScreenProps = {
  onBackPress: () => void;
  onConfirm: (poolId: number, contributionTon: number) => void;
  pool: ProcurementPool;
};

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.06)',
} as unknown as ViewStyle;

function formatCurrency(value: number) {
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`;
}

export function JoinPoolScreen({ onBackPress, onConfirm, pool }: JoinPoolScreenProps) {
  const { height } = useWindowDimensions();
  const maxContribution = Math.max(pool.targetTon - pool.currentTon, 0);
  const [inputValue, setInputValue] = useState(maxContribution >= 2.5 ? '2.5' : String(maxContribution));

  const contributionTon = useMemo(() => {
    const normalized = Number(inputValue.replace(',', '.'));

    if (!Number.isFinite(normalized) || normalized < 0) {
      return 0;
    }

    return Math.min(normalized, maxContribution);
  }, [inputValue, maxContribution]);

  const remainingTon = Math.max(maxContribution - contributionTon, 0);
  const estimatedCost = contributionTon * pool.unitPricePerTon;

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={[styles.shell, { minHeight: height }]}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Kembali" accessibilityRole="button" onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Gabung Pool</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View style={styles.summaryCopy}>
                <Text style={styles.poolName}>{pool.product}</Text>
                <Text style={styles.supplierName}>{pool.supplier}</Text>
              </View>
              <View style={styles.openBadge}>
                <Text style={styles.openText}>OPEN</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <InfoRow label="Target Volume" value={`${pool.targetTon} Ton`} />
            <InfoRow label="Harga Satuan" value={`${formatCurrency(pool.unitPricePerTon)} / Ton`} />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>JUMLAH VOLUME KONTRIBUSI</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputUnit}>Ton</Text>
              <TextInput
                accessibilityLabel="Jumlah volume kontribusi"
                inputMode="decimal"
                onChangeText={setInputValue}
                placeholder="0"
                placeholderTextColor={colors.outline}
                style={styles.input}
                value={inputValue}
              />
            </View>

            <View style={styles.volumeBox}>
              <View style={styles.volumeRow}>
                <Text style={styles.volumeLabel}>Sisa Volume Dibutuhkan</Text>
                <Text style={styles.volumeValue}>{remainingTon.toLocaleString('id-ID')} Ton</Text>
              </View>
              <View style={styles.volumeRow}>
                <Text style={styles.volumeLabel}>Target</Text>
                <Text style={styles.volumeValue}>{pool.targetTon.toLocaleString('id-ID')} Ton</Text>
              </View>
            </View>
          </View>

          <View style={styles.spacer} />

          <View style={styles.costCard}>
            <View style={styles.costHeader}>
              <View style={styles.calcIcon}>
                <Text style={styles.calcIconText}>+-</Text>
              </View>
              <Text style={styles.costLabel}>ESTIMASI BIAYA</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costCaption}>Total Pembayaran</Text>
              <Text style={styles.costValue}>{formatCurrency(estimatedCost)}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            disabled={contributionTon <= 0}
            onPress={() => onConfirm(pool.id, contributionTon)}
            style={[styles.confirmButton, contributionTon <= 0 && styles.confirmButtonDisabled]}
          >
            <Text style={styles.confirmText}>Konfirmasi Bergabung</Text>
            <Text style={styles.confirmArrow}>→</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 76,
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomColor: colors.surfaceVariant,
    borderBottomWidth: 1,
    paddingHorizontal: 18,
  },
  backButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 44,
    fontWeight: '300',
    lineHeight: 46,
  },
  headerTitle: {
    color: colors.primary,
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 35,
    fontWeight: '800',
    lineHeight: 44,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 46,
  },
  content: {
    gap: 28,
    minHeight: 690,
    paddingBottom: 116,
    paddingHorizontal: 18,
    paddingTop: 26,
  },
  summaryCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 14,
    borderWidth: 1,
    gap: 18,
    padding: 18,
    ...cardShadow,
  },
  summaryTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  summaryCopy: {
    flex: 1,
  },
  poolName: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 31,
  },
  supplierName: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 24,
    marginTop: 2,
  },
  openBadge: {
    borderColor: 'rgba(255, 183, 3, 0.35)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  openText: {
    color: colors.warningAmber,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 24,
  },
  infoValue: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
    textAlign: 'right',
  },
  inputSection: {
    gap: 14,
  },
  sectionLabel: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
    lineHeight: 20,
  },
  inputWrap: {
    minHeight: 58,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    borderColor: colors.outlineVariant,
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  inputUnit: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 19,
    lineHeight: 25,
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 20,
    height: 56,
  },
  volumeBox: {
    backgroundColor: 'rgba(174, 238, 203, 0.35)',
    borderColor: colors.secondaryFixedDim,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  volumeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  volumeLabel: {
    color: colors.secondary,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
  volumeValue: {
    color: colors.secondary,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  spacer: {
    flexGrow: 1,
  },
  costCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.surfaceContainerHigh,
    borderRadius: 14,
    borderWidth: 1,
    gap: 26,
    padding: 18,
    ...cardShadow,
  },
  costHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  calcIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.secondary,
    borderRadius: 3,
    borderWidth: 2,
  },
  calcIconText: {
    color: colors.secondary,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
  },
  costLabel: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
    lineHeight: 20,
  },
  costRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  costCaption: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
  costValue: {
    color: colors.primary,
    flexShrink: 1,
    fontFamily: fonts.heading,
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 38,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: colors.surfaceVariant,
    borderTopWidth: 1,
    padding: 18,
  },
  confirmButton: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 14,
    backgroundColor: colors.primaryContainer,
    borderRadius: 8,
    boxShadow: '0 4px 10px rgba(27, 67, 50, 0.2)',
  },
  confirmButtonDisabled: {
    opacity: 0.45,
  },
  confirmText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 22,
  },
  confirmArrow: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 28,
    lineHeight: 30,
  },
});
