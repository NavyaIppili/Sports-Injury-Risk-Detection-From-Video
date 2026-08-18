import styles from './BiomechanicalMetricsChart.module.css';

function formatMetricValue(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function MetricBar({ label, value, maxValue = 100 }) {
  const numValue = formatMetricValue(value);
  if (numValue === null) {
    return (
      <div className={styles.metricItem}>
        <div className={styles.metricLabel}>{label}</div>
        <div className={styles.metricValue}>No data</div>
      </div>
    );
  }

  const percentage = Math.max(0, Math.min(100, (numValue / maxValue) * 100));
  const color = percentage >= 70 ? '#22c55e' : percentage >= 40 ? '#ea8c55' : '#dc2626';

  return (
    <div className={styles.metricItem}>
      <div className={styles.metricHeader}>
        <div className={styles.metricLabel}>{label}</div>
        <div className={styles.metricValue}>{numValue.toFixed(1)}</div>
      </div>
      <div className={styles.metricBarContainer}>
        <div
          className={styles.metricBar}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

export default function BiomechanicalMetricsChart({
  balanceScore,
  stabilityScore,
  poseQualityScore,
}) {
  const hasData =
    formatMetricValue(balanceScore) !== null ||
    formatMetricValue(stabilityScore) !== null ||
    formatMetricValue(poseQualityScore) !== null;

  if (!hasData) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyState}>No biomechanical metrics available.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <MetricBar label="Balance Score" value={balanceScore} />
      <MetricBar label="Stability Score" value={stabilityScore} />
      <MetricBar label="Pose Quality Score" value={poseQualityScore} />
    </div>
  );
}
