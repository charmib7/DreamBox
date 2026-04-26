import styles from "./Page.module.css";

export default function Rankings() {
  return (
    <div className={styles.inner}>
      <p className={styles.eyebrow}>WorldScope</p>
      <h1 className={styles.title}>Rankings</h1>
      <div className={styles.divider} />
      <p className={styles.subtitle}>
        See how nations, cities, and metrics stack up.
      </p>
    </div>
  );
}
