import { useState, useEffect } from "react";
import Papa from "papaparse";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQLZ6CPnIEEAcb8ArqU8zg_qTugZjvxNl3ApzmdFC7YJmTorxiu_seydt65qH4MFA/pub?gid=500685901&single=true&output=csv";

// How many rows to load — increase if you need more, but >5000 will be slow
const ROW_LIMIT = 2000;

function normalizeRow(raw) {
  return {
    usd:         parseFloat(raw["usd_disbursements_defl"])     || 0,
    title:       raw["grant_recipient_project_title"]          || "Untitled",
    country:     raw["country"]                                || "Unknown",
    sector:      raw["sector_description"] || raw["Sector"]    || "Other",
    region:      raw["region_macro"]                           || "Unknown",
    year:        parseInt(raw["year"])                         || 0,
    org:         raw["organization_name"]                      || "Unknown",
    description: raw["project_description"]                    || "",
    subsector:   raw["subsector_description"]                  || "",
    sdg:         raw["sdg_focus"]                              || "",
    duration:    raw["expected_duration"]                      || "",
    donor:       raw["Donor_country"]                          || "",
  };
}

export function useFundingData() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [total, setTotal]     = useState(0); // total rows in sheet (for display)

  useEffect(() => {
    fetch(SHEET_URL)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to fetch sheet (${r.status})`);
        return r.text();
      })
      .then(csv => {
        const allLines = csv.split("\n");
        setTotal(allLines.length - 1); // minus header

        // Take header + first ROW_LIMIT data rows only
        const trimmed = [allLines[0], ...allLines.slice(1, ROW_LIMIT + 1)].join("\n");

        const { data: rows, errors } = Papa.parse(trimmed, {
          header: true,
          skipEmptyLines: true,
          trimHeaders: true,
        });

        if (errors.length) console.warn("CSV parse warnings:", errors);

        const normalized = rows.map(normalizeRow).filter(d => d.usd > 0);
        console.log(`Loaded ${normalized.length} of ${allLines.length - 1} rows`);
        setData(normalized);
      })
      .catch(err => {
        console.error("useFundingData error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error, total };
}