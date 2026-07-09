/**
 * Derives a single wellness signal from per-metric flags.
 * Penalty weights reflect clinical urgency without claiming diagnostic accuracy.
 */
export function computeWellnessScore(flags) {
  if (!flags?.length) {
    return { score: null, tier: 'unknown', label: 'No data', attention: 0, critical: 0 };
  }

  let penalty = 0;
  let attention = 0;
  let critical = 0;

  for (const f of flags) {
    if (f.status === 'CRITICAL') {
      penalty += 22;
      critical += 1;
    } else if (f.status === 'HIGH' || f.status === 'LOW') {
      penalty += 10;
      attention += 1;
    }
  }

  const score = Math.max(0, Math.min(100, 100 - penalty));

  let tier = 'good';
  let label = 'Good';

  if (critical > 0) {
    tier = 'critical';
    label = 'Needs attention';
  } else if (attention > 0 || score < 78) {
    tier = 'attention';
    label = 'Fair';
  }

  return { score, tier, label, attention, critical };
}
