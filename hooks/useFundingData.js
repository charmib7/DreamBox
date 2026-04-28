import { useState, useEffect } from "react";

export function useFundingData() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [total, setTotal]     = useState(0);

  useEffect(() => {
    fetch("/oecd_data.json")
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load data (${r.status})`);
        return r.json();
      })
      .then(({ records }) => {
        const normalized = records.map(r => ({
          usd:     r.amount,
          country: r.recipientCountry || "Unknown",
          sector:  r.sector           || "Other",
          region:  r.region           || "Unknown",
          year:    parseInt(r.year)   || 0,
          org:     r.org              || r.donorCountry || "Unknown",
          donor:   r.donorCountry     || "",
        }));
        setTotal(normalized.length);
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
