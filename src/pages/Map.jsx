import styles from "./Page.module.css";

export default function Map() {
  return (
    <div className={styles.inner}>
      <p className={styles.eyebrow}>OECD Philanthropy</p>
      <h1 className={styles.title}>Global Impact Analysis</h1>
      <div className={styles.divider} />
      <p className={styles.subtitle}>
        Tracking the flow of development funds from donor countries to recipient nations,
        weighted by climate and gender impact priorities.
      </p>

      <div className={styles.mapContainer}>
        <section className={styles.section}>
          <h2 className={styles.graphTitle}>Global Funding Connections</h2>
          <p className={styles.graphDescription}>
            This 3D globe visualizes the movement of development funds.
            Thicker arcs represent higher disbursement volumes ($M), while
            the paths trace the direct link between donor countries and recipient nations.
          </p>
          <iframe
            src="https://flo.uri.sh/visualisation/28710028/embed"
            title="Global Funding Connections"
            frameBorder="0"
            scrolling="no"
            style={{ width: "100%", height: "600px", border: "none" }}
            allowFullScreen
          />
        </section>

        <div className={styles.spacer} />

        <section className={styles.section}>
          <h2 className={styles.graphTitle}>Interactive Funding & Impact Explorer</h2>
          <p className={styles.graphDescription}>
            Explore funding and impact data for 103 countries. Use the toggles to switch between
            funding metrics and impact priorities.
          </p>
          <iframe
            src="https://flo.uri.sh/visualisation/28710271/embed"
            title="Interactive Funding & Impact Explorer"
            frameBorder="0"
            scrolling="no"
            style={{ width: "100%", height: "600px", border: "none" }}
            allowFullScreen
          />
        </section>
      </div>
    </div>
  );
}
