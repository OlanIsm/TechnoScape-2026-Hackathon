import { dashboardIcons } from '../../data/dashboardData';
import { SectionCard } from './SectionCard';

type RecommendationsPanelProps = {
  onExecute: () => void;
};

export function RecommendationsPanel({ onExecute }: RecommendationsPanelProps) {
  const SparklesIcon = dashboardIcons.sparkles;

  return (
    <SectionCard
      title="Rekomendasi VolumeMind"
      highlightedHeader
      action={<SparklesIcon size={22} aria-hidden="true" />}
    >
      <div className="recommendation-list">
        <article className="recommendation-box is-primary">
          <p>
            Beli <strong>3 ton Urea</strong> dari Supplier{' '}
            <strong>Agro Mandiri</strong> minggu ini. Gabung dengan{' '}
            <strong>Padiwangi & Melati Jaya</strong> via Collective Buying untuk
            capai tier 3 ton.
          </p>
          <span className="saving-pill">Rp 2.400.000 estimasi penghematan</span>
        </article>
        <article className="recommendation-box">
          <p>
            <strong>Prediksi kebutuhan September</strong> - VolumeMind
            memprediksi kebutuhan <strong>4,2 ton pupuk</strong> pada September
            berdasarkan tren cuaca dan histori tanam.
          </p>
        </article>
        <button className="primary-action" type="button" onClick={onExecute}>
          Eksekusi Rekomendasi
        </button>
      </div>
    </SectionCard>
  );
}
