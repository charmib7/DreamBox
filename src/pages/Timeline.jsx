import styles from "./Page.module.css";

export default function Timeline() {
  return (
    <div className={styles.inner}>
      <p className={styles.eyebrow}>WorldScope</p>
      <h1 className={styles.title}>Timeline</h1>
      <div className={styles.divider} />
      <p className={styles.subtitle}>
        Trace the arc of history, event by event.
      </p>
    </div>
  );
}
