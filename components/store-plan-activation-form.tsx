"use client";

import { useMemo, useState } from "react";

import { formatEuro, type SubscriptionPlan } from "@/lib/fake-store";

type StorePlanActivationFormProps = {
  plan: SubscriptionPlan;
  userEmail: string;
  userName: string;
};

const annualMonthsCharged = 10;
const annualMonthsCovered = 12;
const validPromoCode = "MAP4YOU10";
const promoDiscountRate = 0.1;

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function StorePlanActivationForm({ plan, userEmail, userName }: StorePlanActivationFormProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [promoCode, setPromoCode] = useState("");

  const normalizedPromoCode = promoCode.trim().toUpperCase();
  const hasPromoDiscount = normalizedPromoCode === validPromoCode;

  const pricing = useMemo(() => {
    const monthlyPrice = plan.priceEuro;
    const cycleSubtotal = billingCycle === "annual"
      ? roundCurrency(monthlyPrice * annualMonthsCharged)
      : monthlyPrice;
    const cycleReference = billingCycle === "annual"
      ? roundCurrency(monthlyPrice * annualMonthsCovered)
      : monthlyPrice;
    const annualDiscount = billingCycle === "annual"
      ? roundCurrency(cycleReference - cycleSubtotal)
      : 0;
    const promoDiscount = hasPromoDiscount
      ? roundCurrency(cycleSubtotal * promoDiscountRate)
      : 0;
    const total = roundCurrency(Math.max(0, cycleSubtotal - promoDiscount));

    return {
      annualDiscount,
      cycleReference,
      cycleSubtotal,
      promoDiscount,
      total,
    };
  }, [billingCycle, hasPromoDiscount, plan.priceEuro]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="rounded-[1.8rem] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.1)] ring-1 ring-black/10 sm:p-8 space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Activación demo</p>
          <h2 className="mt-3 font-display text-[2.2rem] font-semibold tracking-[-0.05em] text-brand-blue">Configura tu suscripción en menos de un minuto</h2>
          <p className="mt-3 max-w-[42rem] text-[1rem] leading-8 text-black/72">La identidad se rellena con tu cuenta real y queda bloqueada. Solo ajustas el ciclo y, si quieres, aplicas un código promocional demo.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold uppercase tracking-[0.08em] text-black/55">
            <span>Nombre del viajero</span>
            <input type="text" value={userName} disabled readOnly className="w-full rounded-[1rem] border border-black/10 bg-black/5 px-4 py-3 text-base font-medium text-brand-ink outline-none disabled:cursor-not-allowed disabled:text-black/70" />
          </label>
          <label className="space-y-2 text-sm font-semibold uppercase tracking-[0.08em] text-black/55">
            <span>Email</span>
            <input type="email" value={userEmail} disabled readOnly className="w-full rounded-[1rem] border border-black/10 bg-black/5 px-4 py-3 text-base font-medium text-brand-ink outline-none disabled:cursor-not-allowed disabled:text-black/70" />
          </label>
          <label className="space-y-2 text-sm font-semibold uppercase tracking-[0.08em] text-black/55">
            <span>Ciclo</span>
            <select value={billingCycle} onChange={(event) => setBillingCycle(event.target.value === "annual" ? "annual" : "monthly")} className="w-full rounded-[1rem] border border-brand-orange bg-white px-4 py-3 text-base font-medium text-brand-ink outline-none focus:ring-2 focus:ring-brand-orange/16">
              <option value="monthly">Mensual</option>
              <option value="annual">Anual</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold uppercase tracking-[0.08em] text-black/55">
            <span>Código promo</span>
            <input type="text" value={promoCode} onChange={(event) => setPromoCode(event.target.value.toUpperCase())} placeholder={validPromoCode} className="w-full rounded-[1rem] border border-brand-orange bg-white px-4 py-3 text-base font-medium uppercase text-brand-ink outline-none focus:ring-2 focus:ring-brand-orange/16" />
          </label>
        </div>

        <div className="rounded-[1.5rem] bg-[#fbf7f3] p-5 ring-1 ring-black/8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Qué se activaría</p>
            {billingCycle === "annual" && plan.priceEuro > 0 ? (
              <span className="rounded-full bg-brand-blue/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-brand-blue">
                Pagas {annualMonthsCharged} meses y usas {annualMonthsCovered}
              </span>
            ) : null}
            {hasPromoDiscount && plan.priceEuro > 0 ? (
              <span className="rounded-full bg-brand-orange/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-brand-burnt">
                {validPromoCode} aplicado
              </span>
            ) : null}
          </div>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-[1rem] leading-7 text-black/72">
            {plan.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </section>

      <aside className="rounded-[1.8rem] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.1)] ring-1 ring-black/10 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Resumen</p>
        <p className="mt-3 font-display text-[2rem] font-semibold tracking-[-0.05em] text-brand-burnt">{billingCycle === "annual" ? "Ciclo anual" : plan.priceLabel}</p>
        <p className="mt-2 text-sm leading-6 text-black/65">{plan.outro}</p>

        <div className="mt-6 space-y-3 rounded-[1.25rem] bg-[#fbf7f3] p-4 ring-1 ring-black/8 text-sm text-black/72">
          <div className="flex items-center justify-between gap-4">
            <span>Plan</span>
            <span className="font-semibold text-brand-navy">{plan.title}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Ciclo</span>
            <span className="font-semibold text-brand-navy">{billingCycle === "annual" ? "Anual" : "Mensual"}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Precio base</span>
            <span className="font-semibold text-brand-navy">{formatEuro(pricing.cycleReference)}</span>
          </div>
          {pricing.annualDiscount > 0 ? (
            <div className="flex items-center justify-between gap-4">
              <span>Ahorro anual</span>
              <span className="font-semibold text-emerald-700">- {formatEuro(pricing.annualDiscount)}</span>
            </div>
          ) : null}
          {pricing.promoDiscount > 0 ? (
            <div className="flex items-center justify-between gap-4">
              <span>Promo {validPromoCode}</span>
              <span className="font-semibold text-emerald-700">- {formatEuro(pricing.promoDiscount)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <span>Alta demo</span>
            <span className="font-semibold text-brand-navy">Inmediata</span>
          </div>
          <div className="border-t border-black/8 pt-3 flex items-center justify-between gap-4 text-base">
            <span className="font-semibold text-brand-burnt">Total hoy</span>
            <span className="font-semibold text-brand-burnt">{formatEuro(pricing.total)}</span>
          </div>
        </div>

        {promoCode.trim().length > 0 && !hasPromoDiscount ? (
          <p className="mt-4 text-sm leading-6 text-brand-burnt/85">Código no válido. Prueba con {validPromoCode}.</p>
        ) : null}

        <button type="button" className="mt-8 w-full rounded-[1rem] bg-[linear-gradient(180deg,#ff6f34,#ca4300)] px-6 py-4 text-base font-semibold text-white shadow-[0_16px_30px_rgba(202,67,0,0.28)] transition hover:-translate-y-0.5">
          Activar suscripción demo
        </button>
      </aside>
    </div>
  );
}