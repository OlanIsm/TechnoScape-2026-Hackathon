import { useMemo, useState } from 'react';
import { AppTopBar } from '../components/AppTopBar';
import { MobileBottomNav } from '../components/MobileBottomNav';

const pools = [
  {
    product: 'Urea Subsidi',
    supplier: 'Pupuk Nusantara',
    deadline: 'Sisa 7 Hari',
    volume: 120,
    target: 200,
    dueDate: '18 Juni 2026',
  },
  {
    product: 'NPK Phonska',
    supplier: 'Agro Sentosa',
    deadline: 'Sisa 9 Hari',
    volume: 165,
    target: 250,
    dueDate: '20 Juni 2026',
  },
  {
    product: 'ZA Granul',
    supplier: 'Tani Makmur',
    deadline: 'Sisa 12 Hari',
    volume: 90,
    target: 180,
    dueDate: '23 Juni 2026',
  },
  {
    product: 'Dolomit',
    supplier: 'Mineral Desa',
    deadline: 'Sisa 14 Hari',
    volume: 70,
    target: 160,
    dueDate: '25 Juni 2026',
  },
];

export function CollectiveBuyPage() {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');

  const filteredPools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return pools;
    }

    return pools.filter((pool) =>
      `${pool.product} ${pool.supplier}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const showMessage = (nextMessage: string) => {
    setMessage(nextMessage);
  };

  return (
    <main className="collective-page">
      <section className="collective-phone" aria-label="Borong Bareng VolumeMate">
        <div className="collective-content">
          <AppTopBar />

          <header className="collective-header">
            <h1>Borong Bareng</h1>
          </header>

          <label className="collective-search">
            <span>Cari</span>
            <input
              aria-label="Cari collective buy"
              placeholder=" "
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <SearchIcon />
          </label>

          <section className="pool-list" aria-label="Daftar collective buy">
            {filteredPools.map((pool) => (
              <article className="pool-card" key={pool.product}>
                <div className="pool-title-row">
                  <h2>{pool.product}</h2>
                  <span>{pool.deadline}</span>
                </div>

                <p className="pool-progress-label">Progress Collective Buy</p>
                <div
                  aria-label={`${pool.volume} dari ${pool.target} kg terpenuhi`}
                  className="pool-progress-track"
                  role="progressbar"
                  aria-valuemax={pool.target}
                  aria-valuemin={0}
                  aria-valuenow={pool.volume}
                >
                  <i style={{ width: `${Math.min((pool.volume / pool.target) * 100, 100)}%` }} />
                </div>
                <p className="pool-progress-text">
                  {pool.volume}/{pool.target} kg sudah terpenuhi
                </p>

                <div className="pool-meta">
                  <BoxIcon />
                  <p>{pool.product}</p>
                  <span>-</span>
                  <p>{pool.supplier}</p>
                </div>
                <div className="pool-meta">
                  <p>{pool.dueDate}</p>
                </div>

                <div className="pool-actions">
                  <button
                    aria-label={`Detail ${pool.product}`}
                    className="pool-more"
                    type="button"
                    onClick={() => showMessage(`Detail ${pool.product} belum tersedia.`)}
                  >
                    <DotsIcon />
                  </button>
                  <button
                    className="pool-join"
                    type="button"
                    onClick={() => showMessage(`Kamu bergabung ke pool ${pool.product}.`)}
                  >
                    Gabung
                  </button>
                </div>
              </article>
            ))}
          </section>
        </div>

        {message ? <p className="dashboard-feedback">{message}</p> : null}

        <MobileBottomNav activeTab="collective" onUnavailable={showMessage} />
      </section>
    </main>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M10.8 4.2a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2Zm0 1.6a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm5.4 10.2 3.7 3.7-1.2 1.1-3.7-3.7 1.2-1.1Z" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m12 3 8 4.2v9.6L12 21l-8-4.2V7.2L12 3Zm0 2.3L7.2 7.8 12 10.4l4.8-2.6L12 5.3ZM6 9.5v6.1l5 2.6v-6.1L6 9.5Zm12 0-5 2.6v6.1l5-2.6V9.5Z" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm5 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm5 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" />
    </svg>
  );
}
