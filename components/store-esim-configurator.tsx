"use client";

import Image from "next/image";
import { useState } from "react";

import { StoreAddToCartButton } from "@/components/store-add-to-cart-button";
import { StoreCartLink } from "@/components/store-cart-link";
import { esimPlans, formatEuro, type EsimDestination, type EsimPlan } from "@/lib/fake-store";

type StoreEsimConfiguratorProps = {
  destination: EsimDestination;
  initialPlanId: EsimPlan["id"];
};

export function StoreEsimConfigurator({ destination, initialPlanId }: StoreEsimConfiguratorProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<EsimPlan["id"]>(initialPlanId);
  const selectedPlan = esimPlans.find((p) => p.id === selectedPlanId) ?? esimPlans[1];

  return (
    <>
      <section className="rounded-[1.8rem] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.1)] ring-1 ring-black/10 sm:p-8 space-y-7">
        <div className="space-y-5 text-center">
          <h2 className="font-display text-[2.8rem] font-semibold tracking-[-0.06em] text-brand-blue">{destination.name}</h2>
          <div className="mx-auto relative h-52 w-52 overflow-hidden rounded-full shadow-[0_16px_28px_rgba(10,48,120,0.18)] ring-1 ring-black/10">
            <Image src={destination.imageUrl} alt={destination.name} fill sizes="13rem" quality={92} className="object-cover" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-black/55">Elige tu plan</p>
          <div className="grid gap-3">
            {esimPlans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`flex items-center justify-between gap-4 rounded-[1rem] border px-5 py-4 text-left transition ${isSelected ? "border-brand-orange bg-[#fff6f1] ring-2 ring-brand-orange/20" : "border-black/12 bg-white hover:border-brand-orange/50"}`}
                >
                  <div className="space-y-0.5">
                    <p className={`text-base font-semibold ${isSelected ? "text-brand-burnt" : "text-brand-ink"}`}>{plan.name}</p>
                    <p className="text-sm text-black/60">{plan.duration} · {plan.data}</p>
                  </div>
                  <p className={`shrink-0 text-[1.3rem] font-semibold ${isSelected ? "text-brand-burnt" : "text-brand-navy"}`}>{formatEuro(plan.priceEuro)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.1)] ring-1 ring-black/10 sm:p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <form action="/tienda/esim" method="get" className="flex w-full max-w-[28rem] flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="store-esim-query" className="sr-only">
              Buscar destino
            </label>
            <input
              id="store-esim-query"
              type="search"
              name="q"
              placeholder="Escribir destino"
              className="min-w-0 flex-1 rounded-full border border-black/35 bg-white px-5 py-3 text-base text-brand-ink outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/12"
            />
            <button type="submit" className="rounded-full bg-[linear-gradient(180deg,#5f8ae6,#244a9a)] px-7 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(36,74,154,0.24)] transition hover:-translate-y-0.5">
              Buscar
            </button>
          </form>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-burnt/80">Total</p>
              <p className="text-[1.7rem] font-semibold text-brand-burnt">{formatEuro(selectedPlan.priceEuro)}</p>
            </div>
            <StoreCartLink />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-7">
            <div>
              <p className="text-[1.45rem] font-semibold text-brand-blue">Características eSIM</p>
              <p className="mt-2 text-[1rem] leading-8 text-black/78">{destination.coverage}</p>
            </div>

            <div>
              <p className="text-[1.45rem] font-semibold text-brand-ink">{selectedPlan.name}</p>
              <p className="mt-2 text-[1rem] leading-8 text-black/72">{selectedPlan.description}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold uppercase tracking-[0.08em] text-brand-navy/70">
                <span className="rounded-full bg-white px-4 py-2 ring-1 ring-black/8">{selectedPlan.data}</span>
                <span className="rounded-full bg-white px-4 py-2 ring-1 ring-black/8">{selectedPlan.duration}</span>
                <span className="rounded-full bg-white px-4 py-2 ring-1 ring-black/8">{formatEuro(selectedPlan.priceEuro)}</span>
              </div>
            </div>

            <div>
              <p className="text-[1.45rem] font-semibold text-brand-blue">Información de interés</p>
              <p className="mt-2 text-[1rem] leading-8 text-black/78">{destination.infoNote}</p>
              <p className="mt-4 text-[1rem] leading-8 text-black/72">{destination.activation}</p>
            </div>

            <div className="space-y-2 text-[1rem] leading-8 text-black/78">
              <p><span className="font-semibold text-brand-blue">Condiciones.</span> {destination.conditions.join(" · ")}</p>
              <p><span className="font-semibold text-brand-blue">Funcionamiento.</span> Compra demo, escaneo QR y panel de uso dentro de la propia app.</p>
            </div>
          </div>

          <aside className="rounded-[1.5rem] bg-[#fbf7f3] p-5 ring-1 ring-black/8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Resumen</p>
            <div className="mt-5 space-y-4 text-sm text-black/72">
              <div className="flex items-center justify-between gap-4">
                <span>Destino</span>
                <span className="font-semibold text-brand-navy">{destination.name}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Plan</span>
                <span className="font-semibold text-brand-navy">{selectedPlan.name}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Duración</span>
                <span className="font-semibold text-brand-navy">{selectedPlan.duration}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Datos incluidos</span>
                <span className="font-semibold text-brand-navy">{selectedPlan.data}</span>
              </div>
              <div className="border-t border-black/8 pt-4">
                <div className="flex items-center justify-between gap-4 text-base font-semibold text-brand-burnt">
                  <span>Total demo</span>
                  <span>{formatEuro(selectedPlan.priceEuro)}</span>
                </div>
              </div>
            </div>

            <StoreAddToCartButton
              item={{
                id: `esim-${destination.slug}-${selectedPlan.id}`,
                type: "esim",
                title: `eSIM ${destination.name}`,
                subtitle: `${selectedPlan.name} · ${selectedPlan.duration} · ${selectedPlan.data}`,
                imageUrl: destination.imageUrl,
                unitPriceEuro: selectedPlan.priceEuro,
                quantity: 1,
              }}
              idleLabel="Comprar"
              addedLabel="eSIM añadida"
              className="mt-8 w-full rounded-[1rem] bg-[linear-gradient(180deg,#ff6f34,#ca4300)] px-6 py-4 text-base font-semibold text-white shadow-[0_16px_30px_rgba(202,67,0,0.28)] transition hover:-translate-y-0.5"
            />
          </aside>
        </div>
      </section>
    </>
  );
}
