import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { getAnalysisHistory, getDashboardSummary } from '../../services/api';
import styles from './DashboardPage.module.css';

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Profile icon">
      <path d="M12 12.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z" />
      <path d="M4.75 20.25a7.25 7.25 0 0 1 14.5 0" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Upload icon">
      <path d="M12 15.25V4.75" />
      <path d="m7.75 9 4.25-4.25L16.25 9" />
      <path d="M5 16.75v1.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1.5" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Report icon">
      <path d="M5.75 19.25V13" />
      <path d="M12 19.25V8.75" />
      <path d="M18.25 19.25V5.25" />
      <path d="M4.5 19.25h15" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="History icon">
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
      <path d="M12 6v6l4 2.5" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Brain icon">
      <path d="M9.5 3a3 3 0 0 1 5 0" />
      <path d="M6 5a3 3 0 0 0 0 6" />
      <path d="M18 5a3 3 0 0 1 0 6" />
      <path d="M9 11a3 3 0 0 0-2 2.8V19a3 3 0 0 0 6 0v-5.2a3 3 0 0 0-2-2.8Z" />
      <path d="M15 11a3 3 0 0 1 2 2.8V19a3 3 0 0 1-6 0v-5.2a3 3 0 0 1 2-2.8Z" />
      <path d="M12 19v2" />
    </svg>
  );
}

const athleteCards = [
  {
    icon: <UserIcon />,
    title: 'Athlete Profile',
    description: 'View and update your personal information.',
    actionLabel: 'Open Profile',
    route: '/athlete-profile',
  },
  {
    icon: <UploadIcon />,
    title: 'Upload Video',
    description: 'Upload sports videos for AI pose estimation and injury risk analysis.',
    actionLabel: 'Upload Video',
    route: '/upload-video',
  },
  {
    icon: <ReportIcon />,
    title: 'Previous Analyses',
    description: 'View previous reports and analysis history.',
    actionLabel: 'View Reports',
    route: '/analysis-history',
  },
  {
    icon: <ReportIcon />,
    title: 'Athlete Intelligence Dashboard',
    description: 'Review the latest injury risk summary, issues, recommendations, and previous analyses in one place.',
    actionLabel: 'Open Dashboard',
    route: '/athlete-intelligence-dashboard',
  },
];

function formatRoleLabel(role) {
  if (!role) {
    return 'Dashboard';
  }

  return role.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMetric(value, fallback = 'No data available') {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toFixed(2) : fallback;
  }

  return String(value);
}

function formatDateTime(value) {
  if (!value) {
    return 'No data available';
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'No data available' : parsed.toLocaleString();
}

function normalizeRiskLevel(value) {
  const normalized = (value || '').toString().trim().toLowerCase();
  if (normalized === 'high') {
    return 'High';
  }
  if (normalized === 'medium') {
    return 'Medium';
  }
  if (normalized === 'low') {
    return 'Low';
  }
  return 'Unknown';
}

function getRiskTone(level) {
  const normalized = (level || '').toString().trim().toLowerCase();
  if (normalized === 'high') {
    return styles.riskHigh;
  }
  if (normalized === 'medium') {
    return styles.riskMedium;
  }
  return styles.riskLow;
}

function MetricCard({ label, value, hint, tone }) {
  return (
    <article className={styles.metricCard}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={`${styles.metricValue} ${tone || ''}`.trim()}>{value}</p>
      {hint ? <p className={styles.metricHint}>{hint}</p> : null}
    </article>
  );
}

function HistoryTable({ rows, role }) {
  if (!rows.length) {
    return <div className={styles.emptyState}>No analysis history is available yet.</div>;
  }

  const isAthlete = role === 'athlete';

  return (
    <div className={styles.tableWrap}>
      <table className={styles.historyTable}>
        <thead>
          <tr>
            <th>Date</th>
            {!isAthlete ? <th>Athlete</th> : null}
            <th>Video</th>
            <th>Risk Score</th>
            <th>Risk Level</th>
            <th>Total Issues</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.history_id ?? `${item.user_id}-${item.video_id}-${item.analysis_time}`}>
              <td>{formatDateTime(item.analysis_time || item.created_at)}</td>
              {!isAthlete ? <td>{item.athlete_name || 'Athlete'}</td> : null}
              <td>{item.video_name || item.video_id || 'N/A'}</td>
              <td>{formatMetric(item.risk_score)}</td>
              <td>
                <span className={`${styles.riskPill} ${getRiskTone(item.risk_level)}`}>{normalizeRiskLevel(item.risk_level)}</span>
              </td>
              <td>{item.total_issues ?? 0}</td>
              <td>{item.processing_status || 'Completed'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryList({ items }) {
  if (!items.length) {
    return <div className={styles.emptyState}>No athlete summaries are available yet.</div>;
  }

  return (
    <div className={styles.summaryList}>
      {items.map((item) => (
        <article key={item.user_id} className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div>
              <p className={styles.summaryName}>{item.full_name || 'Athlete'}</p>
              <p className={styles.summaryMeta}>{item.analysis_count} analyses</p>
            </div>
            <span className={`${styles.riskPill} ${getRiskTone(item.latest_risk_level)}`}>{normalizeRiskLevel(item.latest_risk_level)}</span>
          </div>
          <div className={styles.summaryStats}>
            <div>
              <span>Average risk</span>
              <strong>{formatMetric(item.average_risk_score)}</strong>
            </div>
            <div>
              <span>Latest score</span>
              <strong>{formatMetric(item.latest_risk_score)}</strong>
            </div>
            <div>
              <span>Highest score</span>
              <strong>{formatMetric(item.highest_risk_score)}</strong>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function RiskDistributionChart({ high = 0, medium = 0, low = 0 }) {
  const total = high + medium + low;
  if (total === 0) {
    return <div className={styles.emptyState}>No risk data available yet.</div>;
  }

  const highPercent = Math.round((high / total) * 100);
  const mediumPercent = Math.round((medium / total) * 100);
  const lowPercent = Math.round((low / total) * 100);

  return (
    <div className={styles.riskDistribution}>
      <div className={styles.distributionBar}>
        {high > 0 && <div className={styles.barSegmentHigh} style={{ width: `${highPercent}%` }} title={`High: ${high}`} />}
        {medium > 0 && <div className={styles.barSegmentMedium} style={{ width: `${mediumPercent}%` }} title={`Medium: ${medium}`} />}
        {low > 0 && <div className={styles.barSegmentLow} style={{ width: `${lowPercent}%` }} title={`Low: ${low}`} />}
      </div>
      <div className={styles.distributionLegend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotHigh}`} />
          <span>High ({high})</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotMedium}`} />
          <span>Medium ({medium})</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotLow}`} />
          <span>Low ({low})</span>
        </div>
      </div>
    </div>
  );
}

function HighRiskAlert({ highRiskAnalyses }) {
  const highRiskItems = highRiskAnalyses.filter((item) => (item.risk_level || '').toLowerCase() === 'high');
  
  if (highRiskItems.length === 0) {
    return (
      <div className={styles.alertCard}>
        <div className={styles.alertHeader}>
          <p className={styles.alertTitle}>Risk Alert</p>
        </div>
        <p className={styles.alertContent}>No high-risk analyses currently. Team is performing well.</p>
      </div>
    );
  }

  return (
    <div className={styles.alertCard}>
      <div className={styles.alertHeader}>
        <p className={styles.alertTitle}>âš ï¸ High-Risk Alert</p>
        <span className={styles.alertBadge}>{highRiskItems.length} {highRiskItems.length === 1 ? 'issue' : 'issues'}</span>
      </div>
      <div className={styles.alertList}>
        {highRiskItems.slice(0, 3).map((item) => (
          <div key={item.history_id ?? `${item.user_id}-${item.analysis_time}`} className={styles.alertItem}>
            <p className={styles.alertItemTitle}>{item.athlete_name || 'Athlete'}</p>
            <p className={styles.alertItemMeta}>Risk Score: {formatMetric(item.risk_score)} â€¢ {item.total_issues ?? 0} issues detected</p>
            <p className={styles.alertItemTime}>{formatDateTime(item.analysis_time || item.created_at)}</p>
          </div>
        ))}
      </div>
      {highRiskItems.length > 3 && (
        <p className={styles.alertFooter}>+{highRiskItems.length - 3} more high-risk analyses</p>
      )}
    </div>
  );
}

function DashboardActionCard({ icon, title, description, actionLabel, onClick, disabled = false }) {
  return (
    <article className={styles.actionCard}>
      <div className={styles.iconWrap} aria-hidden="true">
        {icon}
      </div>
      <div className={styles.cardBody}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className={styles.cardButtonWrap}>
        <Button className={styles.cardButton} variant="primary" onClick={onClick} disabled={disabled}>
          {actionLabel}
        </Button>
      </div>
    </article>
  );
}

function AthleteNavSidebar({ items, onNavigate }) {
  return (
    <nav className={styles.athleteNavSidebar}>
      <ul className={styles.athleteNavList}>
        {items.map((item) => (
          <li key={item.title}>
            <button
              className={styles.athleteNavItem}
              onClick={() => onNavigate(item.route)}
              type="button"
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AthleteFullHeightSidebar({ displayName, onNavigate }) {
  const navItems = [
    {
      icon: <UserIcon />,
      label: 'Athlete Profile',
      route: '/athlete-profile',
    },
    {
      icon: <UploadIcon />,
      label: 'Upload Video',
      route: '/upload-video',
    },
    {
      icon: <HistoryIcon />,
      label: 'Previous Analyses',
      route: '/analysis-history',
    },
    {
      icon: <BrainIcon />,
      label: 'Athlete Intelligence Dashboard',
      route: '/athlete-intelligence-dashboard',
    },
  ];

  const handleNavClick = (route) => {
    if (route) {
      onNavigate(route);
    }
  };

  return (
    <aside className={styles.fullHeightSidebar}>
      {/* Sidebar Header/Branding */}
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarBrandIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 19.25h14" />
            <path d="M8.25 19.25v-5.5" />
            <path d="M12 19.25v-8.5" />
            <path d="M15.75 19.25v-3.5" />
            <path d="M7 7.5h10" />
          </svg>
        </div>
        <div className={styles.sidebarBrandText}>
          <p className={styles.sidebarBrandTitle}>Sports Injury</p>
          <p className={styles.sidebarBrandSubtitle}>Risk Detection</p>
          <p className={styles.sidebarBrandTagline}>AI-Powered Sports Intelligence</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={styles.sidebarNav}>
        <p className={styles.sidebarMenuLabel}>MENU</p>
        <ul className={styles.sidebarNavList}>
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                className={styles.sidebarNavItem}
                onClick={() => handleNavClick(item.route)}
                type="button"
              >
                <span className={styles.navItemIcon} aria-hidden="true">
                  {item.icon}
                </span>
                <span className={styles.navItemLabel}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom User Section */}
      <div className={styles.sidebarUserSection}>
        <div className={styles.userAvatar}>
          <UserIcon />
        </div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{displayName || 'Athlete'}</p>
          <p className={styles.userRole}>Athlete</p>
        </div>
      </div>
    </aside>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 96 96" role="img" aria-label="Analytics illustration">
      <defs>
        <linearGradient id="analyticsGlow" x1="16" y1="12" x2="84" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="76" height="76" rx="22" fill="url(#analyticsGlow)" opacity="0.55" />
      <path d="M22 72.5h52" stroke="#60a5fa" strokeWidth="3.2" strokeLinecap="round" opacity="0.55" />
      <path d="M24 65V44" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
      <path d="M40 65V32" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
      <path d="M56 65V24" stroke="#60a5fa" strokeWidth="8" strokeLinecap="round" />
      <path d="M72 65V38" stroke="#93c5fd" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M22 48.5 38.5 39 53 45.5 72 27"
        fill="none"
        stroke="#0f172a"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="48.5" r="3.2" fill="#0f172a" />
      <circle cx="38.5" cy="39" r="3.2" fill="#0f172a" />
      <circle cx="53" cy="45.5" r="3.2" fill="#0f172a" />
      <circle cx="72" cy="27" r="3.2" fill="#0f172a" />
    </svg>
  );
}

export default function DashboardPage({ role = '', onLogout }) {
  const navigate = useNavigate();
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [athleteHistory, setAthleteHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const normalizedRole = role.toLowerCase();
  const isAthlete = normalizedRole === 'athlete';
  const currentUserId = typeof window !== 'undefined' ? window.sessionStorage.getItem('currentUserId') : null;
  const displayName = typeof window !== 'undefined'
    ? (window.sessionStorage.getItem('currentUserName') || window.sessionStorage.getItem('athleteName') || window.sessionStorage.getItem('profileName') || '').trim()
    : '';
  const dashboardTitle = displayName ? `${displayName}'s Dashboard` : `${formatRoleLabel(normalizedRole)} Dashboard`;

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      if (!currentUserId) {
        setError('Please sign in to view the dashboard.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const summary = await getDashboardSummary();
        if (cancelled) {
          return;
        }

        setDashboardSummary(summary);

        if (isAthlete) {
          const history = await getAnalysisHistory(currentUserId);
          if (!cancelled) {
            setAthleteHistory(Array.isArray(history) ? history : []);
          }
        } else {
          setAthleteHistory([]);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Unable to load the dashboard right now.');
          setDashboardSummary(null);
          setAthleteHistory([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, isAthlete, normalizedRole]);

  const metrics = dashboardSummary?.metrics || {};
  const recentAnalyses = isAthlete ? athleteHistory : (dashboardSummary?.recent_analyses || []);
  const athleteSummaries = dashboardSummary?.athlete_summaries || [];
  const latestAnalysis = isAthlete ? (athleteHistory[0] || dashboardSummary?.latest_analysis || null) : dashboardSummary?.latest_analysis || null;

  const roleCopy = useMemo(() => {
    if (isAthlete) {
      return 'Review your latest risk trends, biomechanical metrics, and historical analyses in one place.';
    }

    if (normalizedRole === 'admin') {
      return 'Monitor team-wide injury risk, spot high-risk athletes early, and keep oversight on the current analysis load.';
    }

    if (normalizedRole === 'coach') {
      return 'Track movement quality and risk trends to support safer training decisions across the squad.';
    }

    if (normalizedRole === 'physiotherapist') {
      return 'Focus on recovery indicators, stability, and the athletes who need immediate biomechanical attention.';
    }

    if (normalizedRole === 'sports-scientist') {
      return 'Inspect biomechanical quality, risk trends, and the population-level movement patterns captured in analysis data.';
    }

    return 'Review the current dashboard overview.';
  }, [isAthlete, normalizedRole]);

  const metricCards = useMemo(() => {
    if (isAthlete) {
      return [
        { label: 'Analysis count', value: metrics.analysis_count ?? athleteHistory.length, hint: 'Analyses saved to history' },
        { label: 'Latest risk score', value: formatMetric(metrics.latest_risk_score ?? latestAnalysis?.risk_score), hint: normalizeRiskLevel(metrics.latest_risk_level ?? latestAnalysis?.risk_level) },
        { label: 'Average risk score', value: formatMetric(metrics.average_risk_score), hint: 'Across your saved analyses' },
        { label: 'Risk level', value: normalizeRiskLevel(metrics.latest_risk_level ?? latestAnalysis?.risk_level), hint: 'Latest completed analysis' },
      ];
    }

    return [
      { label: 'Athletes monitored', value: metrics.athlete_count ?? 0, hint: 'Athletes with analysis data' },
      { label: 'Analyses reviewed', value: metrics.analysis_count ?? 0, hint: 'All accessible analyses' },
      { label: 'High-risk analyses', value: metrics.high_risk_count ?? 0, hint: 'Immediate follow-up recommended' },
      { label: 'Average risk score', value: formatMetric(metrics.average_risk_score), hint: 'Team-wide across available data' },
      { label: 'Average balance score', value: formatMetric(metrics.average_balance_score), hint: 'Useful for stability monitoring' },
      { label: 'Average stability score', value: formatMetric(metrics.average_stability_score), hint: 'Latest accessible results' },
    ];
  }, [athleteHistory.length, isAthlete, latestAnalysis?.risk_level, latestAnalysis?.risk_score, metrics]);

  if (!isAthlete) {
    return (
      <div className={styles.layout}>
        <section className={styles.dashboardShell}>
          <header className={styles.topBar}>
            <div className={styles.brandBlock}>
              <div className={styles.brandIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M5 19.25h14" />
                  <path d="M8.25 19.25v-5.5" />
                  <path d="M12 19.25v-8.5" />
                  <path d="M15.75 19.25v-3.5" />
                  <path d="M7 7.5h10" />
                </svg>
              </div>
              <div>
                <p className={styles.brandName}>Sports Injury Risk Detection</p>
                <p className={styles.brandSubtitle}>{dashboardTitle}</p>
              </div>
            </div>
          </header>

          <section className={styles.welcomeCard}>
            <div className={styles.welcomeContent}>
              <p className={styles.kicker}>{formatRoleLabel(normalizedRole)}</p>
              <h2>{displayName ? `Welcome back, ${displayName}` : 'Welcome back'}</h2>
              <p>{roleCopy}</p>
            </div>
          </section>

          {loading ? <div className={styles.statusBox}>Loading dashboard...</div> : null}
          {!loading && error ? <div className={styles.statusBox}>{error}</div> : null}

          {!loading && !error ? (
            <>
              <div className={styles.metricGrid}>
                {metricCards.map((card) => (
                  <MetricCard key={card.label} {...card} />
                ))}
              </div>

              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.kicker}>Risk Overview</p>
                    <h3>Team-wide injury risk intelligence</h3>
                  </div>
                </div>

                <div className={styles.riskOverviewGrid}>
                  <article className={styles.highlightCard}>
                    <h4>Latest Analysis Snapshot</h4>
                    <p>Latest risk score: {formatMetric(metrics.latest_risk_score)}</p>
                    <p>Risk level: <span className={`${styles.riskPill} ${getRiskTone(metrics.latest_risk_level)}`}>{normalizeRiskLevel(metrics.latest_risk_level)}</span></p>
                    <p>Total issues detected: {metrics.total_issues ?? 0}</p>
                  </article>
                  <article className={styles.highlightCard}>
                    <h4>Risk Distribution Overview</h4>
                    <RiskDistributionChart 
                      high={metrics.high_risk_count ?? 0}
                      medium={metrics.medium_risk_count ?? 0}
                      low={metrics.low_risk_count ?? 0}
                    />
                  </article>
                </div>
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.kicker}>Alerts & Recommendations</p>
                    <h3>Immediate attention required</h3>
                  </div>
                </div>
                <HighRiskAlert highRiskAnalyses={recentAnalyses} />
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.kicker}>Team Ranking</p>
                    <h3>Athletes with the most recent risk signal</h3>
                  </div>
                </div>
                <SummaryList items={athleteSummaries} />
              </section>

              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.kicker}>Recent Activity</p>
                    <h3>Latest analyses and activity</h3>
                  </div>
                </div>
                <HistoryTable rows={recentAnalyses} role={normalizedRole} />
              </section>

            </>
          ) : null}
        </section>
      </div>
    );
  }

  return (
    <div className={styles.athleteLayoutContainer}>
      <AthleteFullHeightSidebar 
        displayName={displayName}
        onNavigate={(route) => route && navigate(route)}
      />

      <main className={styles.athleteMainContainer}>
            <section className={styles.welcomeCard}>
              <div className={styles.welcomeContent}>
                <p className={styles.kicker}>Athlete Dashboard</p>
                <h2>{displayName ? `Welcome back, ${displayName}` : 'Welcome back'}</h2>
                <p>{roleCopy}</p>
              </div>
            </section>

            {loading ? <div className={styles.statusBox}>Loading dashboard...</div> : null}
            {!loading && error ? <div className={styles.statusBox}>{error}</div> : null}

            {!loading && !error ? (
              <div className={styles.athleteMetricGrid}>
                {metricCards.map((card) => (
                  <MetricCard key={card.label} {...card} />
                ))}
              </div>
            ) : null}

            {!loading && !error ? (
              <>
                <section className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <p className={styles.kicker}>Latest Analysis</p>
                      <h3>Latest injury risk and biomechanical insight</h3>
                    </div>
                  </div>
                  <div className={styles.latestAnalysisGrid}>
                    <article className={styles.highlightCard}>
                      <span className={`${styles.riskPill} ${getRiskTone(latestAnalysis?.risk_level || metrics.latest_risk_level)}`}>{normalizeRiskLevel(latestAnalysis?.risk_level || metrics.latest_risk_level)}</span>
                      <h4>{displayName ? `${displayName}'s latest analysis` : 'Latest completed analysis'}</h4>
                      <p>Risk score: {formatMetric(latestAnalysis?.risk_score ?? metrics.latest_risk_score)}</p>
                      <p>Analysis time: {formatDateTime(latestAnalysis?.analysis_time || latestAnalysis?.created_at)}</p>
                    </article>
                    <article className={styles.highlightCard}>
                      <h4>Biomechanical metrics</h4>
                      <p>Balance score: {formatMetric(latestAnalysis?.balance_score ?? metrics.average_balance_score)}</p>
                      <p>Stability score: {formatMetric(latestAnalysis?.stability_score ?? metrics.average_stability_score)}</p>
                      <p>Pose quality score: {formatMetric(latestAnalysis?.pose_quality_score ?? metrics.average_pose_quality_score)}</p>
                    </article>
                  </div>
                </section>

                <section className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <p className={styles.kicker}>Recent History</p>
                      <h3>Saved analysis history</h3>
                    </div>
                  </div>
                  <HistoryTable rows={recentAnalyses} role={normalizedRole} />
                </section>
              </>
            ) : null}
          </main>
      </div>
    );
  }