import Image from "next/image";
import Link from "next/link";

import { StoreBackLink, StoreCartLink, StorePageShell, StorePanel, StoreSearchForm } from "@/components/store-shell";
import { souvenirCollections } from "@/lib/fake-store";

type StoreSouvenirsPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function StoreSouvenirsPage({ searchParams }: StoreSouvenirsPageProps) {
  const { q = "" } = await searchParams;
  const normalizedQuery = q.trim().toLowerCase();
  const collections = normalizedQuery
    ? souvenirCollections.filter((collection) => collection.name.toLowerCase().includes(normalizedQuery) || collection.summary.toLowerCase().includes(normalizedQuery))
    : souvenirCollections;

  return (
    <StorePageShell title="Llévate tu viaje a casa con Map4You">
      <StorePanel className="space-y-8 sm:space-y-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <StoreBackLink href="/tienda" label="Volver a tienda" />
          <StoreCartLink />
        </div>

        <div className="space-y-5 text-center">
          <h2 className="font-display text-[2.35rem] font-semibold tracking-[-0.05em] text-brand-navy sm:text-[2.9rem]">¿Dónde has viajado?</h2>
          <div className="flex justify-center">
            <StoreSearchForm action="/tienda/souvenirs" defaultValue={q} />
          </div>
        </div>

        <div className="mx-auto h-px w-full max-w-[68rem] bg-black/14" />

        <div className="space-y-5">
          <h3 className="text-balance text-center font-display text-[2rem] font-semibold tracking-[-0.05em] text-brand-navy sm:text-left">Nuestras sugerencias según tus destinos registrados...</h3>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {collections.map((collection) => (
              <Link key={collection.slug} href={`/tienda/souvenirs/${collection.slug}`} className="group flex flex-col gap-4 rounded-[1.5rem] p-4 transition hover:bg-[#f7efe8]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] shadow-[0_10px_20px_rgba(10,48,120,0.12)] ring-1 ring-black/8">
                  <Image src={collection.heroImageUrl} alt={collection.name} fill sizes="(max-width: 1280px) 50vw, 25vw" quality={92} className="object-cover transition duration-300 group-hover:scale-[1.03]" />
                </div>
                <div className="space-y-2">
                  <p className="text-[1.5rem] font-semibold text-brand-blue">{collection.teaser}</p>
                  <p className="text-sm leading-7 text-black/68">{collection.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {collections.length === 0 ? <p className="text-center text-sm text-black/58">No hay colecciones de souvenirs que coincidan con esa búsqueda todavía.</p> : null}
      </StorePanel>
    </StorePageShell>
  );
}