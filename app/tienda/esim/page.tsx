import Image from "next/image";
import Link from "next/link";

import { StoreBackLink, StoreCartLink, StorePageShell, StorePanel, StoreSearchForm } from "@/components/store-shell";
import { esimDestinations } from "@/lib/fake-store";

type StoreEsimPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function StoreEsimPage({ searchParams }: StoreEsimPageProps) {
  const { q = "" } = await searchParams;
  const normalizedQuery = q.trim().toLowerCase();
  const destinations = normalizedQuery
    ? esimDestinations.filter((destination) => destination.name.toLowerCase().includes(normalizedQuery))
    : esimDestinations;

  return (
    <StorePageShell title="Consigue tu eSIM con Map4You">
      <StorePanel className="space-y-8 sm:space-y-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <StoreBackLink href="/tienda" label="Volver a tienda" />
          <StoreCartLink />
        </div>

        <div className="space-y-5 text-center">
          <h2 className="font-display text-[2.35rem] font-semibold tracking-[-0.05em] text-brand-navy sm:text-[2.9rem]">¿Dónde vas a viajar?</h2>
          <div className="flex justify-center">
            <StoreSearchForm action="/tienda/esim" defaultValue={q} />
          </div>
        </div>

        <div className="mx-auto h-px w-full max-w-[68rem] bg-black/14" />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {destinations.map((destination) => (
            <Link key={destination.slug} href={`/tienda/esim/${destination.slug}`} className="group flex flex-col items-center gap-4 rounded-[1.5rem] px-4 py-5 text-center transition hover:bg-[#f7efe8]">
              <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-[0_10px_20px_rgba(10,48,120,0.16)] ring-1 ring-black/8 transition group-hover:-translate-y-1">
                <Image src={destination.imageUrl} alt={destination.name} fill sizes="7rem" quality={92} className="object-cover" />
              </div>
              <div className="space-y-1">
                <p className="text-[1.45rem] font-semibold text-brand-blue">{destination.name}</p>
                <p className="text-sm leading-6 text-black/65">{destination.blurb}</p>
              </div>
            </Link>
          ))}
        </div>

        {destinations.length === 0 ? <p className="text-center text-sm text-black/58">No hay destinos eSIM que coincidan con esa búsqueda todavía.</p> : null}
      </StorePanel>
    </StorePageShell>
  );
}