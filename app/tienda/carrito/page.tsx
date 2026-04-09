import { StoreCartView } from "@/components/store-cart-view";
import { StoreBackLink, StorePageShell } from "@/components/store-shell";

export default function StoreCartPage() {
  return (
    <StorePageShell title="Tu carrito demo">
      <div className="space-y-6">
        <StoreBackLink href="/tienda" label="Volver a tienda" />
        <StoreCartView />
      </div>
    </StorePageShell>
  );
}