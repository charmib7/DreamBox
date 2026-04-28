import { useEffect } from "react";
import styles from "./Page.module.css";

export default function Map() {
  useEffect(() => {
    // Load Flourish script for the first map
    const script = document.createElement("script");
    script.src = "https://public.flourish.studio/resources/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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

        {/* Interactive Data Globe - Replaced Section */}
        <section className={styles.section}>
          <h2 className={styles.graphTitle}>Interactive Funding & Impact Explorer</h2>
          <p className={styles.graphDescription}>
            Explore funding and impact data for 103 countries. Use the toggles to switch between 
            funding metrics and impact priorities.
          </p>

          <div style={{ fontFamily: "var(--font-sans)", padding: "1rem 0" }}>
            {/* Control Bar */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  id="btn-funding"
                  onClick={() => window.setXAxis?.('funding')}
                  style={{ fontSize: 13, padding: "6px 14px", borderRadius: 6, border: "1.5px solid #534AB7", background: "#534AB7", color: "#fff", cursor: "pointer" }}
                >
                  Total Funding
                </button>
                <button
                  id="btn-commitment"
                  onClick={() => window.setXAxis?.('commitment')}
                  style={{ fontSize: 13, padding: "6px 14px", borderRadius: 6, border: "1.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-primary)", cursor: "pointer" }}
                >
                  Total Commitment
                </button>
              </div>
              
              <span style={{ color: "var(--color-text-secondary)", fontSize: 13, fontWeight: 500 }}>vs</span>

              <div style={{ display: "flex", gap: 6 }}>
                <button
                  id="btn-gender"
                  onClick={() => window.setYAxis?.('gender')}
                  style={{ fontSize: 13, padding: "6px 14px", borderRadius: 6, border: "1.5px solid #D85A30", background: "#D85A30", color: "#fff", cursor: "pointer" }}
                >
                  Gender Impact
                </button>
                <button
                  id="btn-climate"
                  onClick={() => window.setYAxis?.('climate')}
                  style={{ fontSize: 13, padding: "6px 14px", borderRadius: 6, border: "1.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-primary)", cursor: "pointer" }}
                >
                  Climate Impact
                </button>
              </div>

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Auto-rotate</label>
                <input type="checkbox" id="autoRotate" style={{ cursor: "pointer" }} />
              </div>
            </div>

            {/* Main Visual Content */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
              <div style={{ position: "relative" }}>
                <canvas
                  id="globe"
                  width={560}
                  height={460}
                  style={{ width: "100%", cursor: "grab", borderRadius: 12, border: "1px solid var(--color-border-tertiary)", display: "block", background: "#0d1b2e" }}
                />
                <div id="tooltip" style={{ display: "none", position: "absolute", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "10px 14px", fontSize: 12, pointerEvents: "none", maxWidth: 200, zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                <div id="loading-msg" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "#8ab4d4", fontSize: 13, pointerEvents: "none" }}>
                  Initializing globe...
                </div>
              </div>

              {/* Sidebar Legend/Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Country details
                  </div>
                  <div id="detail-panel" style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: 16, fontSize: 13, minHeight: 160, border: "1px solid var(--color-border-tertiary)", color: "var(--color-text-secondary)" }}>
                    Click a dot on the globe to see country details
                  </div>
                </div>

                <div style={{ background: "var(--color-background-secondary)", padding: 16, borderRadius: 10, border: "1px solid var(--color-border-tertiary)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Visual Legend
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 12, display: "block", marginBottom: 8, color: "var(--color-text-primary)" }}>Dot Size (X-Axis)</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#534AB7" }} />
                      <span style={{ fontSize: 12 }}>Low</span>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#534AB7", marginLeft: 8 }} />
                      <span style={{ fontSize: 12 }}>Med</span>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#534AB7", marginLeft: 8 }} />
                      <span style={{ fontSize: 12 }}>High</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: 12, display: "block", marginBottom: 8, color: "var(--color-text-primary)" }}>Dot Color (Y-Axis)</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 80, height: 8, borderRadius: 4, background: "linear-gradient(to right, #4a90d9, #f0a500, #D85A30)" }} />
                      <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Low → High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
