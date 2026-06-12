import type { PriceEstimate, PriceTier, Supplier } from '../types/procurement';

const KG_PER_TON = 1000;

export function estimateSupplierPrice(
  supplier: Supplier,
  volumeTon: number,
): PriceEstimate {
  const activeTier = findActiveTier(supplier.tiers, volumeTon);
  const nextTier = supplier.tiers.find(
    (tier) => tier.minVolumeTon > volumeTon,
  ) ?? null;
  const totalPrice = volumeTon * KG_PER_TON * activeTier.pricePerKg;
  const remainingToNextTierTon = nextTier
    ? Math.max(nextTier.minVolumeTon - volumeTon, 0)
    : 0;
  const progressToNextTier = nextTier
    ? Math.min((volumeTon / nextTier.minVolumeTon) * 100, 100)
    : 100;

  return {
    volumeTon,
    activeTier,
    nextTier,
    totalPrice,
    remainingToNextTierTon,
    progressToNextTier,
  };
}

function findActiveTier(tiers: PriceTier[], volumeTon: number): PriceTier {
  return (
    tiers.find((tier) => {
      const withinMinimum = volumeTon >= tier.minVolumeTon;
      const withinMaximum =
        tier.maxVolumeTon === null || volumeTon <= tier.maxVolumeTon;

      return withinMinimum && withinMaximum;
    }) ?? tiers[0]
  );
}
