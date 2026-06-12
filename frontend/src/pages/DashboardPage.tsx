import { useState } from 'react';
import { AppTopBar } from '../components/AppTopBar';
import { MobileBottomNav } from '../components/MobileBottomNav';

const metrics = [
  {
    title: 'Hemat bulan ini',
    value: 'Rp. 2.430.000',
    helper: 'dibanding bulan lalu',
  },
  {
    title: 'Stok pupuk (kg)',
    value: '8.750',
    helper: '~cukup untuk 2 bulan',
  },
  {
    title: 'Akurasi Prediksi',
    value: '86%',
    helper: 'performa prediksi meningkat',
  },
];

export function DashboardPage() {
  const [message, setMessage] = useState('');

  const showMessage = (nextMessage: string) => {
    setMessage(nextMessage);
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-phone" aria-label="Dashboard VolumeMate">
        <div className="dashboard-content">
          <AppTopBar />

          <header className="dashboard-header">
            <p>Hi,</p>
            <h1>Pak Adi</h1>
          </header>

          <section className="dashboard-stack" aria-label="Ringkasan koperasi">
            {metrics.map((metric) => (
              <article className="dashboard-card" key={metric.title}>
                <h2>{metric.title}</h2>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </article>
            ))}

            <article className="dashboard-card recommendation-card">
              <h2>Rekomendasi VolumeMind</h2>
              <div className="recommendation-box">
                <p>
                  Disarankan memesan antara bulan Juni hingga Juli.
                </p>
                <p>
                  Pesanan besar (12.000 kg) perlu disiapkan lebih awal agar
                  pengiriman lancar.
                </p>
              </div>

              <div className="recommendation-actions">
                <button
                  className="reject-recommendation"
                  type="button"
                  onClick={() => showMessage('Rekomendasi ditolak untuk sesi ini.')}
                >
                  Tolak Rekomendasi
                </button>
                <button
                  className="accept-recommendation"
                  type="button"
                  onClick={() => showMessage('Rekomendasi diterima. Draft order disiapkan.')}
                >
                  Terima Rekomendasi
                </button>
              </div>
            </article>
          </section>
        </div>

        {message ? <p className="dashboard-feedback">{message}</p> : null}

        <MobileBottomNav activeTab="dashboard" onUnavailable={showMessage} />
      </section>
    </main>
  );
}
