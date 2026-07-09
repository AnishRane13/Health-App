import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import Spinner from '../../components/ui/Spinner';
import { api } from '../../api/client';

export default function AdminUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.uploadCsv(file);
      setResult(res.data);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.name?.endsWith('.csv')) setFile(f);
  };

  return (
    <AppShell variant="admin">
      <div className="page-header">
        <h1 className="page-title">Import lab reports</h1>
        <p className="page-lead">
          Upload a CSV matching the health_reports schema. Rows with unknown client IDs are skipped.
        </p>
      </div>

      <section className="panel upload-panel">
        <form onSubmit={handleUpload}>
          <div
            className={`dropzone${dragOver ? ' dropzone--active' : ''}${file ? ' dropzone--has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            {file ? (
              <>
                <span className="dropzone__filename">{file.name}</span>
                <span className="dropzone__size">{(file.size / 1024).toFixed(1)} KB</span>
              </>
            ) : (
              <>
                <span className="dropzone__title">Drop your CSV here</span>
                <span className="dropzone__hint">or choose a file from your computer</span>
              </>
            )}
            <input
              type="file"
              accept=".csv"
              className="dropzone__input"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="upload-panel__actions">
            <button type="submit" className="btn btn--primary" disabled={!file || loading}>
              {loading ? <Spinner size="sm" /> : 'Upload and import'}
            </button>
          </div>
        </form>

        {error && <div className="alert alert--error">{error}</div>}

        {result && (
          <div className={`alert alert--${result.status === 'SUCCESS' ? 'ok' : 'warn'}`}>
            <strong>{result.status}</strong> — {result.inserted} row(s) inserted, {result.skipped} skipped.
            {result.errors?.length > 0 && (
              <ul className="upload-errors">
                {result.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err.message || JSON.stringify(err)}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="upload-help">
          <h3>Expected columns</h3>
          <code className="code-block">
            report_id, client_id, report_date, hemoglobin, vitamin_d, cholesterol,
            blood_sugar_fasting, creatinine, urine_protein, bmi, doctor_notes
          </code>
        </div>
      </section>
    </AppShell>
  );
}
