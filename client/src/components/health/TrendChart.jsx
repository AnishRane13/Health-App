import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

export default function TrendChart({ data, metrics = ['bmi', 'bloodSugarFasting'] }) {
  if (!data?.length) {
    return <p className="empty-hint">Not enough data for trends yet.</p>;
  }

  const chartData = data.map((r) => ({
    date: formatDate(r.reportDate),
    bmi: r.bmi,
    bloodSugar: r.bloodSugarFasting,
    cholesterol: r.cholesterol,
    hemoglobin: r.hemoglobin,
  }));

  const lines = {
    bmi: { key: 'bmi', name: 'BMI', color: '#2d6a5a' },
    bloodSugarFasting: { key: 'bloodSugar', name: 'Fasting glucose', color: '#c87941' },
    cholesterol: { key: 'cholesterol', name: 'Cholesterol', color: '#4a6fa5' },
    hemoglobin: { key: 'hemoglobin', name: 'Hemoglobin', color: '#8b5a6b' },
  };

  const active = metrics.map((m) => lines[m]).filter(Boolean);

  return (
    <div className="trend-chart">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e0d8" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#5c6b66' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#5c6b66' }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e4e0d8',
              boxShadow: '0 4px 20px rgba(28,43,40,0.08)',
            }}
          />
          <Legend />
          {active.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name}
              stroke={l.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
