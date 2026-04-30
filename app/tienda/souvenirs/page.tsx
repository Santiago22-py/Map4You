import Image from "next/image";
import Link from "next/link";

import { StoreBackLink, StoreCartLink, StorePageShell, StorePanel } from "@/components/store-shell";
import { souvenirCollections } from "@/lib/fake-store";

export default async function StoreSouvenirsPage() {
  const collections = souvenirCollections;

  return (
    <StorePageShell title="Llévate tu viaje a casa con Map4You">
      <StorePanel className="space-y-8 sm:space-y-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <StoreBackLink href="/tienda" label="Volver a tienda" />
          <StoreCartLink />
        </div>

        <div className="space-y-4 text-center">
          <h2 className="font-display text-[2.35rem] font-semibold tracking-[-0.05em] text-brand-navy sm:text-[2.9rem]">Elige tu pack de recuerdos</h2>
          <p className="mx-auto max-w-[48rem] text-[1rem] leading-8 text-black/65">Convierte tus viajes en recuerdos únicos. Cada pack está pensado para distintos tipos de viajero.</p>
        </div>

        <div className="mx-auto h-px w-full max-w-[68rem] bg-black/14" />

        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-3">
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
      </StorePanel>
    </StorePageShell>
  );
}