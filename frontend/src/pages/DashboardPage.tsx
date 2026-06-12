import { useState } from 'react';
import { AlertBanner } from '../components/dashboard/AlertBanner';
import { BottomNavBar } from '../components/dashboard/BottomNavBar';
import { CollectiveProgress } from '../components/dashboard/CollectiveProgress';
import {
  DashboardModal,
  type ModalContent,
} from '../components/dashboard/DashboardModal';
import { FloatingActionButton } from '../components/dashboard/FloatingActionButton';
import { MetricCard } from '../components/dashboard/MetricCard';
import { MobileTopBar } from '../components/dashboard/MobileTopBar';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { RecommendationsPanel } from '../components/dashboard/RecommendationsPanel';
import { SupplierPricePanel } from '../components/dashboard/SupplierPricePanel';
import { dashboardMetrics } from '../data/dashboardData';

export function DashboardPage() {
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);

  const openModal = (content: ModalContent) => {
    setModalContent(content);
  };

  const openPlaceholder = (title: string, body: string) => {
    openModal({ title, body });
  };

  return (
    <div className="dashboard-screen">
      <MobileTopBar
        onOpenMenu={() =>
          openPlaceholder(
            'Menu dashboard',
            'Navigasi samping belum dibuat karena screen ini masih fokus ke dashboard. Untuk sementara, pakai menu bawah untuk melihat area utama VolumeMate.',
          )
        }
        onOpenNotifications={() =>
          openPlaceholder(
            'Notifikasi',
            'Ada rekomendasi VolumeMind baru: collective buying Padiwangi dan Melati Jaya sudah mendekati threshold 78%.',
          )
        }
      />
      <main className="dashboard-content">
        <AlertBanner
          onViewDetail={() =>
            openPlaceholder(
              'Detail rekomendasi',
              'Jika gabung dengan Padiwangi dan Melati Jaya minggu ini, estimasi penghematan mencapai Rp 2.400.000 karena volume kolektif mendekati tier supplier berikutnya.',
            )
          }
        />
        <section className="metrics-grid" aria-label="Ringkasan koperasi">
          {dashboardMetrics.map((metric) => (
            <MetricCard metric={metric} key={metric.label} />
          ))}
        </section>
        <RecommendationsPanel
          onExecute={() =>
            openModal({
              title: 'Rekomendasi disiapkan',
              body: 'Dummy action: sistem akan menyiapkan draft pembelian 3 ton Urea dari Agro Mandiri dan menghubungkannya ke pool collective buying aktif.',
              actionLabel: 'Oke, lanjut nanti',
            })
          }
        />
        <CollectiveProgress />
        <SupplierPricePanel
          onViewAll={() =>
            openPlaceholder(
              'Daftar supplier',
              'Halaman supplier lengkap belum dibuat. Panel ini sudah bisa dipakai untuk membandingkan harga dummy per produk.',
            )
          }
        />
        <RecentTransactionsTable
          onOpenMenu={() =>
            openPlaceholder(
              'Menu transaksi',
              'Aksi export PDF/Excel dan filter transaksi akan masuk saat modul audit log dikerjakan.',
            )
          }
        />
      </main>
      <FloatingActionButton
        onClick={() =>
          openPlaceholder(
            'Tambah transaksi',
            'Form tambah transaksi belum dibuat di screen ini. Nanti aksi ini akan membuka alur input order atau offline queue.',
          )
        }
      />
      <BottomNavBar
        onNavigate={(label) =>
          label === 'Beranda'
            ? openPlaceholder('Beranda aktif', 'Kamu sedang berada di dashboard utama.')
            : openPlaceholder(
                `${label} belum tersedia`,
                'Screen ini belum diimplementasi. Untuk sekarang tombol ini memakai popup dummy agar flow navigasi tetap bisa dites.',
              )
        }
      />
      <DashboardModal content={modalContent} onClose={() => setModalContent(null)} />
    </div>
  );
}
