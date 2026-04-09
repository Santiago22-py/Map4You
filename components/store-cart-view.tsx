"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { formatFakeCartPrice, getFakeCartCount, getFakeCartTotal, fakeCartStorageKey, type FakeCartItem, updateFakeCartItemQuantity } from "@/lib/fake-cart";

function readCart() {
  if (typeof window === "undefined") {
    return [] as FakeCartItem[];
  }

  try {
    const raw = window.localStorage.getItem(fakeCartStorageKey);
    return raw ? (JSON.parse(raw) as FakeCartItem[]) : [];
  } catch {
    return [] as FakeCartItem[];
  }
}

export function StoreCartView() {
  const [items, setItems] = useState<FakeCartItem[]>([]);

  useEffect(() => {
    function syncCart() {
      setItems(readCart());
    }

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("fake-cart-updated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("fake-cart-updated", syncCart);
    };
  }, []);

  function persist(nextItems: FakeCartItem[]) {
    setItems(nextItems);
    window.localStorage.setItem(fakeCartStorageKey, JSON.stringify(nextItems));
    window.dispatchEvent(new CustomEvent("fake-cart-updated"));
  }

  function updateQuantity(itemId: string, quantity: number) {
    persist(updateFakeCartItemQuantity(items, itemId, quantity));
  }

  function clearCart() {
    persist([]);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[1.8rem] bg-white p-8 text-center shadow-[0_12px_28px_rgba(0,0,0,0.1)] ring-1 ring-black/10">
        <p className="font-display text-[2rem] font-semibold tracking-[-0.05em] text-brand-navy">Tu carrito está vacío</p>
        <p className="mt-3 text-[1rem] leading-8 text-black/68">Añade souvenirs, un plan o una eSIM demo para ver el flujo completo de compra.</p>
      </div>
    );
  }

  const itemCount = getFakeCartCount(items);
  const total = getFakeCartTotal(items);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="space-y-4 rounded-[1.8rem] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.1)] ring-1 ring-black/10 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Carrito demo</p>
            <p className="mt-2 font-display text-[2rem] font-semibold tracking-[-0.05em] text-brand-navy">{itemCount} artículos</p>
          </div>

          <button type="button" onClick={clearCart} className="rounded-full border border-brand-navy/12 px-4 py-2 text-sm font-semibold text-brand-navy transition hover:bg-brand-navy/5">
            Vaciar carrito
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col gap-4 rounded-[1.35rem] bg-[#fbf7f3] p-4 ring-1 ring-black/8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                {item.imageUrl ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] ring-1 ring-black/8">
                    <Image src={item.imageUrl} alt={item.title} fill sizes="5rem" quality={92} className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1rem] bg-[linear-gradient(140deg,rgba(255,255,255,0.95),rgba(241,244,251,0.98))] ring-1 ring-black/8">
                    <span className="font-display text-[1.8rem] font-semibold text-brand-blue">M4Y</span>
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-burnt/80">{item.type}</p>
                  <p className="truncate font-display text-[1.4rem] font-semibold tracking-[-0.04em] text-brand-navy">{item.title}</p>
                  {item.subtitle ? <p className="mt-1 text-sm leading-6 text-black/65">{item.subtitle}</p> : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-2 py-2 ring-1 ring-black/8">
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-8 w-8 rounded-full text-lg font-semibold text-brand-navy transition hover:bg-brand-navy/6">
                    -
                  </button>
                  <span className="min-w-[2ch] text-center text-sm font-semibold text-brand-ink">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-8 w-8 rounded-full text-lg font-semibold text-brand-navy transition hover:bg-brand-navy/6">
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-brand-navy">{formatFakeCartPrice(item.unitPriceEuro)}</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-brand-burnt/80">{formatFakeCartPrice(item.unitPriceEuro * item.quantity)} total</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="rounded-[1.8rem] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.1)] ring-1 ring-black/10 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Resumen</p>
        <p className="mt-3 font-display text-[2.4rem] font-semibold tracking-[-0.05em] text-brand-burnt">{formatFakeCartPrice(total)}</p>
        <p className="mt-2 text-sm leading-6 text-black/65">Checkout completamente ficticio para validar navegación, composición de carrito y mezcla de productos.</p>

        <button type="button" className="mt-8 w-full rounded-[1rem] bg-[linear-gradient(180deg,#ff6f34,#ca4300)] px-6 py-4 text-base font-semibold text-white shadow-[0_16px_30px_rgba(202,67,0,0.28)] transition hover:-translate-y-0.5">
          Continuar al pago demo
        </button>
      </aside>
    </div>
  );
}