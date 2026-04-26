import Tab from "../components/Tab";
import styles from "./Layout.module.css";

const NAV_TABS = ["Map", "Timeline", "Rankings", "Currency"];

export default function Layout({ currentPage, onNavigate, children }) {
  return (
    <div className={styles.root}>
      {/* Grain texture overlay */}
      <div className={styles.grain} aria-hidden="true" />

      {/* Navbar */}
      <nav className={styles.nav}>
        <button
          className={styles.logo}
          onClick={() => onNavigate("home")}
          aria-label="Go to home"
        >
          <span className={styles.logoDot} />
          DreamBox
        </button>

        <div className={styles.tabs}>
          {NAV_TABS.map((tab) => (
            <Tab
              key={tab}
              label={tab}
              active={currentPage === tab}
              onClick={() => onNavigate(tab)}
            />
          ))}
        </div>
      </nav>

      {/* Page content */}
      <main className={styles.main} key={currentPage}>
        {children}
      </main>
    </div>
  );
}
