import { useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Spinner from '../ui/Spinner';

export default function InsightPanel({ reportId }) {
  const { toast } = useToast();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.generateInsight(reportId);
      setInsight(res.data);
      toast('Health insight generated', 'success');
    } catch (e) {
      setError(e.message);
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel insight-panel">
      <div className="panel__head">
        <div>
          <h2 className="panel__title">Health insight</h2>
          <p className="panel__sub">Plain-language summary of your latest results</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={generate} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Explain my results'}
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {insight && (
        <div className="insight-panel__body">
          {insight.title && <h3 className="insight-panel__title">{insight.title}</h3>}
          <p className="insight-panel__text">{insight.content}</p>
          <span className="insight-panel__meta">
            {insight.metricsContext?.source === 'anthropic' ? 'AI-generated' : 'Automated summary'}
            {' · '}
            {new Date(insight.createdAt).toLocaleString()}
          </span>
        </div>
      )}
    </section>
  );
}
