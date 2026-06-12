import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { Supplier } from '../types/procurement';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

type PriceTierChartProps = {
  supplier: Supplier;
};

export function PriceTierChart({ supplier }: PriceTierChartProps) {
  const labels = supplier.tiers.map((tier) =>
    tier.maxVolumeTon
      ? `${tier.minVolumeTon}-${tier.maxVolumeTon} ton`
      : `>${tier.minVolumeTon - 1} ton`,
  );

  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: 'Harga per kg',
            data: supplier.tiers.map((tier) => tier.pricePerKg),
            backgroundColor: ['#2563eb', '#16a34a', '#f59e0b'],
            borderRadius: 6,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                `Rp ${Number(context.raw).toLocaleString('id-ID')} / kg`,
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (value) =>
                `Rp ${Number(value).toLocaleString('id-ID')}`,
            },
          },
        },
      }}
    />
  );
}
