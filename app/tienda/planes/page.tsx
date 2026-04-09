import Link from "next/link";

import { StorePageShell, StorePanel } from "@/components/store-shell";
import { subscriptionPlans } from "@/lib/fake-store";

const accentClasses = {
  slate: {
    border: "ring-black/18",
    title: "text-[#6d7483]",
    button: "bg-[linear-gradient(180deg,#c5cddd,#99a8c6)] shadow-[0_14px_24px_rgba(115,130,160,0.28)]",
  },
  blue: {
    border: "ring-[#a4c0ff]",
    title: "text-brand-blue",
    button: "bg-[linear-gradient(180deg,#7ea6ff,#4574d1)] shadow-[0_14px_24px_rgba(69,116,209,0.28)]",
  },
  orange: {
    border: "ring-brand-orange/45",
    title: "text-[#d7832d]",
    button: "bg-[linear-gradient(180deg,#f2bf79,#c88429)] shadow-[0_14px_24px_rgba(200,132,41,0.28)]",
  },
};

export default function StorePlansPage() {
  return (
    <StorePageShell title="Nuestros planes de suscripción">
      <section className="grid gap-6 xl:grid-cols-3">
        {subscriptionPlans.map((plan) => {
          const accent = accentClasses[plan.accent];

          return (
            <article key={plan.id} className="flex h-full flex-col gap-5">
              <StorePanel className={`flex h-full flex-col justify-between border ${accent.border}`}>
                <div className="space-y-6">
                  <h2 className={`text-balance text-center font-display text-[2rem] font-semibold tracking-[-0.05em] ${accent.title}`}>
                    {plan.title}
                  </h2>

                  <div className="space-y-5 text-[1rem] leading-8 text-black/82">
                    <p>{plan.intro}</p>
                    <ul className="list-disc space-y-1 pl-6">
                      {plan.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                    <p>{plan.outro}</p>
                  </div>
                </div>
              </StorePanel>

              <Link href={`/tienda/planes/${plan.id}`} className={`rounded-[1.15rem] px-6 py-4 text-center text-[1rem] font-semibold text-white transition hover:-translate-y-0.5 ${accent.button}`}>
                {plan.priceLabel}
              </Link>
            </article>
          );
        })}
      </section>
    </StorePageShell>
  );
}