import styles from './AnalysisHistoryPage.module.css';

export default function AnalysisHistoryPage() {
  return (
    <div className={styles.layout}>
      <section className={styles.card}>
        <p className={styles.kicker}>Reports</p>
        <h2>Previous Analyses</h2>
        <p className={styles.description}>This module will display previously generated reports in future milestones.</p>
      </section>
    </div>
  );
}
