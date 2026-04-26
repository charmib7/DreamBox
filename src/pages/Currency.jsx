import styles from "./Page.module.css";

export default function Currency() {
  return (
    <div className={styles.inner}>
      <p className={styles.eyebrow}>WorldScope</p>
      <h1 className={styles.title}>Currency</h1>
      <div className={styles.divider} />
      <p className={styles.subtitle}>
        Track exchange rates and financial flows worldwide.
      </p>
    </div>
  );
}
