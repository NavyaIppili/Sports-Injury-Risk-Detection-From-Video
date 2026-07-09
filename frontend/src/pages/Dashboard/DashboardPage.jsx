import styles from './DashboardPage.module.css';

export default function DashboardPage({ role = '' }) {
  return (
    <div className={styles.layout}>
      <section className={styles.card}>
        <p className={styles.kicker}>Dashboard</p>
        <h2>Welcome to the sports injury risk detection dashboard.</h2>
        <p className={styles.description}>
          {role ? `Signed in as ${role.replace('-', ' ')}.` : 'Your role will determine the available workflow here.'}
        </p>
      </section>
    </div>
  );
}