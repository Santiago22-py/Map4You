export type FakeCartItemType = "souvenir" | "subscription" | "esim";

export type FakeCartItem = {
  id: string;
  type: FakeCartItemType;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  unitPriceEuro: number;
  quantity: number;
};

export const fakeCartStorageKey = "map4you.fake-cart";

export function formatFakeCartPrice(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function getFakeCartTotal(items: FakeCartItem[]) {
  return Number(items.reduce((sum, item) => sum + item.unitPriceEuro * item.quantity, 0).toFixed(2));
}

export function getFakeCartCount(items: FakeCartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function clampFakeCartItemQuantity(item: FakeCartItem, quantity: number) {
  if (item.type === "souvenir") {
    return Math.min(3, quantity);
  }

  return quantity;
}

export function upsertFakeCartItem(items: FakeCartItem[], nextItem: FakeCartItem) {
  const existingIndex = items.findIndex((item) => item.id === nextItem.id);

  if (existingIndex === -1) {
    return [...items, { ...nextItem, quantity: clampFakeCartItemQuantity(nextItem, nextItem.quantity) }];
  }

  return items.map((item, index) => index === existingIndex ? { ...item, quantity: clampFakeCartItemQuantity(item, item.quantity + nextItem.quantity) } : item);
}

export function updateFakeCartItemQuantity(items: FakeCartItem[], itemId: string, quantity: number) {
  if (quantity <= 0) {
    return items.filter((item) => item.id !== itemId);
  }

  return items.map((item) => item.id === itemId ? { ...item, quantity: clampFakeCartItemQuantity(item, quantity) } : item);
}