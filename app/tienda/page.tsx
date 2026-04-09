import Image from "next/image";
import Link from "next/link";

import { StorePageShell } from "@/components/store-shell";
import { storeFeatureCards } from "@/lib/fake-store";

export default function StoreHubPage() {
  return (
    <StorePageShell title="Prepara tu viaje con Map4You">
      <section className="grid gap-6 lg:grid-cols-3">
        {storeFeatureCards.map((card) => (
          <article key={card.title} className="flex h-full flex-col gap-5">
            <div className="flex h-full flex-col overflow-hidden rounded-[1.8rem] bg-white shadow-[0_12px_28px_rgba(0,0,0,0.1)] ring-1 ring-black/10">
              {card.imageUrl ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image src={card.imageUrl} alt={card.title} fill sizes="(max-width: 1024px) 100vw, 33vw" quality={92} priority={card.title === "Planes de suscripción"} className="object-cover" />
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(95,138,230,0.18),transparent_48%),linear-gradient(140deg,rgba(255,255,255,0.96),rgba(241,244,251,0.98))] p-8">
                  <Image src="/icons/store.svg" alt="" width={72} height={64} className="h-auto w-16 opacity-75" />
                </div>
              )}

              <div className="flex min-h-[17.75rem] flex-1 flex-col px-7 py-6">
                <h2 className="font-display text-[2rem] font-semibold tracking-[-0.05em] text-brand-navy">{card.title}</h2>
                <p className="mt-4 max-w-[28rem] flex-1 text-[1rem] leading-8 text-black/78">{card.description}</p>
                <div className="mt-4 min-h-[4rem]">
                  {card.tagline ? <p className="text-center text-[1rem] font-semibold leading-8 text-brand-ink">{card.tagline}</p> : null}
                </div>
              </div>
            </div>

            <Link href={card.href} className="rounded-[1.15rem] bg-[linear-gradient(180deg,#86adf8,#4f79d4)] px-6 py-4 text-center text-[1rem] font-semibold text-white shadow-[0_14px_24px_rgba(79,121,212,0.3)] transition hover:-translate-y-0.5">
              {card.cta}
            </Link>
          </article>
        ))}
      </section>
    </StorePageShell>
  );
}