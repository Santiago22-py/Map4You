import Image from "next/image";
import Link from "next/link";

import { StoreBackLink, StoreCartLink, StorePageShell, StorePanel } from "@/components/store-shell";
import { esimPlans, formatEuro } from "@/lib/fake-store";

export default async function StoreEsimPage() {
  return (
    <StorePageShell title="Consigue tu eSIM con Map4You">
      <StorePanel className="space-y-8 sm:space-y-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <StoreBackLink href="/tienda" label="Volver a tienda" />
          <StoreCartLink />
        </div>

        <div className="space-y-4 text-center">
          <h2 className="font-display text-[2.35rem] font-semibold tracking-[-0.05em] text-brand-navy sm:text-[2.9rem]">Elige tu plan de conectividad</h2>
          <p className="mx-auto max-w-[48rem] text-[1rem] leading-8 text-black/65">Conéctate desde el primer minuto en tu destino. Sin tarjeta física, sin permanencia y con activación mediante código QR.</p>
        </div>

        <div className="mx-auto h-px w-full max-w-[68rem] bg-black/14" />

        <div className="grid gap-5 sm:grid-cols-3">
          {esimPlans.map((plan) => (
            <Link key={plan.slug} href={`/tienda/esim/${plan.slug}`} className="group flex flex-col items-center gap-4 rounded-[1.5rem] px-4 py-6 text-center transition hover:bg-[#f7efe8]">
              <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-[0_10px_20px_rgba(10,48,120,0.16)] ring-1 ring-black/8 transition group-hover:-translate-y-1">
                <Image src={plan.imageUrl} alt={plan.title} fill sizes="7rem" quality={92} className="object-cover" />
              </div>
              <div className="space-y-1">
                <p className="text-[1.45rem] font-semibold text-brand-blue">{plan.title}</p>
                <p className="text-sm font-semibold text-brand-burnt">{formatEuro(plan.priceEuro)}</p>
                <p className="mt-1 text-sm leading-6 text-black/65">{plan.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </StorePanel>
    </StorePageShell>
  );
}