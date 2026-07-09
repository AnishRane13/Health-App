import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import MetricGrid from '../../components/health/MetricGrid';
import ReportTable from '../../components/health/ReportTable';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import { api } from '../../api/client';

export default function AdminUserDetail() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getUserDetail(clientId), api.getUserReports(clientId, page, 8)])
      .then(([detail, reps]) => {
        setClient(detail.data);
        setReports(reps.data);
        setPagination(reps.pagination);
      })
      .finally(() => setLoading(false));
  }, [clientId, page]);

  if (loading) {
    return (
      <AppShell variant="admin">
        <div className="page-loader"><Spinner size="lg" /></div>
      </AppShell>
    );
  }

  if (!client) {
    return (
      <AppShell variant="admin">
        <p className="empty-hint">Patient not found.</p>
      </AppShell>
    );
  }

  const latest = client.latestReport;

  return (
    <AppShell variant="admin">
      <Link to="/admin/users" className="back-link">← Back to patients</Link>

      <div className="page-header">
        <h1 className="page-title">{client.fullName}</h1>
        <p className="page-lead">
          {client.email} · {client.city}, {client.state} · {client.reportCount} reports
        </p>
      </div>

      <div className="detail-grid">
        <section className="panel">
          <h2 className="panel__title">Profile</h2>
          <dl className="detail-list">
            <div><dt>Age / Gender</dt><dd>{client.age} · {client.gender}</dd></div>
            <div><dt>Occupation</dt><dd>{client.occupation || '—'}</dd></div>
            <div><dt>Health condition</dt><dd>{client.healthCondition || '—'}</dd></div>
            <div><dt>Wellness goal</dt><dd>{client.beautyGoal || '—'}</dd></div>
            <div><dt>Mobile</dt><dd>{client.mobile || '—'}</dd></div>
            <div><dt>Member since</dt><dd>{new Date(client.createdAt).toLocaleDateString()}</dd></div>
          </dl>
        </section>

        {latest?.report && (
          <section className="panel">
            <h2 className="panel__title">Latest report</h2>
            <p className="panel__sub">
              {new Date(latest.report.reportDate).toLocaleDateString()}
              {latest.abnormalCount > 0 && ` · ${latest.abnormalCount} flagged`}
            </p>
            <MetricGrid flags={latest.flags} />
          </section>
        )}
      </div>

      <section className="panel">
        <h2 className="panel__title">All reports</h2>
        <ReportTable reports={reports} />
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      </section>
    </AppShell>
  );
}
