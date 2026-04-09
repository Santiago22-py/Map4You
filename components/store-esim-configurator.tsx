"use client";

import Image from "next/image";
import { useState } from "react";

import { StoreAddToCartButton } from "@/components/store-add-to-cart-button";
import { StoreCartLink } from "@/components/store-cart-link";
import { calculateEsimQuote, clampEsimGbPerDay, formatEuro, type EsimDestination } from "@/lib/fake-store";

type StoreEsimConfiguratorProps = {
  destination: EsimDestination;
  initialGbPerDay: number;
  initialStartDate: string;
  initialEndDate: string;
};

export function StoreEsimConfigurator({ destination, initialGbPerDay, initialStartDate, initialEndDate }: StoreEsimConfiguratorProps) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [selectedGbPerDay, setSelectedGbPerDay] = useState(initialGbPerDay);

  const safeGbPerDay = clampEsimGbPerDay(destination, selectedGbPerDay);
  const quote = calculateEsimQuote(destination, safeGbPerDay, startDate, endDate);

  return (
    <>
      <section className="rounded-[1.8rem] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.1)] ring-1 ring-black/10 sm:p-8 space-y-7">
        <div className="space-y-5 text-center">
          <h2 className="font-display text-[2.8rem] font-semibold tracking-[-0.06em] text-brand-blue">{destination.name}</h2>
          <div className="mx-auto relative h-52 w-52 overflow-hidden rounded-full shadow-[0_16px_28px_rgba(10,48,120,0.18)] ring-1 ring-black/10">
            <Image src={destination.imageUrl} alt={destination.name} fill sizes="13rem" quality={92} className="object-cover" />
          </div>
        </div>

        <div className="grid gap-5 text-left">
          <label className="space-y-2 text-sm font-semibold uppercase tracking-[0.08em] text-black/55">
            <span>Fecha inicio</span>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="w-full rounded-[1rem] border border-brand-orange bg-white px-4 py-3 text-base font-medium text-brand-ink outline-none focus:ring-2 focus:ring-brand-orange/16" />
          </label>
          <label className="space-y-2 text-sm font-semibold uppercase tracking-[0.08em] text-black/55">
            <span>Fecha fin</span>
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="w-full rounded-[1rem] border border-brand-orange bg-white px-4 py-3 text-base font-medium text-brand-ink outline-none focus:ring-2 focus:ring-brand-orange/16" />
          </label>
          <label className="space-y-2 text-sm font-semibold uppercase tracking-[0.08em] text-black/55">
            <span>GB por día</span>
            <select value={String(safeGbPerDay)} onChange={(event) => setSelectedGbPerDay(Number(event.target.value))} className="w-full rounded-[1rem] border border-brand-orange bg-white px-4 py-3 text-base font-medium text-brand-ink outline-none focus:ring-2 focus:ring-brand-orange/16">
              {destination.gbPerDayOptions.map((option) => (
                <option key={`${destination.slug}-${option}`} value={option}>
                  {option} GB por día
                </option>
              ))}
            </select>
          </label>
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
              <p className="text-[1.7rem] font-semibold text-brand-burnt">{formatEuro(quote.total)}</p>
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
              <p className="text-[1.45rem] font-semibold text-brand-ink">Elección de GB</p>
              <p className="mt-2 text-[1rem] leading-8 text-black/72">Cada destino tiene una tarifa demo distinta por GB diario. El precio final se recalcula automáticamente al ajustar fechas y consumo diario.</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold uppercase tracking-[0.08em] text-brand-navy/70">
                <span className="rounded-full bg-white px-4 py-2 ring-1 ring-black/8">{safeGbPerDay} GB por día</span>
                <span className="rounded-full bg-white px-4 py-2 ring-1 ring-black/8">{quote.durationDays} días</span>
                <span className="rounded-full bg-white px-4 py-2 ring-1 ring-black/8">{quote.totalDataGb} GB en total</span>
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
                <span>Paquete</span>
                <span className="font-semibold text-brand-navy">{safeGbPerDay} GB/día</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Duración</span>
                <span className="font-semibold text-brand-navy">{quote.durationDays} días</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Datos estimados</span>
                <span className="font-semibold text-brand-navy">{quote.totalDataGb} GB</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Activación demo</span>
                <span className="font-semibold text-brand-navy">{formatEuro(destination.activationFeeEuro)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Datos del viaje</span>
                <span className="font-semibold text-brand-navy">{formatEuro(quote.dataCharge)}</span>
              </div>
              <div className="border-t border-black/8 pt-4">
                <div className="flex items-center justify-between gap-4 text-base font-semibold text-brand-burnt">
                  <span>Total demo</span>
                  <span>{formatEuro(quote.total)}</span>
                </div>
              </div>
            </div>

            <StoreAddToCartButton
              item={{
                id: `esim-${destination.slug}-${safeGbPerDay}-${quote.durationDays}-${startDate}-${endDate}`,
                type: "esim",
                title: `eSIM ${destination.name}`,
                subtitle: `${safeGbPerDay} GB/día · ${quote.durationDays} días · ${startDate} a ${endDate}`,
                imageUrl: destination.imageUrl,
                unitPriceEuro: quote.total,
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