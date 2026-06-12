import { useState } from 'react';
import { PhoneStatusBar } from '../components/PhoneStatusBar';

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

const navItems = [
  { label: 'Dashboard', icon: HomeIcon, active: true },
  { label: 'Koperasi', icon: UsersIcon, active: false },
  { label: 'Audit', icon: NoteIcon, active: false },
];

export function DashboardPage() {
  const [message, setMessage] = useState('');

  const showMessage = (nextMessage: string) => {
    setMessage(nextMessage);
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-phone" aria-label="Dashboard VolumeMate">
        <PhoneStatusBar />

        <div className="dashboard-content">
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

        <nav className="dashboard-bottom-nav" aria-label="Navigasi dashboard">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                aria-label={item.label}
                className={item.active ? 'is-active' : undefined}
                key={item.label}
                type="button"
                onClick={() =>
                  showMessage(
                    item.active
                      ? 'Kamu sudah berada di dashboard.'
                      : `${item.label} belum tersedia di versi dummy.`,
                  )
                }
              >
                <Icon />
              </button>
            );
          })}
        </nav>
      </section>
    </main>
  );
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3.8 10.5 12 3.6l8.2 6.9v9.1a1.9 1.9 0 0 1-1.9 1.9h-3.8v-6.2h-5v6.2H5.7a1.9 1.9 0 0 1-1.9-1.9v-9.1Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8.5 12.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.7.2a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8ZM2.7 20.5c.4-3.5 2.7-5.8 5.8-5.8s5.4 2.3 5.8 5.8H2.7Zm10.7 0a7.5 7.5 0 0 0-1.1-3.1 4.9 4.9 0 0 1 3.9-1.9c2.8 0 4.8 2 5.1 5H13.4Z" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6.2 3h9.3l3.3 3.3v14.1c0 1-.8 1.6-1.7 1.6H6.2c-1 0-1.8-.7-1.8-1.6V4.6c0-.9.8-1.6 1.8-1.6Zm8.5 1.8v2.4h2.4l-2.4-2.4ZM8 10h8v1.8H8V10Zm0 4h8v1.8H8V14Zm0 4h5.2v1.8H8V18Z" />
    </svg>
  );
}
