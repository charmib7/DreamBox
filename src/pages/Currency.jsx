"use client";
import { useState, useMemo } from "react";
import styles from "./Page.module.css";
import { useFundingData } from "../../hooks/useFundingData";

// ── Exchange rates (replace values with a live API fetch if needed) ───────────
const CURRENCIES = {
  USD: { rate: 1,      symbol: "$",   label: "US Dollar",         flag: "🇺🇸" },
  GBP: { rate: 0.79,   symbol: "£",   label: "British Pound",     flag: "🇬🇧" },
  EUR: { rate: 0.92,   symbol: "€",   label: "Euro",              flag: "🇪🇺" },
  KES: { rate: 129.5,  symbol: "KSh", label: "Kenyan Shilling",   flag: "🇰🇪" },
  MWK: { rate: 1730,   symbol: "MK",  label: "Malawian Kwacha",   flag: "🇲🇼" },
  UGX: { rate: 3700,   symbol: "USh", label: "Ugandan Shilling",  flag: "🇺🇬" },
  UAH: { rate: 41.5,   symbol: "₴",   label: "Ukrainian Hryvnia", flag: "🇺🇦" },
  ZWL: { rate: 320,    symbol: "Z$",  label: "Zimbabwe Dollar",   flag: "🇿🇼" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function convert(usdMillions, code) {
  return usdMillions * CURRENCIES[code].rate;
}

function formatAmount(usdMillions, code) {
  const { symbol, rate } = CURRENCIES[code];
  const val = usdMillions * rate;
  if (val < 0.001) return `${symbol}${val.toFixed(6)}M`;
  if (val < 0.01)  return `${symbol}${val.toFixed(5)}M`;
  if (val < 1)     return `${symbol}${val.toFixed(4)}M`;
  return `${symbol}${val.toFixed(2)}M`;
}

function formatTotal(usdMillions, code) {
  const { symbol, rate } = CURRENCIES[code];
  const val = usdMillions * rate;
  if (val >= 1_000_000) return `${symbol}${(val / 1_000_000).toFixed(2)}T`;
  if (val >= 1_000)     return `${symbol}${(val / 1_000).toFixed(2)}B`;
  return `${symbol}${val.toFixed(2)}M`;
}

// ── Bar chart (pure SVG, no dependencies) ────────────────────────────────────
function BarChart({ data, currency }) {
  const { symbol } = CURRENCIES[currency];

  const byCountry = useMemo(() => {
    const map = {};
    data.forEach(d => { map[d.country] = (map[d.country] || 0) + d.usd; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [data]);

  if (byCountry.length === 0) return null;

  const chartH = 160;
  const chartW = 580;
  const gap    = 8;
  const barW   = Math.floor((chartW - (byCountry.length - 1) * gap) / byCountry.length);
  const maxVal = convert(byCountry[0][1], currency);

  return (
    <div style={{ marginTop: "2rem" }}>
      <p style={sectionLabelStyle}>Disbursements by country · {symbol}M</p>
      <svg
        viewBox={`0 0 ${chartW} ${chartH + 36}`}
        style={{ width: "100%", overflow: "visible" }}
        role="img"
        aria-label="Bar chart of total disbursements by country"
      >
        {byCountry.map(([country, usd], i) => {
          const val  = convert(usd, currency);
          const barH = Math.max(2, (val / maxVal) * chartH);
          const x    = i * (barW + gap);
          const y    = chartH - barH;
          return (
            <g key={country}>
              <rect
                x={x} y={y} width={barW} height={barH}
                fill={i === 0 ? "var(--color-text-primary)" : "var(--color-border-secondary)"}
                rx={3}
              />
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">
                {country.length > 8 ? country.slice(0, 7) + "…" : country}
              </text>
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={9} fill="var(--color-text-tertiary)">
                {symbol}{val < 1 ? val.toFixed(2) : val.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub }) {
  return (
    <div style={metricCardStyle}>
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "2px 0 0" }}>{sub}</p>}
    </div>
  );
}

// ── Org badge ─────────────────────────────────────────────────────────────────
function OrgBadge({ org }) {
  const isLund = org === "Lund Trust";
  return (
    <span style={{
      fontSize: 11,
      padding: "2px 8px",
      borderRadius: 6,
      whiteSpace: "nowrap",
      background: isLund ? "var(--color-background-info)"    : "var(--color-background-warning)",
      color:      isLund ? "var(--color-text-info)"          : "var(--color-text-warning)",
    }}>
      {isLund ? "Lund" : "True Colours"}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Currency() {
  const { data, loading, error } = useFundingData();

  const [currency, setCurrency] = useState("USD");
  const [sector,   setSector]   = useState("All sectors");
  const [region,   setRegion]   = useState("All regions");
  const [sort,     setSort]     = useState("desc");

  // Build filter options dynamically from real data
  const sectors = useMemo(() => {
    const s = new Set(data.map(d => d.sector).filter(Boolean));
    return ["All sectors", ...Array.from(s).sort()];
  }, [data]);

  const regions = useMemo(() => {
    const r = new Set(data.map(d => d.region).filter(Boolean));
    return ["All regions", ...Array.from(r).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter(d => {
      if (sector !== "All sectors" && d.sector !== sector) return false;
      if (region !== "All regions" && d.region !== region) return false;
      return true;
    });
  }, [data, sector, region]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sort === "asc")  return a.usd - b.usd;
      if (sort === "year") return b.year - a.year;
      return b.usd - a.usd;
    });
  }, [filtered, sort]);

  const totalUsd   = filtered.reduce((s, d) => s + d.usd, 0);
  const countrySet = new Set(filtered.map(d => d.country));
  const { symbol, label, rate } = CURRENCIES[currency];

  if (loading) return (
    <div className={styles.inner}>
      <p className={styles.eyebrow}>WorldScope</p>
      <h1 className={styles.title}>Currency</h1>
      <div className={styles.divider} />
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Loading funding data…</p>
    </div>
  );

  if (error) return (
    <div className={styles.inner}>
      <p className={styles.eyebrow}>WorldScope</p>
      <h1 className={styles.title}>Currency</h1>
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
      <h1 className={styles.title}>Currency</h1>
      <div className={styles.divider} />
      <p className={styles.subtitle}>
        Track exchange rates and financial flows worldwide.
      </p>

      {/* ── Currency selector ── */}
      <div style={rowStyle}>
        <div style={controlGroupStyle}>
          <label style={labelStyle}>Display currency</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)}>
            {Object.entries(CURRENCIES).map(([code, { label, flag }]) => (
              <option key={code} value={code}>{flag} {code} – {label}</option>
            ))}
          </select>
        </div>
        <div style={rateBoxStyle}>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Exchange rate</span>
          <span style={{ fontSize: 18, fontWeight: 500 }}>1 USD = {rate} {currency}</span>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div style={metricsGridStyle}>
        <MetricCard label="Total disbursed"  value={formatTotal(totalUsd, currency)} />
        <MetricCard label="Projects"         value={filtered.length} />
        <MetricCard label="Countries"        value={countrySet.size} />
        <MetricCard label="Currency"         value={`${symbol} ${currency}`} sub={label} />
      </div>

      {/* ── Chart ── */}
      <BarChart data={filtered} currency={currency} />

      {/* ── Filters ── */}
      <div style={{ ...rowStyle, marginTop: "2.5rem", gap: 12, flexWrap: "wrap" }}>
        <div style={controlGroupStyle}>
          <label style={labelStyle}>Sector</label>
          <select value={sector} onChange={e => setSector(e.target.value)}>
            {sectors.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={controlGroupStyle}>
          <label style={labelStyle}>Region</label>
          <select value={region} onChange={e => setRegion(e.target.value)}>
            {regions.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={controlGroupStyle}>
          <label style={labelStyle}>Sort by</label>
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="desc">Amount ↓</option>
            <option value="asc">Amount ↑</option>
            <option value="year">Year ↓</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={tableWrapStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {["Project", "Org", "Country", "Sector", "Year", `Amount (${currency})`].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-tertiary)" }}>
                  No projects match these filters.
                </td>
              </tr>
            ) : sorted.map((d, i) => (
              <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <td style={{ ...tdStyle, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={d.title}>
                  {d.title}
                </td>
                <td style={tdStyle}><OrgBadge org={d.org} /></td>
                <td style={tdStyle}>{d.country}</td>
                <td style={{ ...tdStyle, color: "var(--color-text-secondary)", fontSize: 12 }}>{d.sector}</td>
                <td style={tdStyle}>{d.year}</td>
                <td style={{ ...tdStyle, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                  {formatAmount(d.usd, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 12 }}>
        Amounts in USD millions (deflated). Exchange rates are illustrative —
        connect <code>api.frankfurter.app</code> for live rates.
      </p>

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

const rateBoxStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: "8px 14px",
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: "var(--border-radius-md)",
  background: "var(--color-background-secondary)",
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

const sectionLabelStyle = {
  fontSize: 11,
  color: "var(--color-text-tertiary)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 12,
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