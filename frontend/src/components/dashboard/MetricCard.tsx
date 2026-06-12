import { TrendingUp } from 'lucide-react';
import type { Metric } from '../../data/dashboardData';

type MetricCardProps = {
  metric: Metric;
};

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <article className="metric-card">
      <span className="metric-label">{metric.label}</span>
      <div className="metric-value-row">
        <strong className={metric.emphasis ? 'metric-value is-green' : 'metric-value'}>
          {metric.value}
        </strong>
        {metric.trend ? (
          <span className="metric-trend">
            <TrendingUp size={12} aria-hidden="true" />
            {metric.trend}
          </span>
        ) : null}
      </div>
      <span className={metric.emphasis ? 'metric-note is-green' : 'metric-note'}>
        {metric.note}
      </span>
    </article>
  );
}
