import { computeWellnessScore } from '../../utils/wellnessScore';

export default function WellnessScore({ flags }) {
  const wellness = computeWellnessScore(flags);

  if (wellness.score == null) return null;

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (wellness.score / 100) * circumference;

  return (
    <section className={`wellness-card wellness-card--${wellness.tier}`}>
      <div className="wellness-card__ring" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <circle className="wellness-card__track" cx="60" cy="60" r="54" />
          <circle
            className="wellness-card__progress"
            cx="60"
            cy="60"
            r="54"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="wellness-card__score">{wellness.score}</span>
      </div>

      <div className="wellness-card__copy">
        <span className="wellness-card__eyebrow">Wellness score</span>
        <h2 className="wellness-card__label">{wellness.label}</h2>
        <p className="wellness-card__detail">
          {wellness.critical > 0 && (
            <>{wellness.critical} critical · </>
          )}
          {wellness.attention > 0 ? (
            <>{wellness.attention} metric{wellness.attention > 1 ? 's' : ''} outside range</>
          ) : (
            <>All tracked metrics within reference ranges</>
          )}
        </p>
        <p className="wellness-card__footnote">
          Synthesised from your latest lab report — not a medical diagnosis.
        </p>
      </div>
    </section>
  );
}
