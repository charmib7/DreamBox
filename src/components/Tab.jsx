import styles from "./Tab.module.css";

export default function Tab({ label, active, onClick }) {
  return (
    <button
      className={`${styles.tab} ${active ? styles.active : ""}`}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </button>
  );
}
