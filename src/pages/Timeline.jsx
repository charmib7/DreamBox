import { useState, useEffect, useMemo, useRef } from "react";
import styles from "./Timeline.module.css";

const CURRENCIES = [
  { code: "USD", symbol: "$",  label: "US Dollar",         rate: 1 },
  { code: "EUR", symbol: "€",  label: "Euro",              rate: 0.92 },
  { code: "GBP", symbol: "£",  label: "British Pound",     rate: 0.79 },
  { code: "JPY", symbol: "¥",  label: "Japanese Yen",      rate: 149.5 },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar",   rate: 1.36 },
  { code: "AUD", symbol: "A$", label: "Australian Dollar", rate: 1.53 },
  { code: "CHF", symbol: "Fr", label: "Swiss Franc",       rate: 0.90 },
  { code: "CNY", symbol: "¥",  label: "Chinese Yuan",      rate: 7.24 },
];

const YEARS = ["2020", "2021", "2022", "2023"];
const DIMENSIONS = ["By Donor", "By Sector", "By Region"];
const TOP_COUNTS = [3, 5, 10];

const LINE_COLORS = [
  "#c84b2f",
  "#2a6496",
  "#3d8b3d",
  "#8b5e3c",
  "#7b4f9e",
  "#c97f2a",
  "#2a8b8b",
  "#8b2a6d",
  "#4a6b3a",
  "#6b6b2a",
];

function formatAmount(n, currency) {
  const { symbol, rate } = currency;
  const m = n * rate;
  if (m >= 1000) return `${symbol}${(m / 1000).toFixed(1)}B`;
  if (m >= 1)    return `${symbol}${m.toFixed(0)}M`;
  if (m >= 0.001) return `${symbol}${(m * 1000).toFixed(0)}K`;
  return `${symbol}${(m * 1e6).toFixed(0)}`;
}

function formatAmountShort(n, currency) {
  const { symbol, rate } = currency;
  const m = n * rate;
  if (m >= 1000) return `${symbol}${(m / 1000).toFixed(1)}B`;
  if (m >= 1)    return `${symbol}${Math.round(m)}M`;
  return `${symbol}${(m * 1000).toFixed(0)}K`;
}

function getDimensionKey(r, dimension) {
  if (dimension === "By Donor") return r.donorCountry;
  if (dimension === "By Sector") return r.sector;
  return r.region;
}

function computeTimeSeries(records, dimension, topN) {
  const entityTotals = {};
  const yearEntityAmounts = {};
  const yearTotals = {};

  for (const r of records) {
    const key = getDimensionKey(r, dimension);
    if (!key || key === "Unspecified") continue;
    const yr = r.year;

    entityTotals[key] = (entityTotals[key] || 0) + r.amount;
    if (!yearEntityAmounts[yr]) yearEntityAmounts[yr] = {};
    yearEntityAmounts[yr][key] = (yearEntityAmounts[yr][key] || 0) + r.amount;
    yearTotals[yr] = (yearTotals[yr] || 0) + r.amount;
  }

  const topEntities = Object.entries(entityTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name]) => name);

  const series = topEntities.map((name, i) => ({
    name,
    color: LINE_COLORS[i % LINE_COLORS.length],
    data: YEARS.map((yr) => ({ year: yr, amount: yearEntityAmounts[yr]?.[name] || 0 })),
    total: entityTotals[name],
  }));

  const totalLine = {
    name: "Total",
    color: "#2a2a2a",
    data: YEARS.map((yr) => ({ year: yr, amount: yearTotals[yr] || 0 })),
    total: Object.values(yearTotals).reduce((s, v) => s + v, 0),
  };

  return { series, totalLine, yearTotals };
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Timeline() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [dimension, setDimension] = useState("By Donor");
  const [topN, setTopN]         = useState(5);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [hoveredYear, setHoveredYear] = useState(null);
  const [highlightedSeries, setHighlightedSeries] = useState(null);
  const [showTotal, setShowTotal] = useState(true);

  const [selectedRegions,     setSelectedRegions]     = useState([]);
  const [selectedDonors,      setSelectedDonors]      = useState([]);
  const [selectedSectors,     setSelectedSectors]     = useState([]);
  const [selectedFlows,       setSelectedFlows]       = useState([]);
  const [selectedInstruments, setSelectedInstruments] = useState([]);

  useEffect(() => {
    fetch("/oecd_data.json").then((r) => r.json()).then((d) => {
      setData(d); setLoading(false);
    });
  }, []);

  const toggleItem = (setter, current, val) =>
    setter(current.includes(val) ? current.filter((v) => v !== val) : [...current, val]);

  const clearFilters = () => {
    setSelectedRegions([]); setSelectedDonors([]);
    setSelectedSectors([]); setSelectedFlows([]); setSelectedInstruments([]);
  };

  const activeFilterCount =
    selectedRegions.length + selectedDonors.length +
    selectedSectors.length + selectedFlows.length + selectedInstruments.length;

  const filteredRecords = useMemo(() => {
    if (!data) return [];
    return data.records.filter((r) => {
      if (selectedRegions.length     && !selectedRegions.includes(r.region))         return false;
      if (selectedDonors.length      && !selectedDonors.includes(r.donorCountry))    return false;
      if (selectedSectors.length     && !selectedSectors.includes(r.sector))         return false;
      if (selectedFlows.length       && !selectedFlows.includes(r.flowType))         return false;
      if (selectedInstruments.length && !selectedInstruments.includes(r.instrument)) return false;
      return true;
    });
  }, [data, selectedRegions, selectedDonors, selectedSectors, selectedFlows, selectedInstruments]);

  const { series, totalLine, yearTotals } = useMemo(
    () => computeTimeSeries(filteredRecords, dimension, topN),
    [filteredRecords, dimension, topN]
  );

  if (loading) return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>OECD Philanthropy</p>
      <h1 className={styles.title}>Timeline</h1>
      <div className={styles.divider} />
      <p className={styles.loading}>Loading dataset…</p>
    </div>
  );

  const { filters } = data;
  const focusYear = hoveredYear || "2023";
  const totalForYear = yearTotals[focusYear] || 0;
  const totalAll = Object.values(yearTotals).reduce((s, v) => s + v, 0);

  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>OECD Philanthropy</p>
      <h1 className={styles.title}>Timeline</h1>
      <div className={styles.divider} />
      <p className={styles.subtitle}>
        Track how philanthropic funding evolved from 2020 to 2023 — across donors, sectors, and regions.
      </p>

      {/* ── Controls ── */}
      <div className={styles.controls}>
        <div className={styles.controlsLeft}>
          <div className={styles.categoryTabs}>
            {DIMENSIONS.map((dim) => (
              <button key={dim}
                className={`${styles.catTab} ${dimension === dim ? styles.catTabActive : ""}`}
                onClick={() => { setDimension(dim); setHighlightedSeries(null); }}
              >{dim}</button>
            ))}
          </div>
          <button
            className={`${styles.filterToggle} ${filtersOpen ? styles.filterToggleOpen : ""}`}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Filters
            {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
          </button>
        </div>
        <div className={styles.controlsRight}>
          <select className={styles.currencySelect} value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find((c) => c.code === e.target.value))}>
            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.label}</option>)}
          </select>
          <div className={styles.countPills}>
            {TOP_COUNTS.map((n) => (
              <button key={n}
                className={`${styles.countPill} ${topN === n ? styles.countPillActive : ""}`}
                onClick={() => setTopN(n)}
              >Top {n}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {filtersOpen && (
        <div className={styles.filterPanel}>
          <FilterGroup label="Region"        options={filters.regions}        selected={selectedRegions}     onToggle={(v) => toggleItem(setSelectedRegions, selectedRegions, v)} />
          <FilterGroup label="Donor Country" options={filters.donorCountries} selected={selectedDonors}      onToggle={(v) => toggleItem(setSelectedDonors, selectedDonors, v)} scrollable />
          <FilterGroup label="Sector"        options={filters.sectors}        selected={selectedSectors}     onToggle={(v) => toggleItem(setSelectedSectors, selectedSectors, v)} scrollable />
          <FilterGroup label="Flow Type"     options={filters.flowTypes}      selected={selectedFlows}       onToggle={(v) => toggleItem(setSelectedFlows, selectedFlows, v)} />
          <FilterGroup label="Instrument"    options={filters.instruments}    selected={selectedInstruments} onToggle={(v) => toggleItem(setSelectedInstruments, selectedInstruments, v)} scrollable />
          {activeFilterCount > 0 && <button className={styles.clearBtn} onClick={clearFilters}>Clear all filters</button>}
        </div>
      )}

      {/* ── Stats bar ── */}
      <div className={styles.statsBar}>
        {hoveredYear
          ? <><span className={styles.statItem}><strong>{focusYear}</strong></span>
              <span className={styles.statDot} />
              <span className={styles.statItem}><strong>{formatAmount(totalForYear, currency)}</strong> disbursed</span>
              <span className={styles.statDot} /></>
          : null}
        <span className={styles.statItem}><strong>{formatAmount(totalAll, currency)}</strong> total 2020–2023</span>
        {activeFilterCount > 0 && (
          <><span className={styles.statDot} />
          <span className={`${styles.statItem} ${styles.statFiltered}`}>
            {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
          </span></>
        )}
      </div>

      {/* ── Chart ── */}
      <TimelineChart
        series={series}
        totalLine={totalLine}
        currency={currency}
        hoveredYear={hoveredYear}
        onHoverYear={setHoveredYear}
        highlightedSeries={highlightedSeries}
        showTotal={showTotal}
      />

      {/* ── Legend ── */}
      <div className={styles.legendRow}>
        {showTotal && (
          <button
            className={`${styles.legendItem} ${styles.legendBtn} ${highlightedSeries === "__total__" ? styles.legendBtnHighlighted : ""}`}
            onClick={() => setHighlightedSeries((h) => h === "__total__" ? null : "__total__")}
          >
            <span className={styles.legendLine} style={{ background: totalLine.color }} />
            Total
            <span className={styles.legendAmt}>{formatAmountShort(totalLine.total, currency)}</span>
          </button>
        )}
        {series.map((s) => (
          <button key={s.name}
            className={`${styles.legendItem} ${styles.legendBtn} ${highlightedSeries === s.name ? styles.legendBtnHighlighted : ""}`}
            onClick={() => setHighlightedSeries((h) => h === s.name ? null : s.name)}
          >
            <span className={styles.legendDot} style={{ background: s.color }} />
            {s.name}
            <span className={styles.legendAmt}>{formatAmountShort(s.total, currency)}</span>
          </button>
        ))}
        <button className={styles.totalToggle} onClick={() => setShowTotal((v) => !v)}>
          {showTotal ? "Hide" : "Show"} total
        </button>
      </div>

      <p className={styles.sourceNote}>
        Source: OECD Philanthropy Data. Amounts in {currency.code} (indicative rates). Disbursements deflated to 2021 USD then converted.
      </p>
    </div>
  );
}

// ── Timeline SVG chart ────────────────────────────────────────────────────────
function TimelineChart({ series, totalLine, currency, hoveredYear, onHoverYear, highlightedSeries, showTotal }) {
  const W = 840, H = 280;
  const PAD = { top: 24, right: 32, bottom: 40, left: 68 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const svgRef = useRef(null);

  const allLines = showTotal ? [totalLine, ...series] : series;

  const maxAmt = useMemo(() => {
    const vals = allLines.flatMap((s) => s.data.map((d) => d.amount));
    return Math.max(...vals, 0.001);
  }, [allLines]);

  const xPos = (i) => PAD.left + (i / (YEARS.length - 1)) * innerW;
  const yPos = (amt) => PAD.top + innerH - (amt / maxAmt) * innerH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD.top + innerH - f * innerH,
    label: formatAmountShort(maxAmt * f, currency),
  }));

  const focusYear = hoveredYear;
  const focusIdx = focusYear ? YEARS.indexOf(focusYear) : -1;

  const getNearestYearIdx = (clientX) => {
    if (!svgRef.current) return -1;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * W;
    let best = 0, bestDist = Infinity;
    YEARS.forEach((_, i) => {
      const d = Math.abs(xPos(i) - svgX);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  };

  const handleMouseMove = (e) => onHoverYear(YEARS[getNearestYearIdx(e.clientX)]);
  const handleMouseLeave = () => onHoverYear(null);

  const tooltipLines = highlightedSeries
    ? allLines.filter((s) =>
        s.name === highlightedSeries || (s.name === "Total" && highlightedSeries === "__total__")
      )
    : allLines.slice(0, Math.min(allLines.length, 6));

  const tooltipW = 158;
  const tooltipLineH = 17;
  const tooltipH = 22 + tooltipLines.length * tooltipLineH;
  const tooltipX = focusIdx < 2 ? xPos(focusIdx) + 12 : xPos(focusIdx) - tooltipW - 12;
  const tooltipY = PAD.top;

  return (
    <div className={styles.chartWrap}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={styles.timelineSvg}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid + Y-axis labels */}
        {yTicks.map((t) => (
          <g key={t.y}>
            <line x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y}
              stroke="var(--border)" strokeWidth="1" />
            <text x={PAD.left - 8} y={t.y + 4} textAnchor="end"
              fontSize="10" fill="var(--muted)">{t.label}</text>
          </g>
        ))}

        {/* X-axis year labels */}
        {YEARS.map((yr, i) => (
          <text key={yr} x={xPos(i)} y={H - 8} textAnchor="middle"
            fontSize="11"
            fill={yr === focusYear ? "var(--ink)" : "var(--muted)"}
            fontWeight={yr === focusYear ? "600" : "400"}
          >{yr}</text>
        ))}

        {/* Focus year vertical line */}
        {focusIdx >= 0 && (
          <line
            x1={xPos(focusIdx)} x2={xPos(focusIdx)}
            y1={PAD.top} y2={PAD.top + innerH}
            stroke="var(--ink)" strokeWidth="1"
            strokeDasharray="4 3" opacity="0.25"
          />
        )}

        {/* Shaded area under total line */}
        {showTotal && (() => {
          const pts = totalLine.data.map((d, i) => `${xPos(i)},${yPos(d.amount)}`);
          const poly = [
            ...pts,
            `${xPos(YEARS.length - 1)},${yPos(0)}`,
            `${xPos(0)},${yPos(0)}`,
          ].join(" ");
          const isDimmed = highlightedSeries && highlightedSeries !== "__total__";
          return (
            <polygon points={poly}
              fill={totalLine.color}
              opacity={isDimmed ? 0.02 : 0.05}
              style={{ transition: "opacity 0.2s" }}
            />
          );
        })()}

        {/* Series lines */}
        {allLines.map((s) => {
          const isTotal = s.name === "Total";
          const isHighlighted = highlightedSeries === s.name || (isTotal && highlightedSeries === "__total__");
          const isDimmed = highlightedSeries && !isHighlighted;
          const pts = s.data.map((d, i) => `${xPos(i)},${yPos(d.amount)}`).join(" ");
          return (
            <polyline key={s.name}
              points={pts}
              fill="none"
              stroke={s.color}
              strokeWidth={isTotal ? 2 : isHighlighted ? 2.5 : 1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={isTotal ? "7 4" : undefined}
              opacity={isDimmed ? 0.1 : isTotal ? 0.55 : 0.9}
              style={{ transition: "opacity 0.2s, stroke-width 0.15s" }}
            />
          );
        })}

        {/* Dots at focus year */}
        {focusIdx >= 0 && allLines.map((s) => {
          const d = s.data[focusIdx];
          const isTotal = s.name === "Total";
          const isHighlighted = highlightedSeries === s.name || (isTotal && highlightedSeries === "__total__");
          const isDimmed = highlightedSeries && !isHighlighted;
          return (
            <circle key={s.name}
              cx={xPos(focusIdx)} cy={yPos(d.amount)}
              r={isTotal ? 5 : 4}
              fill="var(--paper)"
              stroke={s.color}
              strokeWidth={isTotal ? 2.5 : 2}
              opacity={isDimmed ? 0.15 : 1}
              style={{ transition: "opacity 0.2s" }}
            />
          );
        })}

        {/* Tooltip */}
        {focusIdx >= 0 && tooltipLines.length > 0 && (
          <g>
            <rect
              x={tooltipX} y={tooltipY}
              width={tooltipW} height={tooltipH}
              rx="6" fill="var(--paper)"
              stroke="var(--border)" strokeWidth="1"
            />
            <text x={tooltipX + 10} y={tooltipY + 14}
              fontSize="10" fontWeight="600" fill="var(--ink)">{focusYear}</text>
            {tooltipLines.map((s, i) => {
              const d = s.data[focusIdx];
              const label = s.name.length > 16 ? s.name.slice(0, 15) + "…" : s.name;
              const isTotal = s.name === "Total";
              return (
                <g key={s.name}>
                  {isTotal
                    ? <line
                        x1={tooltipX + 10} x2={tooltipX + 22}
                        y1={tooltipY + 22 + i * tooltipLineH}
                        y2={tooltipY + 22 + i * tooltipLineH}
                        stroke={s.color} strokeWidth="2" strokeDasharray="3 2"
                      />
                    : <circle
                        cx={tooltipX + 16} cy={tooltipY + 21 + i * tooltipLineH}
                        r="3.5" fill={s.color}
                      />
                  }
                  <text x={tooltipX + 28} y={tooltipY + 25 + i * tooltipLineH}
                    fontSize="9.5" fill="var(--ink)">{label}</text>
                  <text x={tooltipX + tooltipW - 8} y={tooltipY + 25 + i * tooltipLineH}
                    fontSize="9.5" fill={s.color} textAnchor="end" fontWeight="500">
                    {formatAmountShort(d.amount, currency)}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
      <p className={styles.chartHint}>Hover to explore year-by-year values</p>
    </div>
  );
}

// ── FilterGroup ───────────────────────────────────────────────────────────────
function FilterGroup({ label, options, selected, onToggle, scrollable }) {
  return (
    <div className={styles.filterGroup}>
      <p className={styles.filterGroupLabel}>{label}</p>
      <div className={`${styles.filterPills} ${scrollable ? styles.filterPillsScroll : ""}`}>
        {options.map((opt) => (
          <button key={opt}
            className={`${styles.filterPill} ${selected.includes(opt) ? styles.filterPillActive : ""}`}
            onClick={() => onToggle(opt)}
          >{opt}</button>
        ))}
      </div>
    </div>
  );
}
