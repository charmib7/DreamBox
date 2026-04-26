import styles from "./Page.module.css";

export default function Map() {
  return (
    <div className={styles.inner}>
      <p className={styles.eyebrow}>WorldScope</p>
      <h1 className={styles.title}>Map</h1>
      <div className={styles.divider} />
      <p className={styles.subtitle}>
        Visualize geographic data across the globe.
      </p>
    </div>
  );
}
