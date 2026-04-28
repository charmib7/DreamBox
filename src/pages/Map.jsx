import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./Page.module.css";

const COUNTRY_COORDS = {
  "Afghanistan": [33.93, 67.71], "Albania": [41.15, 20.17], "Algeria": [28.03, 1.66],
  "Angola": [-11.20, 17.87], "Argentina": [-38.41, -63.62], "Armenia": [40.07, 45.04],
  "Azerbaijan": [40.14, 47.58], "Bangladesh": [23.68, 90.36], "Belarus": [53.71, 27.95],
  "Belize": [17.19, -88.50], "Benin": [9.31, 2.32], "Bhutan": [27.51, 90.43],
  "Bolivia": [-16.29, -63.59], "Bosnia and Herzegovina": [43.92, 17.68],
  "Botswana": [-22.33, 24.68], "Brazil": [-14.24, -51.93], "Burkina Faso": [12.36, -1.56],
  "Burundi": [-3.37, 29.92], "Cabo Verde": [16.54, -23.04], "Cambodia": [12.57, 104.99],
  "Cameroon": [7.37, 12.35], "Central African Republic": [6.61, 20.94],
  "Chad": [15.45, 18.73], "China (People's Republic of)": [35.86, 104.19],
  "Colombia": [4.57, -74.30], "Comoros": [-11.64, 43.33], "Congo": [-0.23, 15.83],
  "Costa Rica": [9.75, -83.75], "Cuba": [21.52, -77.78], "Côte d'Ivoire": [7.54, -5.55],
  "Democratic People's Republic of Korea": [40.34, 127.51],
  "Democratic Republic of the Congo": [-4.04, 21.76],
  "Djibouti": [11.83, 42.59], "Dominica": [15.41, -61.37], "Dominican Republic": [18.74, -70.16],
  "Ecuador": [-1.83, -78.18], "Egypt": [26.82, 30.80], "El Salvador": [13.79, -88.90],
  "Equatorial Guinea": [1.65, 10.27], "Eritrea": [15.18, 39.78],
  "Eswatini": [-26.52, 31.47], "Ethiopia": [9.14, 40.49], "Fiji": [-17.71, 178.06],
  "Gabon": [-0.80, 11.61], "Gambia": [13.44, -15.31], "Georgia": [41.99, 43.50],
  "Ghana": [7.95, -1.02], "Grenada": [12.12, -61.68], "Guatemala": [15.78, -90.23],
  "Guinea": [11.80, -15.18], "Guinea-Bissau": [11.80, -15.18], "Guyana": [4.86, -58.93],
  "Haiti": [18.97, -72.29], "Honduras": [15.20, -86.24], "India": [20.59, 78.96],
  "Indonesia": [-0.79, 113.92], "Iran": [32.43, 53.69], "Iraq": [33.22, 43.68],
  "Jamaica": [18.11, -77.30], "Jordan": [30.59, 36.24], "Kazakhstan": [48.02, 66.92],
  "Kenya": [-0.02, 37.91], "Kiribati": [1.87, -157.36], "Kosovo": [42.60, 20.90],
  "Kyrgyzstan": [41.20, 74.77], "Lao People's Democratic Republic": [19.86, 102.50],
  "Lebanon": [33.85, 35.86], "Lesotho": [-29.61, 28.23], "Liberia": [6.43, -9.43],
  "Libya": [26.34, 17.23], "Madagascar": [-18.77, 46.87], "Malawi": [-13.25, 34.30],
  "Malaysia": [4.21, 101.98], "Maldives": [3.20, 73.22], "Mali": [17.57, -3.99],
  "Marshall Islands": [7.13, 171.18], "Mauritania": [21.01, -10.94],
  "Mauritius": [-20.35, 57.55], "Mexico": [23.63, -102.55], "Micronesia": [7.43, 150.55],
  "Moldova": [47.41, 28.37], "Mongolia": [46.86, 103.85], "Montenegro": [42.71, 19.37],
  "Morocco": [31.79, -7.09], "Mozambique": [-18.67, 35.53], "Myanmar": [21.91, 95.96],
  "Namibia": [-22.96, 18.49], "Nepal": [28.39, 84.12], "Nicaragua": [12.87, -85.21],
  "Niger": [17.61, 8.08], "Nigeria": [9.08, 8.68], "North Macedonia": [41.61, 21.75],
  "Pakistan": [30.38, 69.35], "Palestine": [31.95, 35.23], "Panama": [8.54, -80.78],
  "Papua New Guinea": [-6.31, 143.96], "Paraguay": [-23.44, -58.44],
  "Peru": [-9.19, -75.01], "Philippines": [12.88, 121.77], "Rwanda": [-1.94, 29.87],
  "Saint Lucia": [13.91, -60.98], "Samoa": [-13.76, -172.10],
  "Senegal": [14.50, -14.45], "Serbia": [44.02, 21.01], "Sierra Leone": [8.46, -11.78],
  "Solomon Islands": [-9.64, 160.16], "Somalia": [5.15, 46.20],
  "South Africa": [-30.56, 22.94], "South Sudan": [6.88, 31.31],
  "Sri Lanka": [7.87, 80.77], "Sudan": [12.86, 30.22], "Syria": [34.80, 38.99],
  "São Tomé and Príncipe": [0.19, 6.61], "Tajikistan": [38.86, 71.28],
  "Tanzania": [-6.37, 34.89], "Thailand": [15.87, 100.99], "Timor-Leste": [-8.87, 125.73],
  "Togo": [8.62, 0.82], "Tonga": [-21.18, -175.20], "Tunisia": [33.89, 9.54],
  "Turkey": [38.96, 35.24], "Turkmenistan": [38.97, 59.56], "Tuvalu": [-7.11, 177.65],
  "Uganda": [1.37, 32.29], "Ukraine": [48.38, 31.17], "Uzbekistan": [41.38, 64.59],
  "Vanuatu": [-15.38, 166.96], "Venezuela": [6.42, -66.59], "Vietnam": [14.06, 108.28],
  "West Bank and Gaza Strip": [31.95, 35.23], "Yemen": [15.55, 48.52],
  "Zambia": [-13.13, 27.85], "Zimbabwe": [-19.02, 29.15],
};

const GENDER_SECTORS = new Set([
  "Population Policies/Programmes & Reproductive Health",
  "Health", "Education", "Government & Civil Society",
]);

const CLIMATE_SECTORS = new Set([
  "General Environment Protection", "Agriculture, Forestry, Fishing",
  "Energy", "Water Supply & Sanitation", "Disaster Prevention & Preparedness",
]);

function impactColor(score) {
  const t = Math.min(score, 1);
  if (t < 0.5) {
    const s = t * 2;
    return `rgb(${Math.round(74 + 166*s)},${Math.round(144 + 21*s)},${Math.round(217 - 217*s)})`;
  }
  const s = (t - 0.5) * 2;
  return `rgb(${Math.round(240 - 24*s)},${Math.round(165 - 75*s)},${Math.round(0 + 48*s)})`;
}

function project(lat, lng, centerLat, centerLng) {
  const phi = lat * Math.PI / 180;
  const lam = lng * Math.PI / 180;
  const phi0 = centerLat * Math.PI / 180;
  const lam0 = centerLng * Math.PI / 180;
  const cosC = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lam - lam0);
  if (cosC < 0) return null;
  return {
    x: Math.cos(phi) * Math.sin(lam - lam0),
    y: Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lam - lam0),
    depth: cosC,
  };
}

function GlobeCanvas({ countries }) {
  const canvasRef = useRef(null);
  const [xAxis, setXAxis] = useState("funding");
  const [yAxis, setYAxis] = useState("gender");
  const [autoRotate, setAutoRotate] = useState(false);
  const [selected, setSelected] = useState(null);
  const rotRef = useRef({ lat: 20, lng: 0 });
  const dragRef = useRef(null);
  const stateRef = useRef({ xAxis, yAxis, countries });

  useEffect(() => { stateRef.current = { xAxis, yAxis, countries }; }, [xAxis, yAxis, countries]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { xAxis, yAxis, countries } = stateRef.current;
    const { lat, lng } = rotRef.current;
    const W = canvas.width, H = canvas.height;
    const R = Math.min(W, H) * 0.43;
    const cx = W / 2, cy = H / 2;

    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.05, cx, cy, R);
    bg.addColorStop(0, "#1a2f4a");
    bg.addColorStop(1, "#0a1628");
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = bg; ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 0.5;
    for (let la = -60; la <= 60; la += 30) {
      ctx.beginPath(); let first = true;
      for (let lo = -180; lo <= 180; lo += 4) {
        const p = project(la, lo, lat, lng);
        if (!p) { first = true; continue; }
        first ? ctx.moveTo(cx + p.x * R, cy - p.y * R) : ctx.lineTo(cx + p.x * R, cy - p.y * R);
        first = false;
      }
      ctx.stroke();
    }
    for (let lo = -150; lo <= 180; lo += 30) {
      ctx.beginPath(); let first = true;
      for (let la = -80; la <= 80; la += 4) {
        const p = project(la, lo, lat, lng);
        if (!p) { first = true; continue; }
        first ? ctx.moveTo(cx + p.x * R, cy - p.y * R) : ctx.lineTo(cx + p.x * R, cy - p.y * R);
        first = false;
      }
      ctx.stroke();
    }

    const getX = (c) => xAxis === "funding" ? c.crossBorderFunding : c.totalFunding;
    const getY = (c) => {
      const base = c.totalFunding > 0 ? (yAxis === "gender" ? c.genderTotal : c.climateTotal) / c.totalFunding : 0;
      return Math.min(base * 4, 1);
    };
    const maxX = Math.max(...countries.map(getX), 1);

    const pts = countries
      .map(c => { const p = project(c.coords[0], c.coords[1], lat, lng); return p ? { c, p } : null; })
      .filter(Boolean)
      .sort((a, b) => a.p.depth - b.p.depth);

    for (const { c, p } of pts) {
      const r = Math.max(3, Math.sqrt(getX(c) / maxX) * 20);
      const sx = cx + p.x * R, sy = cy - p.y * R;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = impactColor(getY(c));
      ctx.globalAlpha = 0.88; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 0.5; ctx.stroke();
    }

    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1; ctx.stroke();
  }, []);

  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      if (stateRef.current.autoRotate) rotRef.current.lng += 0.2;
      draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => { running = false; };
  }, [draw]);

  useEffect(() => { if (!autoRotate) draw(); }, [xAxis, yAxis, autoRotate, draw]);

  const handleMouseDown = (e) => {
    dragRef.current = { x: e.clientX, y: e.clientY, lat: rotRef.current.lat, lng: rotRef.current.lng };
  };
  const handleMouseMove = (e) => {
    if (!dragRef.current) return;
    rotRef.current.lng = dragRef.current.lng + (e.clientX - dragRef.current.x) * 0.35;
    rotRef.current.lat = Math.max(-80, Math.min(80, dragRef.current.lat - (e.clientY - dragRef.current.y) * 0.35));
    if (!stateRef.current.autoRotate) draw();
  };
  const handleMouseUp = (e) => {
    if (dragRef.current && Math.abs(e.clientX - dragRef.current.x) < 4 && Math.abs(e.clientY - dragRef.current.y) < 4) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const R = Math.min(canvas.width, canvas.height) * 0.43;
      const { lat, lng } = rotRef.current;
      let best = null, bestDist = 28;
      for (const c of stateRef.current.countries) {
        const p = project(c.coords[0], c.coords[1], lat, lng);
        if (!p) continue;
        const d = Math.hypot(mx - (cx + p.x * R), my - (cy - p.y * R));
        if (d < bestDist) { bestDist = d; best = c; }
      }
      setSelected(best);
    }
    dragRef.current = null;
  };

  const btnStyle = (active, color) => ({
    fontSize: 13, padding: "6px 14px", borderRadius: 6, cursor: "pointer",
    border: `1.5px solid ${color}`,
    background: active ? color : "transparent",
    color: active ? "#fff" : "var(--ink)",
    transition: "background 0.15s, color 0.15s",
  });

  return (
    <div style={{ padding: "1rem 0" }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setXAxis("funding")} style={btnStyle(xAxis === "funding", "#534AB7")}>Total Funding</button>
          <button onClick={() => setXAxis("commitment")} style={btnStyle(xAxis === "commitment", "#534AB7")}>All Flows</button>
        </div>
        <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 500 }}>vs</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setYAxis("gender")} style={btnStyle(yAxis === "gender", "#D85A30")}>Gender Impact</button>
          <button onClick={() => setYAxis("climate")} style={btnStyle(yAxis === "climate", "#D85A30")}>Climate Impact</button>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={autoRotate} onChange={e => setAutoRotate(e.target.checked)} style={{ cursor: "pointer" }} />
            Auto-rotate
          </label>
        </div>
      </div>

      <canvas
        ref={canvasRef} width={800} height={500}
        style={{ width: "100%", cursor: "grab", borderRadius: 12, border: "1px solid var(--border)", display: "block", background: "#0a1628" }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp} onMouseLeave={() => { dragRef.current = null; }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: 10, padding: 14, fontSize: 13, border: "1px solid var(--border)", color: "var(--muted)", textAlign: "left" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Country Details</div>
          {selected ? (
            <>
              <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 8, fontSize: 14 }}>{selected.name}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                <div>Cross-border: <strong style={{ color: "var(--ink)" }}>${selected.crossBorderFunding.toFixed(0)}M</strong></div>
                <div>All flows: <strong style={{ color: "var(--ink)" }}>${selected.totalFunding.toFixed(0)}M</strong></div>
                <div>Gender sectors: <strong style={{ color: "var(--ink)" }}>${selected.genderTotal.toFixed(1)}M</strong></div>
                <div>Climate sectors: <strong style={{ color: "var(--ink)" }}>${selected.climateTotal.toFixed(1)}M</strong></div>
              </div>
            </>
          ) : (
            <span>Click a dot on the globe to see country details</span>
          )}
        </div>
        <div style={{ background: "rgba(0,0,0,0.03)", padding: 14, borderRadius: 10, border: "1px solid var(--border)", textAlign: "left" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Legend</div>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 12, display: "block", marginBottom: 6, color: "var(--ink)" }}>
              Dot size → {xAxis === "funding" ? "Cross-border funding" : "All flows"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {[8, 14, 20].map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: s, height: s, borderRadius: "50%", background: "#534AB7" }} />
                  <span style={{ fontSize: 11 }}>{["Low", "Med", "High"][i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, display: "block", marginBottom: 6, color: "var(--ink)" }}>
              Color → {yAxis === "gender" ? "Gender" : "Climate"} impact intensity
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 80, height: 8, borderRadius: 4, background: "linear-gradient(to right, #4a90d9, #f0a500, #D85A30)" }} />
              <span style={{ fontSize: 11, color: "var(--muted)" }}>Low → High</span>
            </div>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 10 }}>
        Drag to rotate · Click a dot for details · Data: OECD Philanthropy 2020–2023
      </p>
    </div>
  );
}

export default function Map() {
  const [countries, setCountries] = useState(null);

  useEffect(() => {
    fetch("/oecd_data.json").then(r => r.json()).then(d => {
      const map = {};
      d.records.forEach(r => {
        if (!COUNTRY_COORDS[r.recipientCountry]) return;
        if (!map[r.recipientCountry]) map[r.recipientCountry] = {
          name: r.recipientCountry,
          coords: COUNTRY_COORDS[r.recipientCountry],
          totalFunding: 0, crossBorderFunding: 0, genderTotal: 0, climateTotal: 0,
        };
        const c = map[r.recipientCountry];
        c.totalFunding += r.amount;
        if (r.flowType === "Cross-border") c.crossBorderFunding += r.amount;
        if (GENDER_SECTORS.has(r.sector)) c.genderTotal += r.amount;
        if (CLIMATE_SECTORS.has(r.sector)) c.climateTotal += r.amount;
      });
      setCountries(Object.values(map));
    });
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
            frameBorder="0" scrolling="no"
            style={{ width: "100%", height: "600px", border: "none" }}
            allowFullScreen
          />
        </section>

        <div className={styles.spacer} />

        <section className={styles.section}>
          <h2 className={styles.graphTitle}>Interactive Funding & Impact Explorer</h2>
          <p className={styles.graphDescription}>
            Explore funding and impact data across 100+ recipient countries.
            Dot size reflects disbursement volume; color shows sector impact intensity.
          </p>
          {countries
            ? <GlobeCanvas countries={countries} />
            : <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px 0", fontSize: 14 }}>Loading country data…</div>
          }
        </section>
      </div>
    </div>
  );
}
