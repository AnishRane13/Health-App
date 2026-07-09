import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { DataTableSkeleton } from '../../components/ui/Skeleton';
import { api } from '../../api/client';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [healthCondition, setHealthCondition] = useState('');
  const [filters, setFilters] = useState({ search: '', city: '', healthCondition: '' });

  useEffect(() => {
    setLoading(true);
    api
      .listUsers({ page, limit: 12, ...filters })
      .then((res) => {
        setUsers(res.data);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [page, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setFilters({ search, city, healthCondition });
  };

  const hasFilters = filters.search || filters.city || filters.healthCondition;

  return (
    <AppShell variant="admin">
      <div className="page-header">
        <h1 className="page-title">Patients</h1>
        <p className="page-lead">Search and review registered client profiles</p>
      </div>

      <form className="filter-bar panel" onSubmit={handleSearch}>
        <label className="field field--inline">
          <span className="field__label">Search</span>
          <input
            className="field__input"
            placeholder="Name, email, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="field field--inline">
          <span className="field__label">City</span>
          <input className="field__input" value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label className="field field--inline">
          <span className="field__label">Condition</span>
          <input
            className="field__input"
            placeholder="e.g. Diabetes"
            value={healthCondition}
            onChange={(e) => setHealthCondition(e.target.value)}
          />
        </label>
        <div className="filter-bar__action">
          <button type="submit" className="btn btn--primary">Apply filters</button>
        </div>
      </form>

      <section className="panel">
        {loading ? (
          <DataTableSkeleton rows={8} />
        ) : users.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No patients match your filters' : 'No patients found'}
            description={
              hasFilters
                ? 'Try broadening your search — check spelling or remove a filter.'
                : 'Patient records will appear here once imported.'
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => {
                    setSearch('');
                    setCity('');
                    setHealthCondition('');
                    setFilters({ search: '', city: '', healthCondition: '' });
                    setPage(1);
                  }}
                >
                  Clear filters
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>City</th>
                    <th>Age</th>
                    <th>Condition</th>
                    <th>Reports</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.clientId}>
                      <td className="data-table__strong">{u.fullName}</td>
                      <td>{u.email}</td>
                      <td>{u.city || '—'}</td>
                      <td>{u.age ?? '—'}</td>
                      <td>{u.healthCondition || '—'}</td>
                      <td>{u.reportCount ?? 0}</td>
                      <td>
                        <Link to={`/admin/users/${u.clientId}`} className="link-arrow">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </>
        )}
      </section>
    </AppShell>
  );
}
