export function Skeleton({ className = '', style }) {
  return <span className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function DashboardSkeleton() {
  return (
    <div className="skeleton-dashboard">
      <Skeleton className="skeleton-dashboard__hero" />
      <div className="skeleton-dashboard__grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="skeleton-dashboard__card" style={{ animationDelay: `${i * 0.06}s` }} />
        ))}
      </div>
      <Skeleton className="skeleton-dashboard__chart" />
    </div>
  );
}

export function StatGridSkeleton() {
  return (
    <div className="stat-grid">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="skeleton-stat" style={{ animationDelay: `${i * 0.08}s` }} />
      ))}
    </div>
  );
}

const COL_WIDTHS = ['22%', '24%', '12%', '8%', '16%', '8%', '10%'];

export function DataTableSkeleton({ rows = 8 }) {
  return (
    <div className="skeleton-data-table" aria-hidden="true">
      <div className="skeleton-data-table__header">
        {COL_WIDTHS.map((w, i) => (
          <Skeleton key={i} className="skeleton-data-table__cell" style={{ width: w, animationDelay: `${i * 0.04}s` }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="skeleton-data-table__row"
          style={{ animationDelay: `${row * 0.05}s` }}
        >
          {COL_WIDTHS.map((w, col) => (
            <Skeleton
              key={col}
              className="skeleton-data-table__cell"
              style={{
                width: col === 0 ? '70%' : col === 6 ? '40%' : `${55 + (col % 3) * 15}%`,
                animationDelay: `${row * 0.05 + col * 0.03}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** @deprecated use DataTableSkeleton */
export function TableSkeleton(props) {
  return <DataTableSkeleton {...props} />;
}
