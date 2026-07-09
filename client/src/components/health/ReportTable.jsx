export default function ReportTable({ reports }) {
  if (!reports?.length) {
    return <p className="empty-hint">No reports on record.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Hemoglobin</th>
            <th>Vitamin D</th>
            <th>Cholesterol</th>
            <th>Glucose</th>
            <th>BMI</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.reportId}>
              <td>{new Date(r.reportDate).toLocaleDateString()}</td>
              <td>{r.hemoglobin ?? '—'}</td>
              <td>{r.vitaminD ?? '—'}</td>
              <td>{r.cholesterol ?? '—'}</td>
              <td>{r.bloodSugarFasting ?? '—'}</td>
              <td>{r.bmi ?? '—'}</td>
              <td className="data-table__notes">{r.doctorNotes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
