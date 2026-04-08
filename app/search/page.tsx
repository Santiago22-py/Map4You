import Link from "next/link";

import { countries, findCountryByQuery, normalizeSearchQuery } from "@/lib/public-data";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = normalizeSearchQuery(resolvedSearchParams.q);
  const selectedCountry = findCountryByQuery(resolvedSearchParams.q);

  return (
    <main className="flex-1 py-6 md:py-10">
      <div className="page-shell flex flex-col gap-8">
        <header className="soft-panel rounded-[2rem] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-orange">
                Back to landing
              </Link>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-brand-ink sm:text-5xl">
                Popular places in {selectedCountry.name}
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
                {selectedCountry.teaser} This page is already structured like the eventual anonymous discovery flow: search a country, scan its popular places, and open a detail page.
              </p>
            </div>

            <form action="/search" method="get" className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="country-search">
                Search country
              </label>
              <input
                id="country-search"
                type="search"
                name="q"
                defaultValue={query || selectedCountry.slug}
                placeholder="Try France, Italy or Spain"
                className="min-w-0 flex-1 rounded-full bg-white px-5 py-3.5 text-brand-ink outline-none ring-1 ring-brand-navy/10 placeholder:text-muted/70"
              />
              <button
                type="submit"
                className="rounded-full bg-brand-navy px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-blue"
              >
                Search
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {countries.map((country) => {
            const isActive = country.slug === selectedCountry.slug;

            return (
              <Link
                key={country.slug}
                href={`/search?q=${country.slug}`}
                className={`rounded-[1.75rem] border p-5 transition ${
                  isActive
                    ? "border-brand-orange bg-white shadow-lg shadow-brand-orange/10"
                    : "border-brand-navy/10 bg-white/75 hover:border-brand-navy/25"
                }`}
              >
                <div className="font-display text-2xl font-semibold text-brand-navy">{country.name}</div>
                <p className="mt-2 text-sm leading-6 text-muted">{country.teaser}</p>
              </Link>
            );
          })}
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {selectedCountry.places.map((place, index) => (
            <article
              key={place.slug}
              className="hero-card min-h-80 p-5 text-white"
              style={{
                background:
                  index % 3 === 0
                    ? "linear-gradient(160deg, rgba(255,100,47,0.9), rgba(10,48,120,0.75))"
                    : index % 3 === 1
                      ? "linear-gradient(145deg, rgba(10,48,120,0.92), rgba(67,113,201,0.68))"
                      : "linear-gradient(145deg, rgba(3,18,42,0.9), rgba(255,100,47,0.78), rgba(255,214,147,0.55))",
              }}
            >
              <div className="flex h-full flex-col justify-between">
                <div className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur-sm w-fit">
                  {selectedCountry.name}
                </div>

                <div>
                  <h2 className="font-display text-3xl font-semibold">{place.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/85">{place.summary}</p>
                  <p className="mt-2 text-sm font-semibold text-white/90">{place.vibe}</p>

                  <Link
                    href={`/places/${place.slug}`}
                    className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-navy transition hover:bg-brand-orange hover:text-white"
                  >
                    Open destination
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}