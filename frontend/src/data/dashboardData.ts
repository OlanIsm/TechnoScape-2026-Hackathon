import {
  Bell,
  Bot,
  ClipboardList,
  HandCoins,
  Home,
  Package,
  Plus,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Metric = {
  label: string;
  value: string;
  note: string;
  trend?: string;
  emphasis?: boolean;
};

export type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

export type SupplierPrice = {
  initials: string;
  name: string;
  product: string;
  price: string;
  badge?: string;
  active?: boolean;
};

export type ProductKey = 'Urea' | 'NPK' | 'SP-36';

export type Transaction = {
  date: string;
  year: string;
  supplier: string;
  product: string;
  volume: string;
  total: string;
};

export const dashboardMetrics: Metric[] = [
  {
    label: 'Hemat bulan ini',
    value: 'Rp 3,2 jt',
    note: 'vs bulan lalu',
    trend: '+18%',
    emphasis: true,
  },
  {
    label: 'Stok pupuk (ton)',
    value: '14,5',
    note: 'Cukup ~3 minggu',
    emphasis: true,
  },
  {
    label: 'Koperasi aktif',
    value: '3',
    note: 'Collective buying aktif',
  },
  {
    label: 'Akurasi forecast',
    value: '83%',
    note: 'Model improving',
  },
];

export const productTabs: ProductKey[] = ['Urea', 'NPK', 'SP-36'];

export const supplierPricesByProduct: Record<ProductKey, SupplierPrice[]> = {
  Urea: [
    {
      initials: 'AM',
      name: 'Agro Mandiri',
      product: 'Urea 2 kg',
      price: 'Rp 4.500k',
      badge: 'Terbaik',
      active: true,
    },
    {
      initials: 'PT',
      name: 'Pupuk Tani',
      product: 'Urea 2 kg',
      price: 'Rp 4.750k',
    },
    {
      initials: 'SM',
      name: 'Sumber Makmur',
      product: 'Urea 2 kg',
      price: 'Rp 4.820k',
    },
  ],
  NPK: [
    {
      initials: 'PT',
      name: 'Pupuk Tani',
      product: 'NPK Phonska',
      price: 'Rp 5.400k',
      badge: 'Terbaik',
      active: true,
    },
    {
      initials: 'SM',
      name: 'Sumber Makmur',
      product: 'NPK Pelangi',
      price: 'Rp 5.620k',
    },
    {
      initials: 'AM',
      name: 'Agro Mandiri',
      product: 'NPK Mutiara',
      price: 'Rp 5.780k',
    },
  ],
  'SP-36': [
    {
      initials: 'AM',
      name: 'Agro Mandiri',
      product: 'SP-36',
      price: 'Rp 4.600k',
      badge: 'Terbaik',
      active: true,
    },
    {
      initials: 'SM',
      name: 'Sumber Makmur',
      product: 'SP-36',
      price: 'Rp 4.730k',
    },
    {
      initials: 'PT',
      name: 'Pupuk Tani',
      product: 'SP-36',
      price: 'Rp 4.850k',
    },
  ],
};

export const recentTransactions: Transaction[] = [
  {
    date: '12 Agu',
    year: '2023',
    supplier: 'Agro Mandiri',
    product: 'Urea Bersubsidi',
    volume: '2,5 Ton',
    total: 'Rp 11.250.000',
  },
  {
    date: '10 Agu',
    year: '2023',
    supplier: 'Pupuk Tani',
    product: 'NPK Phonska',
    volume: '1,0 Ton',
    total: 'Rp 5.400.000',
  },
  {
    date: '05 Agu',
    year: '2023',
    supplier: 'Agro Mandiri',
    product: 'SP-36',
    volume: '3,2 Ton',
    total: 'Rp 14.720.000',
  },
];

export const bottomNavItems: NavItem[] = [
  { label: 'Beranda', icon: Home, active: true },
  { label: 'AI', icon: Bot },
  { label: 'Suplier', icon: Store },
  { label: 'Kolektif', icon: Users },
  { label: 'Audit', icon: ClipboardList },
];

export const dashboardIcons = {
  bell: Bell,
  handCoins: HandCoins,
  package: Package,
  plus: Plus,
  sparkles: Sparkles,
};
