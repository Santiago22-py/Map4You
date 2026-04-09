import { getWorldCountryByCode, type WorldCountryOption } from "@/lib/country-catalog";

export type VisitedCountryRow = {
  country_code: string;
  created_at: string;
};

export type VisitedCountry = WorldCountryOption & {
  createdAt: string;
};

export function mapVisitedCountry(row: VisitedCountryRow): VisitedCountry | null {
  const country = getWorldCountryByCode(row.country_code);

  if (!country) {
    return null;
  }

  return {
    ...country,
    createdAt: row.created_at,
  };
}

export function mapVisitedCountries(rows: VisitedCountryRow[]) {
  return rows
    .map(mapVisitedCountry)
    .filter((country): country is VisitedCountry => Boolean(country));
}