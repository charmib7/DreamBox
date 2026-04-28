import pandas as pd
import json

print("Reading Excel file...")
df = pd.read_excel("OECD Dataset.xlsx", sheet_name="complete_p4d3_df")

print(f"Raw rows: {len(df)}")

# ── Year ─────────────────────────────────────────────────────────────────────
df["year"] = df["year"].astype(str).str.strip()
valid_years = ["2020", "2021", "2022", "2023"]
before = len(df)
df = df[df["year"].isin(valid_years)].copy()
print(f"Dropped {before - len(df)} rows with invalid/multi-value year (e.g. '2020-2023')")

# ── Disbursements ─────────────────────────────────────────────────────────────
df["usd_disbursements_defl"] = pd.to_numeric(df["usd_disbursements_defl"], errors="coerce")
before = len(df)
df = df[df["usd_disbursements_defl"].notna() & (df["usd_disbursements_defl"] > 0)].copy()
print(f"Dropped {before - len(df)} rows with null or zero disbursements")

# ── Financial instrument — fix case inconsistencies & normalize ───────────────
instrument_map = {
    "shares in collective investment vehicles": "Shares in Collective Investment Vehicles",
    "Shares in collective investment vehicles": "Shares in Collective Investment Vehicles",
    "debt":        "Debt Forgiveness",
    "guarantee":   "Guarantee",
    "Grant; Other": "Grant",
    "Other hybrid instruments": "Other",
}
df["financial_instrument"] = (
    df["financial_instrument"]
    .fillna("Unspecified")
    .astype(str)
    .str.strip()
    .replace(instrument_map)
)

# ── Region — split multi-value rows on semicolons, keep first value ───────────
def first_value(s):
    return str(s).split(";")[0].strip()

df["region_macro"] = df["region_macro"].apply(first_value)

# ── Sector — split multi-value, prefer sector_description over code ───────────
df["Sector"] = df["Sector"].astype(str).apply(first_value)
df["sector_description"] = df["sector_description"].astype(str).apply(first_value)
df["sector_label"] = df["sector_description"].replace({"nan": None, "": None})
df["sector_label"] = df["sector_label"].fillna(df["Sector"])
df["sector_label"] = df["sector_label"].replace({"nan": "Unspecified", "": "Unspecified"})

# ── Fill remaining nulls in group columns ────────────────────────────────────
group_cols = [
    "organization_name",
    "Donor_country",
    "country",
    "region_macro",
    "sector_label",
    "year",
    "type_of_flow",
    "financial_instrument",
]
for c in group_cols:
    df[c] = df[c].fillna("Unspecified").astype(str).str.strip()

print(f"Clean rows going into aggregation: {len(df)}")

# ── Aggregate ─────────────────────────────────────────────────────────────────
agg = (
    df.groupby(group_cols, as_index=False)["usd_disbursements_defl"]
    .sum()
)
agg["usd_disbursements_defl"] = agg["usd_disbursements_defl"].round(2)

print(f"Aggregated rows: {len(agg)}")

# ── Filter option lists (exclude Unspecified from UI options) ─────────────────
def sorted_unique(col):
    return sorted(v for v in agg[col].unique() if v and v not in ("Unspecified", "nan"))

filters = {
    "years":          sorted_unique("year"),
    "regions":        sorted_unique("region_macro"),
    "donorCountries": sorted_unique("Donor_country"),
    "sectors":        sorted_unique("sector_label"),
    "flowTypes":      sorted_unique("type_of_flow"),
    "instruments":    sorted_unique("financial_instrument"),
}

print("\nFilter counts:")
for k, v in filters.items():
    print(f"  {k}: {len(v)}")

# ── Output ────────────────────────────────────────────────────────────────────
records = agg.rename(columns={
    "organization_name":    "org",
    "Donor_country":        "donorCountry",
    "country":              "recipientCountry",
    "region_macro":         "region",
    "sector_label":         "sector",
    "type_of_flow":         "flowType",
    "financial_instrument": "instrument",
    "usd_disbursements_defl": "amount",
}).to_dict(orient="records")

output = {"filters": filters, "records": records}

with open("public/oecd_data.json", "w") as f:
    json.dump(output, f, separators=(",", ":"))

size_mb = len(json.dumps(output)) / 1e6
print(f"\nWritten to public/oecd_data.json ({size_mb:.1f} MB, {len(records)} records)")
