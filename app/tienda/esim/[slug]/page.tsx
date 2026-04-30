import Image from "next/image";
import { notFound } from "next/navigation";

import { StoreAddToCartButton } from "@/components/store-add-to-cart-button";
import { StoreBackLink, StoreCartLink, StorePageShell, StorePanel } from "@/components/store-shell";
import { formatEuro, getEsimPlan } from "@/lib/fake-store";

type StoreEsimDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function StoreEsimDetailPage({ params }: StoreEsimDetailPageProps) {
  const { slug } = await params;
  const plan = getEsimPlan(slug);

  if (!plan) {
    notFound();
  }

  return (
    <StorePageShell title="Consigue tu eSIM con Map4You">
      <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <div className="xl:col-span-2">
          <StoreBackLink href="/tienda/esim" label="Volver a eSIM" />
        </div>

        <section className="rounded-[1.8rem] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.1)] ring-1 ring-black/10 sm:p-8 space-y-7">
          <div className="space-y-5 text-center">
            <h2 className="font-display text-[2.8rem] font-semibold tracking-[-0.06em] text-brand-blue">{plan.title}</h2>
            <div className="mx-auto relative h-52 w-52 overflow-hidden rounded-full shadow-[0_16px_28px_rgba(10,48,120,0.18)] ring-1 ring-black/10">
              <Image src={plan.imageUrl} alt={plan.title} fill sizes="13rem" quality={92} className="object-cover" />
            </div>
          </div>

          <div className="flex justify-center gap-4 flex-wrap text-sm font-semibold uppercase tracking-[0.08em] text-brand-navy/70">
            <span className="rounded-full bg-white px-4 py-2 ring-1 ring-black/8">{plan.dataLabel}</span>
            <span className="rounded-full bg-white px-4 py-2 ring-1 ring-black/8">{plan.durationLabel}</span>
          </div>
        </section>

        <StorePanel className="space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="text-right ml-auto">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-burnt/80">Precio</p>
              <p className="text-[1.7rem] font-semibold text-brand-burnt">{formatEuro(plan.priceEuro)}</p>
            </div>
            <StoreCartLink />
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-7">
              <div>
                <p className="text-[1.45rem] font-semibold text-brand-blue">Descripción</p>
                <p className="mt-2 text-[1rem] leading-8 text-black/78">{plan.blurb}</p>
              </div>

              <div>
                <p className="text-[1.45rem] font-semibold text-brand-ink">¿Qué incluye?</p>
                <ul className="mt-3 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[1rem] leading-7 text-black/72">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[1rem] leading-8 text-black/72"><span className="font-semibold text-brand-blue">Funcionamiento.</span> Compra demo, escaneo QR y panel de uso dentro de la propia app.</p>
              </div>
            </div>

            <aside className="rounded-[1.5rem] bg-[#fbf7f3] p-5 ring-1 ring-black/8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Resumen</p>
              <div className="mt-5 space-y-4 text-sm text-black/72">
                <div className="flex items-center justify-between gap-4">
                  <span>Plan</span>
                  <span className="font-semibold text-brand-navy">{plan.title}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Datos</span>
                  <span className="font-semibold text-brand-navy">{plan.dataLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Duración</span>
                  <span className="font-semibold text-brand-navy">{plan.durationLabel}</span>
                </div>
                <div className="border-t border-black/8 pt-4">
                  <div className="flex items-center justify-between gap-4 text-base font-semibold text-brand-burnt">
                    <span>Total demo</span>
                    <span>{formatEuro(plan.priceEuro)}</span>
                  </div>
                </div>
              </div>

              <StoreAddToCartButton
                item={{
                  id: `esim-${plan.slug}`,
                  type: "esim",
                  title: `eSIM ${plan.title}`,
                  subtitle: `${plan.dataLabel} · ${plan.durationLabel}`,
                  imageUrl: plan.imageUrl,
                  unitPriceEuro: plan.priceEuro,
                  quantity: 1,
                }}
                idleLabel="Comprar"
                addedLabel="eSIM añadida"
                className="mt-8 w-full rounded-[1rem] bg-[linear-gradient(180deg,#ff6f34,#ca4300)] px-6 py-4 text-base font-semibold text-white shadow-[0_16px_30px_rgba(202,67,0,0.28)] transition hover:-translate-y-0.5"
              />
            </aside>
          </div>
        </StorePanel>
      </div>
    </StorePageShell>
  );
}