import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import AlertBanner from '../../components/ui/AlertBanner';
import { StatGridSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import { api } from '../../api/client';

function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card">
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value?.toLocaleString?.() ?? value ?? '—'}</span>
      {hint && <span className="stat-card__hint">{hint}</span>}
    </article>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAdminStats(), api.getUploadLogs()])
      .then(([s, u]) => {
        setStats(s.data);
        setUploads(u.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell variant="admin">
      <div className="page-header">
        <h1 className="page-title">Operations overview</h1>
        <p className="page-lead">Platform health at a glance</p>
      </div>

      {loading ? (
        <>
          <StatGridSkeleton />
          <TableSkeleton rows={4} />
        </>
      ) : (
        <>
          {(stats?.patientsFlagged > 0 || stats?.patientsCritical > 0) && (
            <AlertBanner
              variant={stats.patientsCritical > 0 ? 'critical' : 'warn'}
              action={
                <Link to="/admin/users" className="alert-banner__link">
                  Review patients →
                </Link>
              }
            >
              {stats.patientsCritical > 0 && (
                <><strong>{stats.patientsCritical}</strong> patient{stats.patientsCritical > 1 ? 's have' : ' has'} critical flags · </>
              )}
              <strong>{stats.patientsFlagged}</strong> patient{stats.patientsFlagged > 1 ? 's' : ''} with metrics outside range on their latest report
            </AlertBanner>
          )}

          <div className="stat-grid">
            <StatCard label="Registered patients" value={stats?.totalClients} />
            <StatCard label="Total lab reports" value={stats?.totalReports} />
            <StatCard label="Reports this month" value={stats?.reportsThisMonth} />
            <StatCard label="Patients flagged" value={stats?.patientsFlagged} hint="Latest report abnormal" />
          </div>

          <div className="admin-actions">
            <Link to="/admin/users" className="action-card">
              <span className="action-card__title">Search patients</span>
              <span className="action-card__desc">Filter by name, city, or condition</span>
            </Link>
            <Link to="/admin/upload" className="action-card">
              <span className="action-card__title">Import reports</span>
              <span className="action-card__desc">Upload a health_reports CSV</span>
            </Link>
          </div>

          {uploads.length > 0 ? (
            <section className="panel">
              <h2 className="panel__title">Recent imports</h2>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Status</th>
                      <th>Inserted</th>
                      <th>Skipped</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploads.slice(0, 5).map((u) => (
                      <tr key={u.id}>
                        <td>{u.filename}</td>
                        <td>
                          <span className={`badge badge--${u.status === 'SUCCESS' ? 'ok' : u.status === 'PARTIAL' ? 'warn' : 'danger'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>{u.insertedRows}</td>
                        <td>{u.skippedRows}</td>
                        <td>{new Date(u.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      )}
    </AppShell>
  );
}
