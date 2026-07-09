const STATUS_CLASS = {
  NORMAL: 'badge--ok',
  LOW: 'badge--warn',
  HIGH: 'badge--warn',
  CRITICAL: 'badge--danger',
  UNKNOWN: 'badge--muted',
};

export default function StatusBadge({ status, label }) {
  return (
    <span className={`badge ${STATUS_CLASS[status] || 'badge--muted'}`}>
      {label || status?.toLowerCase()}
    </span>
  );
}

export function MetricStatus({ status }) {
  const labels = { NORMAL: 'Normal', LOW: 'Low', HIGH: 'High', CRITICAL: 'Critical', UNKNOWN: '—' };
  return <StatusBadge status={status} label={labels[status]} />;
}
