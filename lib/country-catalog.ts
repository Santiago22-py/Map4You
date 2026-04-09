import worldCountries, { type Country as WorldCountry } from "world-countries";

import { normalizeSearchQuery } from "@/lib/public-data";

export type WorldCountryOption = {
  code: string;
  englishName: string;
  flag: string;
  name: string;
  numericCode: string;
  searchTerms: string[];
  slug: string;
};

function getCountryDisplayName(country: WorldCountry) {
  return country.translations.spa?.common ?? country.name.common;
}

function slugifyCountryName(value: string) {
  return normalizeSearchQuery(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCountrySearchTerms(country: WorldCountry) {
  const candidates = [
    country.cca2,
    country.cca3,
    country.ccn3,
    country.name.common,
    country.name.official,
    country.translations.spa?.common,
    country.translations.spa?.official,
    ...country.altSpellings,
  ];

  return Array.from(new Set(candidates.map((value) => normalizeSearchQuery(value)).filter(Boolean)));
}

function mapWorldCountry(country: WorldCountry): WorldCountryOption | null {
  if (!country.cca2 || !country.ccn3 || country.cca2 === "AQ" || country.status !== "officially-assigned") {
    return null;
  }

  const name = getCountryDisplayName(country);

  return {
    code: country.cca2,
    englishName: country.name.common,
    flag: country.flag,
    name,
    numericCode: String(Number(country.ccn3)),
    searchTerms: getCountrySearchTerms(country),
    slug: slugifyCountryName(name),
  };
}

export const worldCountryCatalog = worldCountries
  .map(mapWorldCountry)
  .filter((country): country is WorldCountryOption => Boolean(country))
  .sort((left, right) => left.name.localeCompare(right.name, "es"));

const worldCountriesByCode = new Map(worldCountryCatalog.map((country) => [country.code, country]));
const worldCountriesByNumericCode = new Map(worldCountryCatalog.map((country) => [country.numericCode, country]));

export function getWorldCountryByCode(code: string) {
  return worldCountriesByCode.get(code.toUpperCase()) ?? null;
}

export function getWorldCountryByNumericCode(numericCode: string | number) {
  return worldCountriesByNumericCode.get(String(Number(numericCode))) ?? null;
}

export function searchWorldCountries(query: string, limit = 12) {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return worldCountryCatalog.slice(0, limit);
  }

  return worldCountryCatalog.filter((country) => country.searchTerms.some((term) => term.includes(normalizedQuery))).slice(0, limit);
}