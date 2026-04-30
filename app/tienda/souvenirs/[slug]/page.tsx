import Image from "next/image";
import { notFound } from "next/navigation";

import { StoreAddToCartButton } from "@/components/store-add-to-cart-button";
import { StoreBackLink, StoreCartLink, StorePageShell, StorePanel } from "@/components/store-shell";
import { formatEuro, getSouvenirCollection } from "@/lib/fake-store";

type StoreSouvenirCollectionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function StoreSouvenirCollectionPage({ params }: StoreSouvenirCollectionPageProps) {
  const { slug } = await params;
  const collection = getSouvenirCollection(slug);

  if (!collection) {
    notFound();
  }

  const products = collection.products;

  return (
    <StorePageShell title="Llévate tu viaje a casa con Map4You">
      <StorePanel className="space-y-8 sm:space-y-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <StoreBackLink href="/tienda/souvenirs" label="Volver a souvenirs" />
          <StoreCartLink />
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-[2.55rem] font-semibold tracking-[-0.06em] text-brand-blue">{collection.name}</h2>
          <p className="max-w-[56rem] text-[1rem] leading-8 text-black/72">{collection.summary}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-[1.4rem] bg-[#fbf7f3] ring-1 ring-black/8">
              <div className="relative aspect-square overflow-hidden">
                <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 1280px) 50vw, 25vw" quality={92} className="object-cover" />
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <p className="text-[1.1rem] font-semibold text-brand-navy">{product.name}</p>
                  <p className="mt-1 text-sm leading-6 text-black/68">{product.description}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-burnt">{formatEuro(product.priceEuro)}</span>
                  <StoreAddToCartButton
                    item={{
                      id: `souvenir-${collection.slug}-${product.id}`,
                      type: "souvenir",
                      title: product.name,
                      subtitle: collection.name,
                      imageUrl: product.imageUrl,
                      unitPriceEuro: product.priceEuro,
                      quantity: 1,
                    }}
                    idleLabel="Añadir"
                    showAddedState={false}
                    maxQuantity={3}
                    showQuantity
                    className="rounded-[0.95rem] bg-[linear-gradient(180deg,#4f79d4,#244a9a)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(36,74,154,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>


      </StorePanel>
    </StorePageShell>
  );
}