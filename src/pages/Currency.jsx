import { useState, useEffect, useMemo } from "react";
import styles from "./Currency.module.css";

const CURRENCIES = [
  { code: "USD", symbol: "$",   label: "US Dollar",         flag: "🇺🇸", rate: 1 },
  { code: "EUR", symbol: "€",   label: "Euro",              flag: "🇪🇺", rate: 0.92 },
  { code: "GBP", symbol: "£",   label: "British Pound",     flag: "🇬🇧", rate: 0.79 },
  { code: "JPY", symbol: "¥",   label: "Japanese Yen",      flag: "🇯🇵", rate: 149.5 },
  { code: "CNY", symbol: "¥",   label: "Chinese Yuan",      flag: "🇨🇳", rate: 7.24 },
  { code: "KES", symbol: "KSh", label: "Kenyan Shilling",   flag: "🇰🇪", rate: 129.5 },
  { code: "UGX", symbol: "USh", label: "Ugandan Shilling",  flag: "🇺🇬", rate: 3700 },
  { code: "UAH", symbol: "₴",   label: "Ukrainian Hryvnia", flag: "🇺🇦", rate: 41.5 },
];

const YEARS = ["All", "2020", "2021", "2022", "2023"];

const COLUMNS = [
  { key: "org",            label: "Organization",  numeric: false },
  { key: "donorCountry",   label: "Donor",         numeric: false },
  { key: "recipientCountry", label: "Recipient",   numeric: false },
  { key: "sector",         label: "Sector",        numeric: false },
  { key: "year",           label: "Year",          numeric: false },
  { key: "amount",         label: "Amount",        numeric: true  },
];

function fmt(usdMillions, currency) {
  const { symbol, rate } = currency;
  const v = usdMillions * rate;
  if (v >= 1_000_000) return `${symbol}${(v / 1_000_000).toFixed(2)}T`;
  if (v >= 1_000)     return `${symbol}${(v / 1_000).toFixed(2)}B`;
  if (v >= 1)         return `${symbol}${v.toFixed(2)}M`;
  return `${symbol}${(v * 1_000).toFixed(0)}K`;
}

export default function Currency() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [year, setYear]         = useState("All");
  const [sortKey, setSortKey]   = useState("amount");
  const [sortDir, setSortDir]   = useState("desc");

  useEffect(() => {
    fetch("/oecd_data.json").then((r) => r.json()).then((d) => {
      setData(d); setLoading(false);
    });
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "amount" ? "desc" : "asc");
    }
  };

  const rows = useMemo(() => {
    if (!data) return [];
    const filtered = year === "All"
      ? data.records
      : data.records.filter((r) => r.year === year);

    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (sortKey === "amount") return sortDir === "asc" ? av - bv : bv - av;
      const cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, year, sortKey, sortDir]);

  const totalUsd = useMemo(() => rows.reduce((s, r) => s + r.amount, 0), [rows]);

  if (loading) return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>OECD Philanthropy</p>
      <h1 className={styles.title}>Currency</h1>
      <div className={styles.divider} />
      <p className={styles.loading}>Loading dataset…</p>
    </div>
  );

  const { symbol, rate, code, label, flag } = currency;

  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>OECD Philanthropy</p>
      <h1 className={styles.title}>Currency</h1>
      <div className={styles.divider} />
      <p className={styles.subtitle}>
        Browse every transaction and see disbursement amounts in any currency.
      </p>

      {/* ── Controls ── */}
      <div className={styles.controls}>
        <div className={styles.controlsLeft}>
          <span className={styles.controlLabel}>Display currency</span>
          <select
            className={styles.currencySelect}
            value={code}
            onChange={(e) => setCurrency(CURRENCIES.find((c) => c.code === e.target.value))}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <p className={styles.controlLabel} style={{ marginBottom: 6 }}>Year</p>
          <div className={styles.yearPills}>
            {YEARS.map((yr) => (
              <button key={yr}
                className={`${styles.yearPill} ${year === yr ? styles.yearPillActive : ""}`}
                onClick={() => setYear(yr)}
              >{yr}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Exchange rate card ── */}
      <div className={styles.rateCard}>
        <div className={styles.rateMain}>
          <span className={styles.rateLabel}>Exchange rate</span>
          <span className={styles.rateValue}>
            {flag} 1 USD = {rate >= 10 ? rate.toFixed(0) : rate} {code}
          </span>
          <span className={styles.rateSub}>{label}</span>
        </div>
        <div className={styles.rateDivider} />
        <div className={styles.rateInverse}>
          <span className={styles.rateLabel}>Inverse</span>
          <span className={styles.rateValue} style={{ fontSize: "1.3rem" }}>
            {symbol}1 {code} = ${(1 / rate).toFixed(4)} USD
          </span>
          <span className={styles.rateSub}>Indicative rate · amounts deflated to 2021 USD</span>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className={styles.statsBar}>
        <span className={styles.statItem}>
          <strong>{rows.length.toLocaleString()}</strong> transactions
        </span>
        <span className={styles.statDot} />
        <span className={styles.statItem}>
          <strong>{fmt(totalUsd, currency)}</strong> total disbursed
        </span>
        <span className={styles.statDot} />
        <span className={styles.statItem}>
          <strong>${totalUsd.toFixed(0)}M</strong> USD equivalent
        </span>
        {year !== "All" && (
          <><span className={styles.statDot} />
          <span className={styles.statItem}><strong>{year}</strong> only</span></>
        )}
      </div>

      {/* ── Sortable table ── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {COLUMNS.map((col) => {
                const active = sortKey === col.key;
                const indicator = active ? (sortDir === "asc" ? " ↑" : " ↓") : "";
                return (
                  <th key={col.key}
                    className={`${styles.th} ${active ? styles.thActive : ""} ${col.numeric ? styles.thRight : ""}`}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}{indicator}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className={styles.empty}>
                  No transactions match this selection.
                </td>
              </tr>
            ) : rows.map((r, i) => (
              <tr key={i} className={styles.tr}>
                <td className={styles.td} title={r.org}>{r.org || "—"}</td>
                <td className={styles.td}>{r.donorCountry || "—"}</td>
                <td className={styles.td}>{r.recipientCountry || "—"}</td>
                <td className={`${styles.td} ${styles.tdMuted}`} title={r.sector}>{r.sector || "—"}</td>
                <td className={styles.td}>{r.year}</td>
                <td className={`${styles.td} ${styles.tdRight} ${styles.tdAmount}`}>
                  {fmt(r.amount, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.sourceNote}>
        Source: OECD Philanthropy Data. Amounts in {code} converted from millions USD at indicative rates.
      </p>
    </div>
  );
}
