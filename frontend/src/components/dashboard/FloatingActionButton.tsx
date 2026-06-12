import { dashboardIcons } from '../../data/dashboardData';

type FloatingActionButtonProps = {
  onClick: () => void;
};

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const PlusIcon = dashboardIcons.plus;

  return (
    <button className="floating-action" type="button" aria-label="Tambah transaksi" onClick={onClick}>
      <PlusIcon size={24} aria-hidden="true" />
    </button>
  );
}
