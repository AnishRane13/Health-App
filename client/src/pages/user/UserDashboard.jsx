import { useEffect, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import MetricGrid from '../../components/health/MetricGrid';
import TrendChart from '../../components/health/TrendChart';
import InsightPanel from '../../components/health/InsightPanel';
import Spinner from '../../components/ui/Spinner';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function UserDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [latest, setLatest] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getProfile(), api.getLatestReport(), api.getTrends()])
      .then(([p, l, t]) => {
        setProfile(p.data);
        setLatest(l.data);
        setTrends(t.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell variant="user">
        <div className="page-loader"><Spinner size="lg" /></div>
      </AppShell>
    );
  }

  const report = latest?.report;
  const greeting = profile?.fullName?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'there';

  return (
    <AppShell variant="user">
      <div className="page-header">
        <h1 className="page-title">Good day, {greeting}</h1>
        <p className="page-lead">
          {profile?.city && `${profile.city} · `}
          {profile?.healthCondition || 'Your health overview'}
        </p>
      </div>

      {report ? (
        <>
          <section className="panel highlight-panel">
            <div className="highlight-panel__meta">
              <span className="highlight-panel__eyebrow">Latest report</span>
              <time className="highlight-panel__date">
                {new Date(report.reportDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </div>
            {latest.abnormalCount > 0 ? (
              <p className="highlight-panel__alert">
                {latest.abnormalCount} metric{latest.abnormalCount > 1 ? 's' : ''} outside normal range
              </p>
            ) : (
              <p className="highlight-panel__ok">All measured values within reference ranges</p>
            )}
            {report.doctorNotes && (
              <blockquote className="highlight-panel__note">&ldquo;{report.doctorNotes}&rdquo;</blockquote>
            )}
          </section>

          <section className="panel">
            <h2 className="panel__title">Lab values</h2>
            <MetricGrid flags={latest.flags} />
          </section>

          <section className="panel">
            <h2 className="panel__title">Trends over time</h2>
            <p className="panel__sub">BMI and fasting glucose across your report history</p>
            <TrendChart data={trends} metrics={['bmi', 'bloodSugarFasting']} />
          </section>

          <InsightPanel reportId={report.reportId} />
        </>
      ) : (
        <section className="panel empty-panel">
          <p>No health reports on file yet. Check back after your next lab visit.</p>
        </section>
      )}
    </AppShell>
  );
}
