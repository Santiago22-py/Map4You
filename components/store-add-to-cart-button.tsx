"use client";

import { useEffect, useState } from "react";

import { fakeCartStorageKey, type FakeCartItem, upsertFakeCartItem } from "@/lib/fake-cart";

type StoreAddToCartButtonProps = {
  item: FakeCartItem;
  className: string;
  idleLabel: string;
  addedLabel?: string;
  showAddedState?: boolean;
  maxQuantity?: number;
  showQuantity?: boolean;
};

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

function getItemQuantity(items: FakeCartItem[], itemId: string) {
  return items.find((cartItem) => cartItem.id === itemId)?.quantity ?? 0;
}

export function StoreAddToCartButton({ item, className, idleLabel, addedLabel = "Añadido", showAddedState = true, maxQuantity, showQuantity = false }: StoreAddToCartButtonProps) {
  const [justAdded, setJustAdded] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(0);

  useEffect(() => {
    function syncCart() {
      setCurrentQuantity(getItemQuantity(readCart(), item.id));
    }

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("fake-cart-updated", syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("fake-cart-updated", syncCart);
    };
  }, [item.id]);

  function handleClick() {
    const currentItems = readCart();
    const itemQuantity = getItemQuantity(currentItems, item.id);

    if (maxQuantity && itemQuantity >= maxQuantity) {
      return;
    }

    const nextItems = upsertFakeCartItem(currentItems, item);
    window.localStorage.setItem(fakeCartStorageKey, JSON.stringify(nextItems));
    window.dispatchEvent(new CustomEvent("fake-cart-updated"));

    if (showAddedState) {
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1400);
    }
  }

  const hasReachedMax = typeof maxQuantity === "number" && currentQuantity >= maxQuantity;
  const label = hasReachedMax
    ? `Máximo ${maxQuantity}`
    : justAdded && showAddedState
      ? addedLabel
      : showQuantity && typeof maxQuantity === "number"
        ? `${idleLabel} ${currentQuantity}/${maxQuantity}`
        : idleLabel;

  return (
    <button type="button" onClick={handleClick} className={className} disabled={hasReachedMax}>
      {label}
    </button>
  );
}