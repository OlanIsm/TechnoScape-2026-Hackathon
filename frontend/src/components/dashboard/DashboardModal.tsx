import { X } from 'lucide-react';

export type ModalContent = {
  title: string;
  body: string;
  actionLabel?: string;
};

type DashboardModalProps = {
  content: ModalContent | null;
  onClose: () => void;
};

export function DashboardModal({ content, onClose }: DashboardModalProps) {
  if (!content) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="dashboard-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="dashboard-modal-title">{content.title}</h2>
          <button className="modal-close" type="button" aria-label="Tutup" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p>{content.body}</p>
        <button className="primary-action modal-action" type="button" onClick={onClose}>
          {content.actionLabel ?? 'Mengerti'}
        </button>
      </section>
    </div>
  );
}
