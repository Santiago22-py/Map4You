import { getWorldCountryByCode } from "@/lib/country-catalog";
import { normalizeTripDestinationKey } from "@/lib/trips";

export type VisitedCityRow = {
  city_key: string;
  city_name: string;
  country_code: string;
  created_at: string;
};

export type VisitedCity = {
  cityKey: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  createdAt: string;
};

export function normalizeVisitedCityName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 120);
}

export function buildVisitedCityKey(cityName: string) {
  return normalizeTripDestinationKey(normalizeVisitedCityName(cityName)).slice(0, 120);
}

export function mapVisitedCity(row: VisitedCityRow): VisitedCity | null {
  const country = getWorldCountryByCode(row.country_code);

  if (!country) {
    return null;
  }

  return {
    cityKey: row.city_key,
    cityName: row.city_name,
    countryCode: row.country_code,
    countryName: country.name,
    createdAt: row.created_at,
  };
}

export function mapVisitedCities(rows: VisitedCityRow[]) {
  return rows.map(mapVisitedCity).filter((city): city is VisitedCity => Boolean(city));
}