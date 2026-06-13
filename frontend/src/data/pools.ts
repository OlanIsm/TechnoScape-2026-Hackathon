export type ProcurementPool = {
  action: 'join' | 'detail';
  currentTon: number;
  deadline: string;
  id: string | number;
  location: string;
  price: string;
  product: string;
  progress: number;
  progressText: string;
  supplier: string;
  targetTon: number;
  unitPricePerTon: number;
};

export const pools: ProcurementPool[] = [
  {
    action: 'join',
    currentTon: 5,
    deadline: '2 Hari Lagi',
    id: 1,
    location: 'Bontang, Kaltim',
    price: 'Rp 11.900.000 / Ton',
    product: 'NPK Mutiara Q3',
    progress: 50,
    progressText: '5 / 10 Ton',
    supplier: 'PT Pupuk Kaltim',
    targetTon: 10,
    unitPricePerTon: 11900000,
  },
  {
    action: 'detail',
    currentTon: 425,
    deadline: '12 Jam Lagi',
    id: 2,
    location: 'Surabaya, Jatim',
    price: 'Rp 650.000 /sak',
    product: 'NPK Mutiara 16-16-16',
    progress: 85,
    progressText: '425 / 500 Ton',
    supplier: 'CV Tani Subur Jaya',
    targetTon: 500,
    unitPricePerTon: 650000,
  },
  {
    action: 'join',
    currentTon: 210,
    deadline: '5 Hari Lagi',
    id: 3,
    location: 'Gresik, Jatim',
    price: 'Rp 172.000 /sak',
    product: 'SP-36 Super 50kg',
    progress: 42,
    progressText: '210 / 500 Ton',
    supplier: 'PT Agro Nusa',
    targetTon: 500,
    unitPricePerTon: 172000,
  },
];
