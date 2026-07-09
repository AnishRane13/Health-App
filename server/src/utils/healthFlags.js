/**
 * Maps raw report metrics to a status (LOW / NORMAL / HIGH / CRITICAL) using the
 * reference ranges seeded in `health_metric_ranges`. Powers the color-coded
 * dashboard cards and the admin "flagged results" count.
 */

// Report field -> metric_key in health_metric_ranges
const METRIC_MAP = [
  { field: 'hemoglobin', key: 'hemoglobin' },
  { field: 'vitaminD', key: 'vitamin_d' },
  { field: 'cholesterol', key: 'cholesterol' },
  { field: 'bloodSugarFasting', key: 'blood_sugar_fasting' },
  { field: 'creatinine', key: 'creatinine' },
  { field: 'bmi', key: 'bmi' },
];

function classify(value, range) {
  if (value === null || value === undefined) return 'UNKNOWN';
  const { minNormal, maxNormal, minCritical, maxCritical } = range;

  if ((maxCritical != null && value > maxCritical) || (minCritical != null && value < minCritical)) {
    return 'CRITICAL';
  }
  if (maxNormal != null && value > maxNormal) return 'HIGH';
  if (minNormal != null && value < minNormal) return 'LOW';
  return 'NORMAL';
}

/**
 * @param {object} report  A HealthReport record
 * @param {Array}  ranges  Rows from health_metric_ranges
 * @returns {{ flags: object[], abnormalCount: number }}
 */
function evaluateReport(report, ranges) {
  const rangeByKey = Object.fromEntries(ranges.map((r) => [r.metricKey, r]));
  const flags = [];

  for (const { field, key } of METRIC_MAP) {
    const range = rangeByKey[key];
    if (!range) continue;
    const value = report[field];
    const status = classify(value, range);
    flags.push({
      metricKey: key,
      label: range.label,
      unit: range.unit,
      value,
      status,
      normalRange:
        range.minNormal != null && range.maxNormal != null
          ? { min: range.minNormal, max: range.maxNormal }
          : null,
    });
  }

  const abnormalCount = flags.filter(
    (f) => f.status === 'HIGH' || f.status === 'LOW' || f.status === 'CRITICAL'
  ).length;

  return { flags, abnormalCount };
}

module.exports = { evaluateReport, classify, METRIC_MAP };
