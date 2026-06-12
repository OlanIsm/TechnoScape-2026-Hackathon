import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';

const navItems = ['Home', 'Tentang', 'Solusi', 'Fitur', 'Blog', 'Kontak'];
const proofCards = [
  {
    tone: 'green',
    title: 'Volume Price Tracker',
    body: 'Lihat tier harga supplier dan jarak volume menuju harga lebih murah berikutnya.',
  },
  {
    tone: 'blue',
    title: 'VolumeMind AI',
    body: 'Prediksi kebutuhan musim tanam dan rekomendasi supplier terbaik untuk koperasi.',
  },
  {
    tone: 'amber',
    title: 'Audit Log Aman',
    body: 'Transaksi pengadaan tercatat rapi dan siap diekspor untuk laporan RAT.',
  },
];

export function LandingPage() {
  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Navigasi landing page">
        <a className="landing-logo" href="/" aria-label="VolumeMate home">
          <BrandLogo className="nav-brand-logo" />
        </a>
        <div className="landing-links">
          {navItems.map((item, index) => (
            <a className={index === 0 ? 'active' : ''} href={`#${item.toLowerCase()}`} key={item}>
              {item}
            </a>
          ))}
        </div>
        <Link className="nav-login" to="/login">
          Login
        </Link>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy-panel">
          <p className="trust-badge">
            <span />
            Smart Procurement Koperasi
          </p>
          <h1>Kelola Pengadaan Pupuk Lebih Cerdas, Hemat, dan Terukur</h1>
          <p className="hero-description">
            VolumeMate membantu koperasi melihat tier harga supplier, memprediksi
            kebutuhan musim tanam, dan menggabungkan daya beli antar-koperasi
            dalam satu dashboard ringan.
          </p>
          <div className="hero-actions">
            <Link className="primary-cta" to="/login">
              Coba Sekarang
            </Link>
            <a className="secondary-cta" href="#fitur">
              Lihat Fitur
            </a>
          </div>
          <div className="hero-tags" aria-label="Keunggulan VolumeMate">
            <span>Prediksi kebutuhan pupuk</span>
            <span>Collective buying</span>
            <span>Audit log append-only</span>
            <span>Siap PWA dan 3G</span>
          </div>
        </div>

        <aside className="hero-product-panel" aria-label="Ringkasan fitur VolumeMate">
          <p className="panel-eyebrow">
            <span />
            VolumeMate Dashboard
          </p>
          <h2>Penghematan yang bisa dipantau sejak order pertama</h2>
          <div className="dashboard-preview" aria-hidden="true">
            <div className="preview-sidebar">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="preview-content">
              <div className="preview-header" />
              <div className="preview-metrics">
                <span />
                <span />
                <span />
              </div>
              <div className="preview-chart">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
          <div className="proof-list" id="fitur">
            {proofCards.map((card) => (
              <article className={`proof-card ${card.tone}`} key={card.title}>
                <span />
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
