import styles from "./Home.module.css";

const CARDS = [
  {
    page: "Map",
    icon: "🌍",
    title: "Global Map",
    desc: "Visualize the flow of development funds from donor countries to recipient nations, weighted by climate and gender impact.",
  },
  {
    page: "Timeline",
    icon: "📈",
    title: "Timeline",
    desc: "Trace how philanthropic funding has shifted year over year from 2020 to 2023 across sectors and regions.",
  },
  {
    page: "Rankings",
    icon: "🏆",
    title: "Rankings",
    desc: "Rank top donors, recipients, and sectors by total disbursements. Filter by region, instrument, and year — then compare side by side.",
  },
  {
    page: "Currency",
    icon: "💱",
    title: "Currency",
    desc: "Convert funding amounts across 8 currencies and explore disbursements by country, sector, and region.",
  },
];

export default function Home({ onNavigate }) {
  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>OECD Philanthropy</p>
      <h1 className={styles.title}>DreamBox</h1>
      <div className={styles.divider} />
      <p className={styles.description}>
        A data-driven dashboard exploring <strong>100,000+ global philanthropic transactions</strong> tracked by the OECD.
        Built for policymakers and foundation leaders to understand where development funding flows —
        across donors, recipients, sectors, and time.
      </p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>$68B</span>
          <span className={styles.statLabel}>Total disbursed</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>116K</span>
          <span className={styles.statLabel}>Transactions</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>161</span>
          <span className={styles.statLabel}>Countries</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>2020–23</span>
          <span className={styles.statLabel}>Years covered</span>
        </div>
      </div>

      <div className={styles.cards}>
        {CARDS.map((c) => (
          <button key={c.page} className={styles.card} onClick={() => onNavigate(c.page)}>
            <span className={styles.cardIcon}>{c.icon}</span>
            <span className={styles.cardTitle}>{c.title}</span>
            <span className={styles.cardDesc}>{c.desc}</span>
            <span className={styles.cardArrow}>Explore →</span>
          </button>
        ))}
      </div>
    </div>
  );
}
