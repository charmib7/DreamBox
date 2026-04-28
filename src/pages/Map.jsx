import { useEffect } from "react";
import styles from "./Page.module.css";

export default function Map() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://public.flourish.studio/resources/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className={styles.inner}>
      <p className={styles.eyebrow}>WorldScope</p>
      <h1 className={styles.title}>Global Impact Analysis</h1>
      <div className={styles.divider} />
      
      <p className={styles.subtitle}>
        <strong>Bridges of Development:</strong> Tracking the flow of global aid 
        from donor origins to regional impact sites.
      </p>

      <div className={styles.mapContainer}>
        {/* Connection Map - The Flow of Intent */}
        <section className={styles.section}>
          <h2 className={styles.graphTitle}>Global Funding Connections</h2>
          <p className={styles.graphDescription}>
            This 3D globe visualizes the movement of development funds. 
            Thicker arcs represent higher disbursement volumes ($M), while 
            the paths trace the direct link between donor countries and recipient nations.
          </p>
          <div 
            className="flourish-embed flourish-globe" 
            data-src="visualisation/28710028"
          />
        </section>

        <div className={styles.spacer} />

        {/* 3D Region Map - Territorial Impact */}
        <section className={styles.section}>
          <h2 className={styles.graphTitle}>Regional Distribution & Impact</h2>
          <p className={styles.graphDescription}>
            A territorial breakdown of funding density. Use the filters to explore 
            how Climate and Gender impact scores vary across different geographic regions.
          </p>
          <div 
            className="flourish-embed flourish-webgl" 
            data-src="visualisation/28710271"
          />
        </section>
      </div>
    </div>
  );
}
