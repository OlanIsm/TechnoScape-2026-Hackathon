import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native-web';
import type { ProcurementPool } from '../data/pools';
import { colors, fonts } from '../theme';

type PoolCardProps = {
  onAction: (message: string) => void;
  pool: ProcurementPool;
};

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function PoolCard({ onAction, pool }: PoolCardProps) {
  return (
    <View style={styles.poolCard}>
      <View style={styles.poolAccent} />
      <View style={styles.poolHeader}>
        <View style={styles.supplierRow}>
          <View style={styles.supplierIcon}>
            <Text style={styles.supplierIconText}>{pool.id === 2 ? 'TR' : 'PG'}</Text>
          </View>
          <View style={styles.supplierTextWrap}>
            <Text style={styles.supplierName}>{pool.supplier}</Text>
            <Text style={styles.locationText}>{pool.location}</Text>
          </View>
        </View>
        <View style={styles.deadlineBadge}>
          <View style={styles.deadlineDot} />
          <Text style={styles.deadlineText}>{pool.deadline}</Text>
        </View>
      </View>

      <View style={styles.productBox}>
        <InfoRow label="Produk" value={pool.product} />
        <InfoRow isPrice label="Harga Target" value={pool.price} />
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressLabel}>Progres Volume</Text>
            <Text style={styles.progressText}>{pool.progressText}</Text>
          </View>
          <Text style={styles.progressPercent}>{pool.progress}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pool.progress}%` }]} />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          onAction(
            pool.action === 'join'
              ? `Dummy: kamu memilih gabung ke ${pool.supplier}.`
              : `Dummy: detail ${pool.supplier} akan dibuka nanti.`,
          )
        }
        style={[styles.actionButton, pool.action === 'detail' && styles.secondaryActionButton]}
      >
        <Text style={[styles.actionText, pool.action === 'detail' && styles.secondaryActionText]}>
          {pool.action === 'join' ? 'Gabung Pool Ini' : 'Lihat Detail'}
        </Text>
      </Pressable>
    </View>
  );
}

function InfoRow({ isPrice = false, label, value }: { isPrice?: boolean; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, isPrice && styles.priceValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  poolCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(193, 200, 194, 0.72)',
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
    overflow: 'hidden',
    padding: 18,
    position: 'relative',
    ...cardShadow,
  },
  poolAccent: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 96,
    height: 96,
    backgroundColor: 'rgba(174, 238, 203, 0.52)',
    borderBottomLeftRadius: 96,
  },
  poolHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  supplierRow: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  supplierIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.surfaceVariant,
    borderRadius: 10,
    borderWidth: 1,
  },
  supplierIconText: {
    color: colors.secondary,
    fontFamily: fonts.heading,
    fontSize: 13,
    fontWeight: '700',
  },
  supplierTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  supplierName: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 25,
  },
  locationText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 2,
  },
  deadlineBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    backgroundColor: 'rgba(255, 183, 3, 0.1)',
    borderColor: 'rgba(255, 183, 3, 0.25)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
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
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  productBox: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(225, 227, 228, 0.82)',
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  infoValue: {
    color: colors.primary,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'right',
  },
  priceValue: {
    color: colors.successGreen,
    fontSize: 13,
  },
  progressBlock: {
    gap: 8,
  },
  progressHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  progressText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 2,
  },
  progressPercent: {
    color: colors.secondary,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
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
  actionButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  secondaryActionButton: {
    backgroundColor: 'transparent',
    borderColor: colors.secondary,
    borderWidth: 1.5,
  },
  actionText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  secondaryActionText: {
    color: colors.secondary,
  },
});
