import { useState, useEffect, useMemo, useRef } from "react";
import styles from "./Rankings.module.css";

// ── Constants ─────────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", symbol: "$",  label: "US Dollar",        rate: 1 },
  { code: "EUR", symbol: "€",  label: "Euro",             rate: 0.92 },
  { code: "GBP", symbol: "£",  label: "British Pound",    rate: 0.79 },
  { code: "JPY", symbol: "¥",  label: "Japanese Yen",     rate: 149.5 },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar",  rate: 1.36 },
  { code: "AUD", symbol: "A$", label: "Australian Dollar",rate: 1.53 },
  { code: "CHF", symbol: "Fr", label: "Swiss Franc",      rate: 0.90 },
  { code: "CNY", symbol: "¥",  label: "Chinese Yuan",     rate: 7.24 },
];

const CATEGORIES = ["Top Donors", "Top Recipients", "By Sector"];
const COUNTS = [5, 10, 20];
const YEARS = ["2020", "2021", "2022", "2023"];

const COMPARE_COLORS = [
  "#c84b2f", // terracotta
  "#2a6496", // slate blue
  "#3d8b3d", // sage green
  "#8b5e3c", // warm brown
  "#7b4f9e", // muted purple
];

// ── Formatters ────────────────────────────────────────────────────────────────
// n is in millions of USD
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

// ── Data helpers ──────────────────────────────────────────────────────────────
function getEntityKey(r, category) {
  if (category === "Top Donors")
    return r.org && r.org !== "Unspecified" ? r.org : r.donorCountry;
  if (category === "Top Recipients") return r.recipientCountry;
  return r.sector;
}

function computeRankings(records, category) {
  const totals = {}, tags = {};
  for (const r of records) {
    const key = getEntityKey(r, category);
    const tag = category === "Top Donors" ? r.donorCountry
               : category === "Top Recipients" ? r.region
               : r.sector.split(" ")[0];
    if (!key || key === "Unspecified") continue;
    totals[key] = (totals[key] || 0) + r.amount;
    tags[key] = tag;
  }
  const sorted = Object.entries(totals)
    .map(([name, amount]) => ({ name, amount, tag: tags[name] || "" }))
    .sort((a, b) => b.amount - a.amount);
  const max = sorted[0]?.amount || 1;
  return sorted.map((item) => ({ ...item, share: Math.round((item.amount / max) * 100) }));
}

function getEntityBreakdown(records, entityName, category) {
  const totals = {};
  for (const r of records) {
    if (getEntityKey(r, category) !== entityName) continue;
    // Break down by sector for donors/recipients, by region for sectors
    const dim = category === "By Sector" ? r.region : r.sector;
    if (!dim || dim === "Unspecified") continue;
    totals[dim] = (totals[dim] || 0) + r.amount;
  }
  return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 6);
}

function getEntityTrend(records, entityName, category) {
  const totals = Object.fromEntries(YEARS.map((y) => [y, 0]));
  for (const r of records) {
    if (getEntityKey(r, category) !== entityName) continue;
    if (totals[r.year] !== undefined) totals[r.year] += r.amount;
  }
  return YEARS.map((year) => ({ year, amount: totals[year] }));
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Rankings() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Top Donors");
  const [count, setCount]     = useState(10);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedYears,       setSelectedYears]       = useState([]);
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
    setSelectedYears([]); setSelectedRegions([]); setSelectedDonors([]);
    setSelectedSectors([]); setSelectedFlows([]); setSelectedInstruments([]);
  };

  const activeFilterCount =
    selectedYears.length + selectedRegions.length + selectedDonors.length +
    selectedSectors.length + selectedFlows.length + selectedInstruments.length;

  const filteredRecords = useMemo(() => {
    if (!data) return [];
    return data.records.filter((r) => {
      if (selectedYears.length       && !selectedYears.includes(r.year))           return false;
      if (selectedRegions.length     && !selectedRegions.includes(r.region))       return false;
      if (selectedDonors.length      && !selectedDonors.includes(r.donorCountry))  return false;
      if (selectedSectors.length     && !selectedSectors.includes(r.sector))       return false;
      if (selectedFlows.length       && !selectedFlows.includes(r.flowType))       return false;
      if (selectedInstruments.length && !selectedInstruments.includes(r.instrument)) return false;
      return true;
    });
  }, [data, selectedYears, selectedRegions, selectedDonors, selectedSectors, selectedFlows, selectedInstruments]);

  const rankings = useMemo(() => computeRankings(filteredRecords, category), [filteredRecords, category]);
  const rows = rankings.slice(0, count);

  if (loading) return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>OECD Philanthropy</p>
      <h1 className={styles.title}>Rankings</h1>
      <div className={styles.divider} />
      <p className={styles.loading}>Loading dataset…</p>
    </div>
  );

  const { filters } = data;

  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>OECD Philanthropy</p>
      <h1 className={styles.title}>Rankings</h1>
      <div className={styles.divider} />
      <p className={styles.subtitle}>
        Who gives, who receives, and where the money goes — ranked by total disbursements.
      </p>

      {/* ── Controls ── */}
      <div className={styles.controls}>
        <div className={styles.controlsLeft}>
          <div className={styles.categoryTabs}>
            {CATEGORIES.map((cat) => (
              <button key={cat}
                className={`${styles.catTab} ${category === cat ? styles.catTabActive : ""}`}
                onClick={() => setCategory(cat)}
              >{cat}</button>
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
            {COUNTS.map((n) => (
              <button key={n}
                className={`${styles.countPill} ${count === n ? styles.countPillActive : ""}`}
                onClick={() => setCount(n)}
              >Top {n}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {filtersOpen && (
        <div className={styles.filterPanel}>
          <FilterGroup label="Year"         options={filters.years}          selected={selectedYears}       onToggle={(v) => toggleItem(setSelectedYears, selectedYears, v)} />
          <FilterGroup label="Region"       options={filters.regions}        selected={selectedRegions}     onToggle={(v) => toggleItem(setSelectedRegions, selectedRegions, v)} />
          <FilterGroup label="Donor Country" options={filters.donorCountries} selected={selectedDonors}     onToggle={(v) => toggleItem(setSelectedDonors, selectedDonors, v)} scrollable />
          <FilterGroup label="Sector"       options={filters.sectors}        selected={selectedSectors}     onToggle={(v) => toggleItem(setSelectedSectors, selectedSectors, v)} scrollable />
          <FilterGroup label="Flow Type"    options={filters.flowTypes}      selected={selectedFlows}       onToggle={(v) => toggleItem(setSelectedFlows, selectedFlows, v)} />
          <FilterGroup label="Instrument"   options={filters.instruments}    selected={selectedInstruments} onToggle={(v) => toggleItem(setSelectedInstruments, selectedInstruments, v)} scrollable />
          {activeFilterCount > 0 && <button className={styles.clearBtn} onClick={clearFilters}>Clear all filters</button>}
        </div>
      )}

      {/* ── Stats bar ── */}
      <div className={styles.statsBar}>
        <span className={styles.statItem}><strong>{rankings.length.toLocaleString()}</strong> entities</span>
        <span className={styles.statDot} />
        <span className={styles.statItem}><strong>{formatAmount(filteredRecords.reduce((s, r) => s + r.amount, 0), currency)}</strong> total disbursed</span>
        <span className={styles.statDot} />
        <span className={styles.statItem}><strong>{filteredRecords.length.toLocaleString()}</strong> transactions</span>
        {activeFilterCount > 0 && <><span className={styles.statDot} /><span className={`${styles.statItem} ${styles.statFiltered}`}>{activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active</span></>}
      </div>

      {/* ── Ranking list ── */}
      <div className={styles.list}>
        {rows.length === 0
          ? <p className={styles.empty}>No data matches the current filters.</p>
          : rows.map((item, i) => (
            <div key={item.name} className={styles.row} style={{ animationDelay: `${i * 30}ms` }}>
              <span className={`${styles.rank} ${i < 3 ? styles.rankTop : ""}`}>{i + 1}</span>
              <div className={styles.rowCenter}>
                <div className={styles.rowMeta}>
                  <span className={styles.name}>{item.name}</span>
                  {item.tag && item.tag !== item.name && <span className={styles.tag}>{item.tag}</span>}
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${item.share}%` }} />
                </div>
              </div>
              <div className={styles.rowRight}>
                <div className={styles.amount}>{formatAmount(item.amount, currency)}</div>
                <div className={styles.amountSub}>{item.share}% of top</div>
              </div>
            </div>
          ))
        }
      </div>

      {/* ── Compare section ── */}
      <CompareSection
        records={data.records}
        rankings={rankings}
        category={category}
        currency={currency}
        filters={filters}
      />

      <p className={styles.sourceNote}>
        Source: OECD Philanthropy Data. Amounts in {currency.code} (indicative rates). Disbursements deflated to 2021 USD then converted.
      </p>
    </div>
  );
}

// ── Compare section ───────────────────────────────────────────────────────────
function CompareSection({ records, rankings, category, currency, filters }) {
  const [selected, setSelected]       = useState([]);
  const [search, setSearch]           = useState("");
  const [view, setView]               = useState("breakdown");
  const [refineOpen, setRefineOpen]   = useState(false);
  const inputRef = useRef(null);

  // Compare-specific filters (independent of main ranking filters)
  const [cYears,       setCYears]       = useState([]);
  const [cRegions,     setCRegions]     = useState([]);
  const [cFlows,       setCFlows]       = useState([]);
  const [cInstruments, setCInstruments] = useState([]);
  const [cSectors,     setCsectors]     = useState([]);

  const toggleC = (setter, current, val) =>
    setter(current.includes(val) ? current.filter((v) => v !== val) : [...current, val]);

  const cFilterCount = cYears.length + cRegions.length + cFlows.length + cInstruments.length + cSectors.length;

  const clearCFilters = () => { setCYears([]); setCRegions([]); setCFlows([]); setCInstruments([]); setCsectors([]); };

  // Apply compare-specific filters independently of main ranking filters
  const compareRecords = useMemo(() => {
    if (!cFilterCount) return records;
    return records.filter((r) => {
      if (cYears.length       && !cYears.includes(r.year))             return false;
      if (cRegions.length     && !cRegions.includes(r.region))         return false;
      if (cFlows.length       && !cFlows.includes(r.flowType))         return false;
      if (cInstruments.length && !cInstruments.includes(r.instrument)) return false;
      if (cSectors.length     && !cSectors.includes(r.sector))         return false;
      return true;
    });
  }, [records, cYears, cRegions, cFlows, cInstruments, cSectors, cFilterCount]);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return rankings
      .filter((r) => r.name.toLowerCase().includes(q) && !selected.find((s) => s.name === r.name))
      .slice(0, 6);
  }, [search, rankings, selected]);

  const addEntity = (item) => {
    if (selected.length >= 5) return;
    setSelected((prev) => [...prev, { ...item, color: COMPARE_COLORS[prev.length] }]);
    setSearch("");
    inputRef.current?.focus();
  };

  const removeEntity = (name) => setSelected((prev) => {
    const next = prev.filter((s) => s.name !== name);
    return next.map((s, i) => ({ ...s, color: COMPARE_COLORS[i] }));
  });

  const breakdownLabel = category === "By Sector" ? "region" : "sector";

  const entityData = useMemo(() =>
    selected.map((s) => ({
      ...s,
      breakdown: getEntityBreakdown(compareRecords, s.name, category),
      trend:     getEntityTrend(compareRecords, s.name, category),
    })),
  [selected, compareRecords, category]);

  return (
    <div className={styles.compareSection}>
      <div className={styles.compareSectionHeader}>
        <div>
          <h2 className={styles.compareTitle}>Compare</h2>
          <p className={styles.compareSubtitle}>
            Select up to 5 {category === "Top Donors" ? "donors" : category === "Top Recipients" ? "recipients" : "sectors"} to compare side by side.
          </p>
        </div>
        <div className={styles.compareHeaderRight}>
          <button
            className={`${styles.filterToggle} ${refineOpen ? styles.filterToggleOpen : ""}`}
            onClick={() => setRefineOpen((v) => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Refine
            {cFilterCount > 0 && <span className={styles.filterBadge}>{cFilterCount}</span>}
          </button>
          {selected.length > 1 && (
            <div className={styles.viewToggle}>
              <button className={`${styles.viewBtn} ${view === "breakdown" ? styles.viewBtnActive : ""}`} onClick={() => setView("breakdown")}>Breakdown</button>
              <button className={`${styles.viewBtn} ${view === "trend" ? styles.viewBtnActive : ""}`} onClick={() => setView("trend")}>Trend</button>
            </div>
          )}
        </div>
      </div>

      {/* Refine filter panel */}
      {refineOpen && (
        <div className={styles.compareFilterPanel}>
          <FilterGroup label="Year"       options={filters.years}       selected={cYears}       onToggle={(v) => toggleC(setCYears, cYears, v)} />
          <FilterGroup label="Region"     options={filters.regions}     selected={cRegions}     onToggle={(v) => toggleC(setCRegions, cRegions, v)} />
          <FilterGroup label="Sector"     options={filters.sectors}     selected={cSectors}     onToggle={(v) => toggleC(setCsectors, cSectors, v)} scrollable />
          <FilterGroup label="Flow Type"  options={filters.flowTypes}   selected={cFlows}       onToggle={(v) => toggleC(setCFlows, cFlows, v)} />
          <FilterGroup label="Instrument" options={filters.instruments} selected={cInstruments} onToggle={(v) => toggleC(setCInstruments, cInstruments, v)} scrollable />
          {cFilterCount > 0 && (
            <div className={styles.compareFilterFooter}>
              <button className={styles.clearBtn} onClick={clearCFilters}>Clear refine filters</button>
              <span className={styles.compareFilterNote}>{compareRecords.length.toLocaleString()} transactions match</span>
            </div>
          )}
        </div>
      )}

      {/* Entity selector */}
      <div className={styles.entitySelector}>
        <div className={styles.selectedPills}>
          {selected.map((s) => (
            <span key={s.name} className={styles.entityPill} style={{ borderColor: s.color, color: s.color }}>
              <span className={styles.entityPillDot} style={{ background: s.color }} />
              {s.name}
              <button className={styles.entityPillRemove} onClick={() => removeEntity(s.name)} aria-label={`Remove ${s.name}`}>×</button>
            </span>
          ))}
          {selected.length < 5 && (
            <div className={styles.searchWrap}>
              <input
                ref={inputRef}
                className={styles.searchInput}
                placeholder={selected.length === 0 ? "Search to add an entity…" : "Add another…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {suggestions.length > 0 && (
                <div className={styles.suggestions}>
                  {suggestions.map((s) => (
                    <button key={s.name} className={styles.suggestionItem} onClick={() => addEntity(s)}>
                      <span className={styles.suggestionName}>{s.name}</span>
                      <span className={styles.suggestionAmt}>{formatAmount(s.amount, currency)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      {selected.length > 1 && (
        <div className={styles.compareCharts}>
          {view === "breakdown"
            ? <BreakdownChart entities={entityData} currency={currency} label={breakdownLabel} />
            : <TrendChart entities={entityData} currency={currency} />
          }
        </div>
      )}

      {selected.length === 1 && (
        <p className={styles.compareHint}>Add at least one more entity to compare.</p>
      )}
    </div>
  );
}

// ── Breakdown chart ───────────────────────────────────────────────────────────
function BreakdownChart({ entities, currency, label }) {
  // Collect all dimension keys across entities, sorted by combined total
  const allDims = useMemo(() => {
    const totals = {};
    entities.forEach((e) => e.breakdown.forEach(([dim, amt]) => { totals[dim] = (totals[dim] || 0) + amt; }));
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([dim]) => dim);
  }, [entities]);

  // Max amount across all entities and all dims for scale
  const maxAmt = useMemo(() => {
    let m = 0;
    entities.forEach((e) => e.breakdown.forEach(([, amt]) => { if (amt > m) m = amt; }));
    return m || 1;
  }, [entities]);

  return (
    <div className={styles.breakdownChart}>
      <p className={styles.chartCaption}>Funding by {label} — top 6</p>
      <div className={styles.breakdownDims}>
        {allDims.map((dim) => (
          <div key={dim} className={styles.breakdownRow}>
            <span className={styles.breakdownDimLabel}>{dim}</span>
            <div className={styles.breakdownBars}>
              {entities.map((e) => {
                const entry = e.breakdown.find(([d]) => d === dim);
                const amt = entry ? entry[1] : 0;
                const pct = (amt / maxAmt) * 100;
                return (
                  <div key={e.name} className={styles.breakdownBarWrap} title={`${e.name}: ${formatAmount(amt, currency)}`}>
                    <div className={styles.breakdownBar} style={{ width: `${pct}%`, background: e.color }} />
                    <span className={styles.breakdownBarLabel} style={{ color: e.color }}>
                      {amt > 0 ? formatAmountShort(amt, currency) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className={styles.chartLegend}>
        {entities.map((e) => (
          <span key={e.name} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: e.color }} />
            {e.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Trend chart (SVG line chart) ──────────────────────────────────────────────
function TrendChart({ entities, currency }) {
  const W = 720, H = 200, PAD = { top: 16, right: 24, bottom: 32, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const allAmounts = entities.flatMap((e) => e.trend.map((d) => d.amount));
  const maxAmt = Math.max(...allAmounts, 0.001);

  const xPos = (i) => PAD.left + (i / (YEARS.length - 1)) * innerW;
  const yPos = (amt) => PAD.top + innerH - (amt / maxAmt) * innerH;

  // Y axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD.top + innerH - f * innerH,
    label: formatAmountShort(maxAmt * f, currency),
  }));

  return (
    <div className={styles.trendChart}>
      <p className={styles.chartCaption}>Funding trend 2020–2023</p>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.trendSvg}>
        {/* Grid lines */}
        {yTicks.map((t) => (
          <g key={t.y}>
            <line x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y} stroke="var(--border)" strokeWidth="1" />
            <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill="var(--muted)">{t.label}</text>
          </g>
        ))}
        {/* X axis labels */}
        {YEARS.map((yr, i) => (
          <text key={yr} x={xPos(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--muted)">{yr}</text>
        ))}
        {/* Lines and dots per entity */}
        {entities.map((e) => {
          const pts = e.trend.map((d, i) => `${xPos(i)},${yPos(d.amount)}`).join(" ");
          return (
            <g key={e.name}>
              <polyline points={pts} fill="none" stroke={e.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {e.trend.map((d, i) => (
                <g key={i}>
                  <circle cx={xPos(i)} cy={yPos(d.amount)} r="5" fill="var(--paper)" stroke={e.color} strokeWidth="2.5" />
                  <title>{e.name} {d.year}: {formatAmountShort(d.amount, currency)}</title>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div className={styles.chartLegend}>
        {entities.map((e) => (
          <span key={e.name} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: e.color }} />
            {e.name}
          </span>
        ))}
      </div>
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
