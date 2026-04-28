"use client";
import { useState, useMemo } from "react";
import styles from "./Page.module.css";
import { useFundingData } from "../../hooks/useFundingData";

const MEDALS = ["🥇", "🥈", "🥉"];

function formatUSD(usdMillions) {
  if (usdMillions >= 1_000) return `$${(usdMillions / 1_000).toFixed(2)}B`;
  return `$${usdMillions.toFixed(2)}M`;
}

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>{value}</p>
    </div>
  );
}

// ── Rank row ──────────────────────────────────────────────────────────────────
function RankRow({ rank, org, totalUsd, grantCount, countries, topSector }) {
  return (
    <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
      <td style={{ ...tdStyle, width: 52, textAlign: "center", fontWeight: 600, fontSize: rank <= 3 ? 18 : 13 }}>
        {rank <= 3 ? MEDALS[rank - 1] : rank}
      </td>
      <td style={{ ...tdStyle, fontWeight: 500 }}>{org}</td>
      <td style={{ ...tdStyle, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
        {formatUSD(totalUsd)}
      </td>
      <td style={{ ...tdStyle, textAlign: "center" }}>{grantCount}</td>
      <td style={{ ...tdStyle, textAlign: "center" }}>{countries}</td>
      <td style={{ ...tdStyle, color: "var(--color-text-secondary)", fontSize: 12 }}>{topSector}</td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Rankings() {
  const { data, loading, error } = useFundingData();

  const yearRange = useMemo(() => {
    const years = data.map(d => d.year).filter(y => y > 0);
    if (!years.length) return { min: 2000, max: 2024 };
    return { min: Math.min(...years), max: Math.max(...years) };
  }, [data]);

  const [yearFrom, setYearFrom] = useState(null);
  const [yearTo,   setYearTo]   = useState(null);
  const [region,   setRegion]   = useState("All regions");
  const [sector,   setSector]   = useState("All sectors");

  const effectiveFrom = yearFrom ?? yearRange.min;
  const effectiveTo   = yearTo   ?? yearRange.max;

  const sectors = useMemo(() => {
    const s = new Set(data.map(d => d.sector).filter(Boolean));
    return ["All sectors", ...Array.from(s).sort()];
  }, [data]);

  const regions = useMemo(() => {
    const r = new Set(data.map(d => d.region).filter(Boolean));
    return ["All regions", ...Array.from(r).sort()];
  }, [data]);

  const yearOptions = useMemo(() => {
    const out = [];
    for (let y = yearRange.min; y <= yearRange.max; y++) out.push(y);
    return out;
  }, [yearRange]);

  const filtered = useMemo(() => {
    return data.filter(d => {
      if (d.year < effectiveFrom || d.year > effectiveTo) return false;
      if (region !== "All regions" && d.region !== region) return false;
      if (sector !== "All sectors" && d.sector !== sector) return false;
      return true;
    });
  }, [data, effectiveFrom, effectiveTo, region, sector]);

  // Aggregate by donor organization
  const ranked = useMemo(() => {
    const map = {};
    filtered.forEach(d => {
      if (!map[d.org]) {
        map[d.org] = { org: d.org, totalUsd: 0, grantCount: 0, countries: new Set(), sectors: {} };
      }
      const e = map[d.org];
      e.totalUsd += d.usd;
      e.grantCount += 1;
      e.countries.add(d.country);
      e.sectors[d.sector] = (e.sectors[d.sector] || 0) + d.usd;
    });

    return Object.values(map)
      .map(e => ({
        org: e.org,
        totalUsd: e.totalUsd,
        grantCount: e.grantCount,
        countries: e.countries.size,
        topSector: Object.entries(e.sectors).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—",
      }))
      .sort((a, b) => b.totalUsd - a.totalUsd);
  }, [filtered]);

  const totalUsd = filtered.reduce((s, d) => s + d.usd, 0);

  if (loading) return (
    <div className={styles.inner}>
      <p className={styles.eyebrow}>WorldScope</p>
      <h1 className={styles.title}>Rankings</h1>
      <div className={styles.divider} />
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Loading funding data…</p>
    </div>
  );

  if (error) return (
    <div className={styles.inner}>
      <p className={styles.eyebrow}>WorldScope</p>
      <h1 className={styles.title}>Rankings</h1>
      <div className={styles.divider} />
      <p style={{ color: "var(--color-text-danger)", fontSize: 14 }}>
        Could not load data: {error}. Make sure the Google Sheet is published to web as CSV.
      </p>
    </div>
  );

  return (
    <div className={styles.inner}>

      {/* ── Header ── */}
      <p className={styles.eyebrow}>WorldScope</p>
      <h1 className={styles.title}>Rankings</h1>
      <div className={styles.divider} />
      <p className={styles.subtitle}>
        See how nations, cities, and metrics stack up.
      </p>

      {/* ── Metrics ── */}
      <div style={metricsGridStyle}>
        <MetricCard label="Total disbursed" value={formatUSD(totalUsd)} />
        <MetricCard label="Donors ranked"   value={ranked.length} />
        <MetricCard label="Grants included" value={filtered.length} />
        <MetricCard label="Year range"      value={`${effectiveFrom}–${effectiveTo}`} />
      </div>

      {/* ── Filters ── */}
      <div style={{ ...rowStyle, marginTop: "2rem", gap: 12, flexWrap: "wrap" }}>
        <div style={controlGroupStyle}>
          <label style={labelStyle}>Year from</label>
          <select value={effectiveFrom} onChange={e => setYearFrom(Number(e.target.value))}>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div style={controlGroupStyle}>
          <label style={labelStyle}>Year to</label>
          <select value={effectiveTo} onChange={e => setYearTo(Number(e.target.value))}>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div style={controlGroupStyle}>
          <label style={labelStyle}>Region</label>
          <select value={region} onChange={e => setRegion(e.target.value)}>
            {regions.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={controlGroupStyle}>
          <label style={labelStyle}>Sector</label>
          <select value={sector} onChange={e => setSector(e.target.value)}>
            {sectors.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Rankings table ── */}
      <div style={{ ...tableWrapStyle, marginTop: "1.5rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {["Rank", "Organization", "Total Disbursed", "Grants", "Countries", "Top Sector"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-tertiary)" }}>
                  No data matches these filters.
                </td>
              </tr>
            ) : ranked.map((d, i) => (
              <RankRow
                key={d.org}
                rank={i + 1}
                org={d.org}
                totalUsd={d.totalUsd}
                grantCount={d.grantCount}
                countries={d.countries}
                topSector={d.topSector}
              />
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const rowStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-end",
  gap: 16,
  marginTop: "1.5rem",
};

const controlGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelStyle = {
  fontSize: 12,
  color: "var(--color-text-secondary)",
};

const metricsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: 10,
  marginTop: "1.5rem",
};

const metricCardStyle = {
  background: "var(--color-background-secondary)",
  borderRadius: "var(--border-radius-md)",
  padding: "14px 16px",
};

const tableWrapStyle = {
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: "var(--border-radius-lg)",
  overflow: "hidden",
  marginTop: "1rem",
};

const thStyle = {
  background: "var(--color-background-secondary)",
  fontWeight: 500,
  fontSize: 11,
  color: "var(--color-text-secondary)",
  textAlign: "left",
  padding: "10px 14px",
  borderBottom: "0.5px solid var(--color-border-tertiary)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const tdStyle = {
  padding: "10px 14px",
  color: "var(--color-text-primary)",
};
