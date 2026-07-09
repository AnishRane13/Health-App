import { MetricStatus } from '../ui/StatusBadge';

export default function MetricGrid({ flags }) {
  if (!flags?.length) return null;

  return (
    <div className="metric-grid">
      {flags.map((f) => (
        <article key={f.metricKey} className={`metric-card metric-card--${f.status.toLowerCase()}`}>
          <div className="metric-card__top">
            <h3 className="metric-card__label">{f.label}</h3>
            <MetricStatus status={f.status} />
          </div>
          <p className="metric-card__value">
            {f.value ?? '—'}
            {f.unit && <span className="metric-card__unit">{f.unit}</span>}
          </p>
          {f.normalRange && (
            <p className="metric-card__range">
              Reference {f.normalRange.min}–{f.normalRange.max} {f.unit}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
