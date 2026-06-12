import type { Supplier } from '../types/procurement';

export const dummySuppliers: Supplier[] = [
  {
    id: 'sup-tani-jaya',
    name: 'Tani Jaya Distributor',
    location: 'Kab. Bandung',
    productName: 'Urea Subsidi',
    tiers: [
      { minVolumeTon: 1, maxVolumeTon: 5, pricePerKg: 10000 },
      { minVolumeTon: 6, maxVolumeTon: 10, pricePerKg: 9000 },
      { minVolumeTon: 11, maxVolumeTon: null, pricePerKg: 8000 },
    ],
  },
  {
    id: 'sup-makmur-abadi',
    name: 'Makmur Abadi Agro',
    location: 'Kab. Garut',
    productName: 'NPK Phonska',
    tiers: [
      { minVolumeTon: 1, maxVolumeTon: 4, pricePerKg: 11200 },
      { minVolumeTon: 5, maxVolumeTon: 9, pricePerKg: 10100 },
      { minVolumeTon: 10, maxVolumeTon: null, pricePerKg: 9300 },
    ],
  },
];
