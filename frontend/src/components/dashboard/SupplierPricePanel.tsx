import { useState } from 'react';
import {
  productTabs,
  supplierPricesByProduct,
  type ProductKey,
} from '../../data/dashboardData';
import { SectionCard } from './SectionCard';

type SupplierPricePanelProps = {
  onViewAll: () => void;
};

export function SupplierPricePanel({ onViewAll }: SupplierPricePanelProps) {
  const [activeProduct, setActiveProduct] = useState<ProductKey>('Urea');
  const supplierPrices = supplierPricesByProduct[activeProduct];

  return (
    <SectionCard title="Harga Supplier" className="supplier-card">
      <div className="product-tabs" role="tablist" aria-label="Produk pupuk">
        {productTabs.map((product) => (
          <button
            className={activeProduct === product ? 'is-active' : ''}
            type="button"
            role="tab"
            aria-selected={activeProduct === product}
            key={product}
            onClick={() => setActiveProduct(product)}
          >
            {product}
          </button>
        ))}
      </div>
      <div className="supplier-list">
        {supplierPrices.map((supplier) => (
          <article
            className={supplier.active ? 'supplier-row is-active' : 'supplier-row'}
            key={supplier.name}
          >
            <div className="supplier-identity">
              <span className="supplier-avatar">{supplier.initials}</span>
              <div>
                <strong>{supplier.name}</strong>
                <small>{supplier.product}</small>
              </div>
            </div>
            <div className="supplier-price">
              <strong>{supplier.price}</strong>
              {supplier.badge ? <span>{supplier.badge}</span> : null}
            </div>
          </article>
        ))}
      </div>
      <button className="secondary-action" type="button" onClick={onViewAll}>
        Lihat Semua Supplier
      </button>
    </SectionCard>
  );
}
