"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { RecommendationCard } from "@/lib/travel-data";

type PoiSectionGridProps = {
  items: RecommendationCard[];
};

const detailRows = [
  { icon: "/icons/pinpoint-blue.svg", key: "location", label: "Ubicación" },
  { icon: "/icons/fire-blue.svg", key: "popularity", label: "Popularidad" },
  { icon: "/icons/piggy-blue.svg", key: "priceRange", label: "Rango de precios" },
  { icon: "/icons/calendar-blue.svg", key: "dateHint", label: "Fechas" },
] as const satisfies Array<{
  icon: string;
  key: keyof Pick<RecommendationCard, "location" | "popularity" | "priceRange" | "dateHint">;
  label: string;
}>;

export function PoiSectionGrid({ items }: PoiSectionGridProps) {
  const [activeItem, setActiveItem] = useState<RecommendationCard | null>(null);

  useEffect(() => {
    if (!activeItem) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeItem]);

  return (
    <>
      <div className="mt-9 grid gap-y-12 sm:grid-cols-2 sm:gap-x-10 md:grid-cols-3 lg:gap-x-16">
        {items.slice(0, 3).map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => setActiveItem(item)}
            className="group flex flex-col items-center text-center transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="relative aspect-[0.9] w-full max-w-[11rem] overflow-hidden rounded-[2px] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_rgba(10,48,120,0.18)] sm:max-w-[12rem] md:max-w-[13rem]">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 13rem"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-brand-orange/60 via-white to-brand-navy/30" />
              )}
            </div>
            <h3 className="mt-4 text-[2rem] font-extrabold tracking-[-0.04em] text-brand-burnt">
              {item.name}
            </h3>
          </button>
        ))}
      </div>

      {activeItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/28 px-4 py-6 backdrop-blur-[2px] sm:py-8"
          onClick={() => setActiveItem(null)}
          role="presentation"
        >
          <div
            className="poi-dialog-enter relative w-full max-w-[18rem] rounded-[2rem] bg-[#f5f4f1] px-6 py-7 text-left shadow-[0_18px_50px_rgba(0,0,0,0.24)] ring-1 ring-black/8 sm:max-w-[19rem] sm:px-7 sm:py-8"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="poi-dialog-title"
          >
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-brand-navy/70 transition hover:bg-brand-navy/5 hover:text-brand-navy"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>

            <h3 id="poi-dialog-title" className="pr-8 text-[1.95rem] font-extrabold tracking-[-0.05em] text-brand-burnt sm:text-[2rem]">
              {activeItem.name}
            </h3>
            <p className="mt-2 text-[1.02rem] leading-7 text-black/58 sm:text-[1.08rem]">{activeItem.detail}</p>

            <div className="mt-7 space-y-5">
              {detailRows.map((row) => (
                <div key={row.key} className="flex items-start gap-4">
                  <Image src={row.icon} alt="" width={24} height={24} className="mt-0.5 h-6 w-6 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-black/52">{row.label}</div>
                    <div className="text-[1.02rem] leading-6 text-black/70 sm:text-lg">{activeItem[row.key]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}