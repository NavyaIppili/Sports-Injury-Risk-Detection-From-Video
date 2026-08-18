import styles from './RiskTrendChart.module.css';

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function RiskTrendChart({ analyses = [] }) {
  if (!analyses || analyses.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyState}>No trend data available.</p>
      </div>
    );
  }

  // Sort by analysis time (oldest first)
  const sortedAnalyses = [...analyses].sort((a, b) => {
    const timeA = new Date(a.analysis_time || a.created_at || 0).getTime();
    const timeB = new Date(b.analysis_time || b.created_at || 0).getTime();
    return timeA - timeB;
  });

  // Take last 10 for display
  const displayedAnalyses = sortedAnalyses.slice(-10);
  const riskScores = displayedAnalyses.map((a) => Number(a.risk_score) || 0);

  if (riskScores.every((score) => score === 0)) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyState}>No risk data available.</p>
      </div>
    );
  }

  const maxScore = Math.max(...riskScores, 100);
  const minScore = 0;
  const padding = 40;
  const width = 500;
  const height = 250;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate points for the chart
  const points = riskScores.map((score, index) => {
    const x = padding + (index / (riskScores.length - 1 || 1)) * chartWidth;
    const y =
      padding +
      chartHeight -
      ((score - minScore) / (maxScore - minScore)) * chartHeight;
    return { x, y, score, index };
  });

  // Create path data
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }

  // Create area path
  let areaPath = pathData;
  areaPath += ` L ${points[points.length - 1].x} ${height - padding}`;
  areaPath += ` L ${points[0].x} ${height - padding} Z`;

  return (
    <div className={styles.container}>
      <div className={styles.chartWrapper}>
        <svg width={width} height={height} className={styles.chart}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`gridline-${i}`}
              x1={padding}
              y1={padding + (chartHeight / 4) * i}
              x2={width - padding}
              y2={padding + (chartHeight / 4) * i}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Area under curve */}
          <path d={areaPath} fill="rgba(100, 200, 150, 0.1)" />

          {/* Line path */}
          <path d={pathData} stroke="#22c55e" strokeWidth="2" fill="none" />

          {/* Points */}
          {points.map((point) => (
            <circle
              key={`point-${point.index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#22c55e"
              stroke="#ffffff"
              strokeWidth="2"
              className={styles.dataPoint}
            />
          ))}

          {/* Y-axis */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* X-axis */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const score = minScore + ((maxScore - minScore) / 4) * i;
            const y = height - padding - (chartHeight / 4) * i;
            return (
              <text
                key={`ylabel-${i}`}
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#64748b"
              >
                {Math.round(score)}
              </text>
            );
          })}

          {/* X-axis labels */}
          {displayedAnalyses.map((analysis, index) => {
            const x = padding + (index / (riskScores.length - 1 || 1)) * chartWidth;
            return (
              <text
                key={`xlabel-${index}`}
                x={x}
                y={height - padding + 18}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
              >
                {formatDate(analysis.analysis_time || analysis.created_at)}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendLine} />
          <span>Risk Score Trend</span>
        </div>
        <p className={styles.legendNote}>
          Last {displayedAnalyses.length} analyses shown
        </p>
      </div>
    </div>
  );
}
