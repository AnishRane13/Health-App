import { useEffect, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import ReportTable from '../../components/health/ReportTable';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import { api } from '../../api/client';

export default function UserReports() {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getReportHistory(page, 10)
      .then((res) => {
        setReports(res.data);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <AppShell variant="user">
      <div className="page-header">
        <h1 className="page-title">Report history</h1>
        <p className="page-lead">Every lab report on your record, newest first</p>
      </div>

      <section className="panel">
        {loading ? (
          <div className="page-loader"><Spinner /></div>
        ) : (
          <>
            <ReportTable reports={reports} />
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </AppShell>
  );
}
