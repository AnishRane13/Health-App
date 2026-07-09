import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import WellnessScore from '../../components/health/WellnessScore';
import MetricGrid from '../../components/health/MetricGrid';
import TrendChart from '../../components/health/TrendChart';
import InsightPanel from '../../components/health/InsightPanel';
import AlertBanner from '../../components/ui/AlertBanner';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
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

  const greeting = profile?.fullName?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'there';
  const report = latest?.report;

  return (
    <AppShell variant="user">
      <div className="page-header">
        <h1 className="page-title">Good day, {greeting}</h1>
        <p className="page-lead">
          {profile?.city && `${profile.city} · `}
          {profile?.healthCondition || 'Your health overview'}
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : report ? (
        <>
          {latest.abnormalCount > 0 && (
            <AlertBanner variant={latest.flags?.some((f) => f.status === 'CRITICAL') ? 'critical' : 'warn'}>
              {latest.abnormalCount} metric{latest.abnormalCount > 1 ? 's' : ''} in your latest report need
              attention — review below or ask your care team.
            </AlertBanner>
          )}

          <WellnessScore flags={latest.flags} />

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
        <section className="panel">
          <EmptyState
            title="No reports yet"
            description="Once your lab results are imported, you'll see your wellness score, trends, and insights here."
          />
        </section>
      )}
    </AppShell>
  );
}
