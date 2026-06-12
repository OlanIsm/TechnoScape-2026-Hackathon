import type { ReactNode } from 'react';

type SectionCardProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  highlightedHeader?: boolean;
  className?: string;
};

export function SectionCard({
  title,
  action,
  children,
  highlightedHeader = false,
  className = '',
}: SectionCardProps) {
  return (
    <section className={`section-card ${className}`.trim()}>
      <div className={highlightedHeader ? 'section-header is-highlighted' : 'section-header'}>
        <h2>{title}</h2>
        {action}
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}
