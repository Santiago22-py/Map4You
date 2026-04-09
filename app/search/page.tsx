import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PublicHeader } from "@/components/public-header";
import { getSearchResults } from "@/lib/travel-data";

export const revalidate = 3600;

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const { country, destinations, directDestination, providerConfigured, source } = await getSearchResults(resolvedSearchParams.q);

  if (directDestination) {
    redirect(`/places/${directDestination.slug}?title=${encodeURIComponent(directDestination.title)}&country=${encodeURIComponent(directDestination.countryName)}`);
  }

  return (
    <main className="flex-1 pb-10 md:pb-14">
      <PublicHeader />

      <div className="page-shell pt-8 md:pt-12">
        <div className="flex items-center gap-4 text-brand-navy md:gap-6">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-brand-navy/5"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m14 6-6 6 6 6" />
              <path d="M8.5 12H20" />
            </svg>
          </Link>
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl font-semibold uppercase tracking-[-0.05em] text-brand-navy sm:text-6xl md:text-7xl">
              {country.name}
            </h1>
          </div>

          <form action="/search" method="get" className="hidden items-center gap-3 md:flex">
            <input
              type="search"
              name="q"
              defaultValue={country.name}
              placeholder="Buscar país"
              className="w-64 rounded-full bg-white px-5 py-3 text-brand-ink outline-none ring-1 ring-brand-navy/10 placeholder:text-muted/70"
            />
            <button type="submit" className="rounded-full bg-brand-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-blue">
              Buscar
            </button>
          </form>
        </div>

        <form action="/search" method="get" className="mt-6 flex items-center gap-3 md:hidden">
          <input
            type="search"
            name="q"
            defaultValue={country.name}
            placeholder="Buscar país"
            className="min-w-0 flex-1 rounded-full bg-white px-5 py-3 text-brand-ink outline-none ring-1 ring-brand-navy/10 placeholder:text-muted/70"
          />
          <button type="submit" className="rounded-full bg-brand-navy px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-blue">
            Buscar
          </button>
        </form>

        <section className="mt-10 grid gap-y-12 sm:grid-cols-2 sm:gap-x-8 md:mt-12 md:grid-cols-3 md:gap-y-16 lg:gap-x-14">
          {destinations.map((destination) => (
            destination.available ? (
              <Link
                key={`${destination.slug}-${destination.title}`}
                href={`/places/${destination.slug}?title=${encodeURIComponent(destination.title)}&country=${encodeURIComponent(destination.countryName)}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative aspect-square w-full max-w-[12.5rem] overflow-hidden rounded-[2px] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_rgba(10,48,120,0.18)] sm:max-w-[13rem] md:max-w-[14rem] lg:max-w-[15rem]">
                  {destination.imageUrl ? (
                    <Image
                      src={destination.imageUrl}
                      alt={destination.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 15rem"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-brand-orange/60 via-white to-brand-navy/30" />
                  )}
                </div>
                <h2 className="mt-7 text-2xl font-extrabold uppercase tracking-[-0.03em] text-brand-burnt md:text-[2rem]">
                  {destination.title}
                </h2>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-brand-navy/70">Disponible ahora</p>
              </Link>
            ) : (
              <div key={`${destination.slug}-${destination.title}`} className="flex flex-col items-center text-center opacity-90">
                <div className="relative aspect-square w-full max-w-[12.5rem] overflow-hidden rounded-[2px] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.12)] sm:max-w-[13rem] md:max-w-[14rem] lg:max-w-[15rem]">
                  {destination.imageUrl ? (
                    <Image
                      src={destination.imageUrl}
                      alt={destination.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 15rem"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-brand-orange/60 via-white to-brand-navy/30" />
                  )}
                  <div className="absolute inset-x-3 bottom-3 rounded-full bg-white/92 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-navy shadow-sm">
                    Proximamente
                  </div>
                </div>
                <h2 className="mt-7 text-2xl font-extrabold uppercase tracking-[-0.03em] text-brand-burnt md:text-[2rem]">
                  {destination.title}
                </h2>
              </div>
            )
          ))}
        </section>

        {destinations.length === 0 ? (
          <div className="mt-12 rounded-[2rem] bg-white/80 p-6 text-center ring-1 ring-brand-navy/10">
            <h2 className="font-display text-3xl font-semibold text-brand-navy">Aún no hay ciudades disponibles</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              {`La navegación pública ahora usa un catálogo curado. Prueba con Francia, Italia o España mientras ampliamos el resto de destinos.`}
            </p>
          </div>
        ) : null}

        <p className="mt-8 text-center text-xs uppercase tracking-[0.22em] text-muted/80 md:text-left">
          Fuente: {source}
          {providerConfigured ? "" : " · catálogo local"}
        </p>
      </div>

    </main>
  );
}