import styles from "./Page.module.css";

export default function Timeline() {
  return (
    <div className={styles.inner}>
      <p className={styles.eyebrow}>OECD Philanthropy</p>
      <h1 className={styles.title}>Timeline</h1>
      <div className={styles.divider} />
      <p className={styles.subtitle}>
        Trace how global philanthropic funding has shifted year over year
        from 2020 to 2023 — across sectors, regions, and donor types.
      </p>
    </div>
  );
}
