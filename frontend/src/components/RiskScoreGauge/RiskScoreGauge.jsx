import styles from './RiskScoreGauge.module.css';

export default function RiskScoreGauge({ score = 0, riskLevel = 'Low' }) {
  const normalizedScore = Math.max(0, Math.min(100, Number(score) || 0));
  const percentage = (normalizedScore / 100) * 360;

  const getRiskColor = () => {
    if (normalizedScore >= 70) return '#dc2626';
    if (normalizedScore >= 40) return '#ea8c55';
    return '#22c55e';
  };

  const getGradientId = () => {
    if (normalizedScore >= 70) return 'gradientHigh';
    if (normalizedScore >= 40) return 'gradientMedium';
    return 'gradientLow';
  };

  return (
    <div className={styles.gaugeContainer}>
      <div className={styles.gaugeWrapper}>
        <svg
          className={styles.gaugeSvg}
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="gradientHigh"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <linearGradient
              id="gradientMedium"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#ea8c55" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient
              id="gradientLow"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
          />

          {/* Gauge arc */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={`url(#${getGradientId()})`}
            strokeWidth="12"
            strokeDasharray={`${(percentage / 360) * 565.48} 565.48`}
            strokeDashoffset="141.37"
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className={styles.gaugeArc}
          />
        </svg>

        <div className={styles.gaugeContent}>
          <div className={styles.scoreValue}>{normalizedScore.toFixed(0)}</div>
          <div className={styles.scoreLabel}>/ 100</div>
          <div className={styles.riskLevelLabel}>{riskLevel}</div>
        </div>
      </div>
    </div>
  );
}
