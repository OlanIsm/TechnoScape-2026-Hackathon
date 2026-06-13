import { SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View, type ViewStyle } from 'react-native-web';
import { NonMenuHeader } from '../components/NonMenuHeader';
import type { ProcurementPool } from '../data/pools';
import { colors, fonts } from '../theme';

type PoolDetailScreenProps = {
  onBackPress: () => void;
  pool: ProcurementPool;
};

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  })
    .format(value)
    .replace(/\s/g, ' ');
}

export function PoolDetailScreen({ onBackPress, pool }: PoolDetailScreenProps) {
  const { height } = useWindowDimensions();
  const remainingTon = Math.max(pool.targetTon - pool.currentTon, 0);
  const totalTargetCost = pool.targetTon * pool.unitPricePerTon;
  const collectedCost = pool.currentTon * pool.unitPricePerTon;

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={[styles.shell, { minHeight: height }]}>
        <NonMenuHeader onBackPress={onBackPress} title="Detail Pool" />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.titleWrap}>
                <Text style={styles.productName}>{pool.product}</Text>
                <Text style={styles.supplierName}>{pool.supplier}</Text>
                <Text style={styles.locationText}>{pool.location}</Text>
              </View>
              <View style={styles.deadlineBadge}>
                <View style={styles.deadlineDot} />
                <Text style={styles.deadlineText}>{pool.deadline}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metricRows}>
              <MetricRow label="Target Volume" value={`${pool.targetTon.toLocaleString('id-ID')} Ton`} />
              <MetricRow label="Terkumpul" value={`${pool.currentTon.toLocaleString('id-ID')} Ton`} />
              <MetricRow label="Sisa Volume" value={`${remainingTon.toLocaleString('id-ID')} Ton`} />
              <MetricRow label="Harga Target" value={pool.price} />
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.sectionLabel}>Progress Pool</Text>
                <Text style={styles.progressText}>{pool.progressText}</Text>
              </View>
              <Text style={styles.progressPercent}>{pool.progress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pool.progress}%` }]} />
            </View>
          </View>

          <View style={styles.costCard}>
            <Text style={styles.sectionLabel}>Ringkasan Biaya</Text>
            <MetricRow label="Estimasi terkumpul" value={formatCurrency(collectedCost)} />
            <MetricRow label="Target nilai pool" value={formatCurrency(totalTargetCost)} />
            <MetricRow label="Status Anda" value="Sudah bergabung" />
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>Catatan Supplier</Text>
            <Text style={styles.noteText}>
              Harga target berlaku untuk pemesanan kolektif sesuai jadwal pool. Konfirmasi akhir mengikuti ketersediaan stok supplier.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
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
  content: {
    gap: 16,
    paddingBottom: 28,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  summaryCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(193, 200, 194, 0.72)',
    borderRadius: 14,
    borderWidth: 1,
    gap: 18,
    overflow: 'hidden',
    padding: 18,
    ...cardShadow,
  },
  summaryHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  productName: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 31,
  },
  supplierName: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 23,
  },
  locationText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  deadlineBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    backgroundColor: 'rgba(255, 183, 3, 0.1)',
    borderColor: 'rgba(255, 183, 3, 0.28)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  deadlineDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.warningAmber,
    borderRadius: 3,
  },
  deadlineText: {
    color: colors.warningAmber,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
  },
  metricRows: {
    gap: 12,
  },
  metricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  metricValue: {
    color: colors.primary,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'right',
  },
  progressCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(193, 200, 194, 0.72)',
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 16,
    ...cardShadow,
  },
  progressHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    lineHeight: 18,
  },
  progressText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: 4,
  },
  progressPercent: {
    color: colors.secondary,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
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
  costCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: 'rgba(193, 200, 194, 0.72)',
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 16,
    ...cardShadow,
  },
  noteCard: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondaryFixedDim,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  noteTitle: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  noteText: {
    color: colors.primaryContainer,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
