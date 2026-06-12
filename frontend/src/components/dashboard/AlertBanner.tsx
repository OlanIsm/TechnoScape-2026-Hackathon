import { ChevronRight, Info } from 'lucide-react';

type AlertBannerProps = {
  onViewDetail: () => void;
};

export function AlertBanner({ onViewDetail }: AlertBannerProps) {
  return (
    <section className="alert-banner" aria-label="VolumeMind insight">
      <div className="alert-content">
        <Info size={20} fill="currentColor" aria-hidden="true" />
        <div className="alert-body">
          <p>
            <strong>VolumeMind:</strong> Collective buying dengan Padiwangi &
            Melati Jaya sudah capai <strong>78% threshold</strong>. Estimasi hemat{' '}
            <strong>Rp 2.400.000</strong> jika dikonfirmasi minggu ini.
          </p>
          <button className="text-action" type="button" onClick={onViewDetail}>
            Lihat detail
            <ChevronRight size={12} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
