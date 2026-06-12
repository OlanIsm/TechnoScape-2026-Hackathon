export type PriceTier = {
  minVolumeTon: number;
  maxVolumeTon: number | null;
  pricePerKg: number;
};

export type Supplier = {
  id: string;
  name: string;
  location: string;
  productName: string;
  tiers: PriceTier[];
};

export type PriceEstimate = {
  volumeTon: number;
  activeTier: PriceTier;
  nextTier: PriceTier | null;
  totalPrice: number;
  remainingToNextTierTon: number;
  progressToNextTier: number;
};
