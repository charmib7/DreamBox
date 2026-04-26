import styles from "./Page.module.css";

export default function Home() {
  return (
    <div className={styles.inner}>
      <h1 className={`${styles.title} ${styles.titleLarge}`}>DreamBox</h1>
      <div className={styles.divider} />
      <p className={styles.subtitle}>
        Explore the OECD Dataset through maps, timelines, and more.
      </p>
    </div>
  );
}
