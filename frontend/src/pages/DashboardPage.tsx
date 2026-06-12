import { useMemo, useState } from 'react';
import { Calculator, PackageSearch, TrendingDown } from 'lucide-react';
import { PriceTierChart } from '../components/PriceTierChart';
import { dummySuppliers } from '../data/dummySuppliers';
import { estimateSupplierPrice } from '../services/priceEstimator';

export function DashboardPage() {
  const [supplierId, setSupplierId] = useState(dummySuppliers[0].id);
  const [volumeTon, setVolumeTon] = useState(4);

  const supplier = useMemo(
    () =>
      dummySuppliers.find((currentSupplier) => currentSupplier.id === supplierId) ??
      dummySuppliers[0],
    [supplierId],
  );
  const estimate = useMemo(
    () => estimateSupplierPrice(supplier, volumeTon),
    [supplier, volumeTon],
  );

  return (
    <section className="dashboard">
      <div className="page-heading">
        <p className="eyebrow">Koperasi Sumber Makmur</p>
        <h1>Volume Price Tracker</h1>
        <p>
          Pantau posisi order terhadap tier harga supplier dan hitung estimasi
          biaya pengadaan secara real-time.
        </p>
      </div>

      <div className="dashboard-grid">
        <section className="panel tracker-panel">
          <div className="panel-heading">
            <PackageSearch size={20} aria-hidden="true" />
            <h2>Supplier & Price Tiers</h2>
          </div>
          <label className="field">
            <span>Supplier</span>
            <select
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
            >
              {dummySuppliers.map((currentSupplier) => (
                <option key={currentSupplier.id} value={currentSupplier.id}>
                  {currentSupplier.name}
                </option>
              ))}
            </select>
          </label>
          <div className="supplier-summary">
            <strong>{supplier.productName}</strong>
            <span>{supplier.location}</span>
          </div>
          <div className="chart-frame">
            <PriceTierChart supplier={supplier} />
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <Calculator size={20} aria-hidden="true" />
            <h2>Kalkulator Biaya</h2>
          </div>
          <label className="field">
            <span>Volume order: {volumeTon} ton</span>
            <input
              type="range"
              min="1"
              max="16"
              step="1"
              value={volumeTon}
              onChange={(event) => setVolumeTon(Number(event.target.value))}
            />
          </label>
          <div className="estimate-card">
            <span>Estimasi total</span>
            <strong>Rp {estimate.totalPrice.toLocaleString('id-ID')}</strong>
            <small>
              Rp {estimate.activeTier.pricePerKg.toLocaleString('id-ID')} / kg
            </small>
          </div>
          <div className="progress-block">
            <div className="progress-copy">
              <span>Progress menuju tier berikutnya</span>
              <strong>{Math.round(estimate.progressToNextTier)}%</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${estimate.progressToNextTier}%` }}
              />
            </div>
            <p>
              {estimate.nextTier
                ? `Butuh ${estimate.remainingToNextTierTon} ton lagi untuk harga Rp ${estimate.nextTier.pricePerKg.toLocaleString('id-ID')} / kg.`
                : 'Sudah berada di tier harga terbaik supplier ini.'}
            </p>
          </div>
        </section>

        <section className="panel insight-panel">
          <div className="panel-heading">
            <TrendingDown size={20} aria-hidden="true" />
            <h2>Rekomendasi Dummy</h2>
          </div>
          <p>
            Untuk menekan biaya, kumpulkan pesanan anggota sampai minimal{' '}
            {estimate.nextTier?.minVolumeTon ?? estimate.activeTier.minVolumeTon}{' '}
            ton sebelum konfirmasi pembelian.
          </p>
        </section>
      </div>
    </section>
  );
}
