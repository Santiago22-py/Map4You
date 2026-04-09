"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { fakeCartStorageKey, getFakeCartCount, type FakeCartItem } from "@/lib/fake-cart";

type StoreCartLinkProps = {
  href?: string;
  label?: string;
};

function readCartCount() {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(fakeCartStorageKey);
    const items = raw ? (JSON.parse(raw) as FakeCartItem[]) : [];
    return getFakeCartCount(items);
  } catch {
    return 0;
  }
}

export function StoreCartLink({ href = "/tienda/carrito", label = "Carrito demo" }: StoreCartLinkProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function syncCart() {
      setCount(readCartCount());
    }

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("fake-cart-updated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("fake-cart-updated", syncCart);
    };
  }, []);

  return (
    <Link href={href} aria-label={label} className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-brand-orange/20 bg-brand-orange/6 text-brand-burnt transition hover:-translate-y-0.5 hover:bg-brand-orange/10 sm:h-14 sm:w-14">
      <Image src="/icons/cart.svg" alt="" width={30} height={28} className="h-auto w-7" />
      {count > 0 ? <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-6 items-center justify-center rounded-full bg-brand-blue px-1.5 py-1 text-[0.68rem] font-semibold text-white shadow-[0_8px_16px_rgba(36,74,154,0.24)]">{count}</span> : null}
    </Link>
  );
}