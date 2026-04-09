"use client";

import { geoEqualEarth, geoPath } from "d3-geo";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getWorldCountryByNumericCode, searchWorldCountries, type WorldCountryOption } from "@/lib/country-catalog";
import { type UserProfile } from "@/lib/user-profiles";
import { type VisitedCountry } from "@/lib/visited-countries";

type AtlasGeometry = {
  id?: string | number;
  properties?: {
    name?: string;
  };
};

type AtlasTopology = {
  objects: {
    countries: {
      geometries: AtlasGeometry[];
    };
  };
};

type MapShape = {
  code: string | null;
  id: string;
  key: string;
  label: string;
  path: string;
};

const atlasTopology = worldAtlas as AtlasTopology;
const countryFeatureCollection = feature(atlasTopology as never, atlasTopology.objects.countries as never) as unknown as {
  features: Array<{ id?: string | number; properties?: { name?: string } }>;
};
const mapProjection = geoEqualEarth().fitSize([980, 520], countryFeatureCollection as never);
const mapPath = geoPath(mapProjection);
const mapShapes: MapShape[] = countryFeatureCollection.features
  .map((shape, index) => {
    const id = String(shape.id ?? "");
    const country = getWorldCountryByNumericCode(id);
    const path = mapPath(shape as never);

    if (!path) {
      return null;
    }

    return {
      code: country?.code ?? null,
      id,
      key: `${country?.code ?? "shape"}-${id || "unknown"}-${index}`,
      label: country?.name ?? shape.properties?.name ?? "País",
      path,
    };
  })
  .filter((shape): shape is MapShape => Boolean(shape));

function getCountLabel(count: number) {
  return `${count} ${count === 1 ? "país visitado" : "países visitados"}`;
}

export function VisitedCountriesMap({
  initialVisitedCountries,
  profile,
  profileHref,
  readOnly = false,
}: {
  initialVisitedCountries: VisitedCountry[];
  profile: UserProfile;
  profileHref?: string;
  readOnly?: boolean;
}) {
  const [visitedCountries, setVisitedCountries] = useState(initialVisitedCountries);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [savingCode, setSavingCode] = useState<string | null>(null);

  const visitedCodeSet = useMemo(() => new Set(visitedCountries.map((country) => country.code)), [visitedCountries]);
  const filteredCountries = useMemo(() => searchWorldCountries(query, 16), [query]);
  const selectedCountries = useMemo(() => [...visitedCountries].sort((left, right) => left.name.localeCompare(right.name, "es")), [visitedCountries]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchOpen]);

  async function toggleCountry(country: WorldCountryOption) {
    if (readOnly) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setError("Faltan las credenciales públicas de Supabase.");
      return;
    }

    const wasVisited = visitedCodeSet.has(country.code);
    const optimisticCountries = wasVisited
      ? visitedCountries.filter((item) => item.code !== country.code)
      : [...visitedCountries, { ...country, createdAt: new Date().toISOString() }];

    setError(null);
    setSavingCode(country.code);
    setVisitedCountries(optimisticCountries);

    try {
      if (wasVisited) {
        const { error: deleteError } = await supabase
          .from("visited_countries")
          .delete()
          .eq("user_id", profile.userId)
          .eq("country_code", country.code);

        if (deleteError) {
          throw deleteError;
        }
      } else {
        const { error: insertError } = await supabase.from("visited_countries").insert({
          country_code: country.code,
          user_id: profile.userId,
        });

        if (insertError) {
          throw insertError;
        }
      }

    } catch (caughtError) {
      setVisitedCountries(visitedCountries);
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo guardar el país visitado.");
    } finally {
      setSavingCode(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_22rem]">
      <section className="rounded-[1.8rem] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/8 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-navy/60">Mapa interactivo</p>
            <h1 className="mt-2 font-display text-[2.3rem] font-semibold uppercase tracking-[-0.05em] text-brand-burnt sm:text-[2.9rem]">{readOnly ? `Países visitados de ${profile.displayName}` : "Tus países visitados"}</h1>
            <p className="mt-3 max-w-[38rem] text-[1.02rem] leading-7 text-black/75">
              {readOnly
                ? "Este mapa muestra los países que esta persona ha marcado en su perfil. Aquí solo puedes consultarlos."
                : "Haz clic sobre cualquier país del mapa o búscalo desde el selector. Los países marcados se guardan en tu perfil y el contador se actualiza automáticamente."}
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-3">
            {!readOnly ? (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="rounded-[1.2rem] border border-brand-navy/12 bg-white px-5 py-4 text-left transition hover:-translate-y-0.5 hover:bg-[#f7f2ed]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Selector</p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-brand-burnt">Buscar país</p>
              </button>
            ) : null}

            <div className="rounded-[1.2rem] bg-[#f4fbfb] px-5 py-4 ring-1 ring-[#bee9e7]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Resumen</p>
              <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-brand-navy">{selectedCountries.length}</p>
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-navy/70">{getCountLabel(selectedCountries.length)}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.6rem] bg-[radial-gradient(circle_at_top,#eef3f7,transparent_58%),linear-gradient(180deg,#dde4ea,#cfd7de)] p-3 sm:p-5">
          <svg viewBox="0 0 980 520" className="h-auto w-full">
            {mapShapes.map((shape) => {
              const isInteractive = Boolean(shape.code);
              const isSelected = shape.code ? visitedCodeSet.has(shape.code) : false;

              return (
                <path
                  key={shape.key}
                  d={shape.path}
                  fill={isSelected ? "#30d5d2" : "#bcc6cf"}
                  stroke="#f8fbfd"
                  strokeWidth={0.8}
                  className={isInteractive && !readOnly ? "cursor-pointer transition-[fill] duration-150 hover:fill-[#7ce6e4] focus:fill-[#7ce6e4] focus:outline-none" : "opacity-90"}
                  aria-label={shape.label}
                  aria-pressed={isSelected}
                  role={isInteractive && !readOnly ? "button" : undefined}
                  tabIndex={isInteractive && !readOnly ? 0 : -1}
                  onClick={isInteractive && shape.code && !readOnly ? () => void toggleCountry(getWorldCountryByNumericCode(shape.id)!) : undefined}
                  onKeyDown={
                    isInteractive && shape.code && !readOnly
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            void toggleCountry(getWorldCountryByNumericCode(shape.id)!);
                          }
                        }
                      : undefined
                  }
                >
                  <title>{shape.label}</title>
                </path>
              );
            })}
          </svg>
        </div>

        {error ? <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      </section>

      <aside className="space-y-6">
        <section className="rounded-[1.8rem] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-navy/55">Perfil</p>
              <h2 className="mt-1 font-display text-[1.6rem] font-semibold tracking-[-0.05em] text-brand-navy">@{profile.username}</h2>
            </div>
            <Link href={profileHref ?? "/profile"} className="rounded-full border border-black/10 bg-[#fbf7f3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-brand-burnt transition hover:bg-[#f5ece3]">
              Ver perfil
            </Link>
          </div>

          <p className="mt-4 text-sm leading-7 text-black/75">{readOnly ? "Este mapa es de solo lectura y refleja el mismo contador visible en el perfil público." : "Los cambios aquí se reflejan en el contador de países visitados de tu perfil público y privado."}</p>
        </section>

        <section className="rounded-[1.8rem] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-[1.7rem] font-semibold tracking-[-0.05em] text-brand-burnt">Seleccionados</h2>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-navy/55">{getCountLabel(selectedCountries.length)}</p>
          </div>

          {selectedCountries.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={readOnly ? undefined : () => void toggleCountry(country)}
                  className={`rounded-full bg-[#eff5f8] px-4 py-2 text-sm font-semibold text-brand-navy ring-1 ring-black/6 ${readOnly ? "cursor-default" : "transition hover:-translate-y-0.5"}`}
                >
                  {country.flag} {country.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-black/70">{readOnly ? "Todavía no ha marcado ningún país en este mapa." : "Todavía no has marcado ningún país. Empieza tocando el mapa o usando el buscador."}</p>
          )}
        </section>

      </aside>

      {searchOpen && !readOnly ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#d8a989]/50 px-4 py-8 backdrop-blur-[6px]" onClick={() => setSearchOpen(false)}>
          <section className="relative w-full max-w-[42rem] rounded-[1.9rem] bg-white px-6 py-6 shadow-[0_18px_42px_rgba(0,0,0,0.16)] ring-1 ring-black/8 sm:px-8 sm:py-8" aria-modal="true" role="dialog" onClick={(event) => event.stopPropagation()}>
            <button type="button" aria-label="Cerrar buscador" onClick={() => setSearchOpen(false)} className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-black/5">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Selector</p>
            <h2 className="mt-2 font-display text-[2rem] font-semibold tracking-[-0.05em] text-brand-burnt">Buscar país</h2>
            <p className="mt-3 max-w-[30rem] text-sm leading-7 text-black/72">Añade o quita países sin tener que buscarlos en el mapa. Este selector usa el mismo estado que el mapa y el contador.</p>

            <label htmlFor="country-search" className="sr-only">
              Buscar país
            </label>
            <input
              id="country-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Escribe un país"
              className="mt-5 w-full rounded-[1rem] border border-black/12 bg-[#fbf7f3] px-4 py-3 text-base text-brand-ink outline-none transition focus:border-brand-navy/35"
              autoFocus
            />

            <div className="mt-5 grid max-h-[25rem] gap-2 overflow-y-auto pr-1">
              {filteredCountries.map((country) => {
                const isSelected = visitedCodeSet.has(country.code);
                const isBusy = savingCode === country.code;

                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => void toggleCountry(country)}
                    disabled={isBusy}
                    className={`flex items-center justify-between rounded-[1rem] px-4 py-3 text-left transition ${isSelected ? "bg-[#dff8f7] text-brand-navy ring-1 ring-[#9ce3e0]" : "bg-[#fbf7f3] text-black/80 ring-1 ring-black/6 hover:bg-[#f1ece6]"} disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="text-xl">{country.flag}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold uppercase tracking-[0.05em]">{country.name}</span>
                        <span className="block truncate text-xs text-black/55">{country.englishName}</span>
                      </span>
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em]">{isBusy ? "Guardando" : isSelected ? "Quitar" : "Añadir"}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}