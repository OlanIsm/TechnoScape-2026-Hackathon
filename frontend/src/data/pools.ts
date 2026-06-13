export type ProcurementPool = {
  action: 'join' | 'detail';
  deadline: string;
  id: number;
  location: string;
  price: string;
  product: string;
  progress: number;
  progressText: string;
  supplier: string;
};

export const pools: ProcurementPool[] = [
  {
    action: 'join',
    deadline: '2 Hari Lagi',
    id: 1,
    location: 'Bontang, Kaltim',
    price: 'Rp 385.000 /sak',
    product: 'Urea Non-Subsidi 50kg',
    progress: 60,
    progressText: '600 / 1000 Ton',
    supplier: 'PT Pupuk Kaltim',
  },
  {
    action: 'detail',
    deadline: '12 Jam Lagi',
    id: 2,
    location: 'Surabaya, Jatim',
    price: 'Rp 650.000 /sak',
    product: 'NPK Mutiara 16-16-16',
    progress: 85,
    progressText: '425 / 500 Ton',
    supplier: 'CV Tani Subur Jaya',
  },
  {
    action: 'join',
    deadline: '5 Hari Lagi',
    id: 3,
    location: 'Gresik, Jatim',
    price: 'Rp 172.000 /sak',
    product: 'SP-36 Super 50kg',
    progress: 42,
    progressText: '210 / 500 Ton',
    supplier: 'PT Agro Nusa',
  },
];
