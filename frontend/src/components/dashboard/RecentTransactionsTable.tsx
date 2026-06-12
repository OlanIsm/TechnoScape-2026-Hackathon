import { MoreVertical } from 'lucide-react';
import { recentTransactions } from '../../data/dashboardData';

type RecentTransactionsTableProps = {
  onOpenMenu: () => void;
};

export function RecentTransactionsTable({ onOpenMenu }: RecentTransactionsTableProps) {
  return (
    <section className="section-card transaction-card">
      <div className="section-header">
        <h2>Transaksi Terakhir</h2>
        <button
          className="icon-button"
          type="button"
          aria-label="Menu transaksi"
          onClick={onOpenMenu}
        >
          <MoreVertical size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="transaction-table" role="table" aria-label="Transaksi terakhir">
        <div className="transaction-row transaction-head" role="row">
          <span role="columnheader">Tanggal</span>
          <span role="columnheader">Supplier + Produk</span>
          <span role="columnheader">Volume</span>
          <span role="columnheader">Total Harga</span>
        </div>
        {recentTransactions.map((transaction) => (
          <div className="transaction-row" role="row" key={`${transaction.date}-${transaction.total}`}>
            <span role="cell">
              {transaction.date}
              <small>{transaction.year}</small>
            </span>
            <span role="cell" className="transaction-supplier">
              {transaction.supplier}
              <small>{transaction.product}</small>
            </span>
            <span role="cell">{transaction.volume}</span>
            <strong role="cell">{transaction.total}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
