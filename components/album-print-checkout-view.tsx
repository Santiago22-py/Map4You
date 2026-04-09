import Image from "next/image";
import Link from "next/link";

import type { TravelAlbum } from "@/lib/travel-albums";

type AlbumPrintCheckoutViewProps = {
  album: TravelAlbum;
  backHref: string;
  backLabel: string;
  isPublicPreview?: boolean;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-ES", {
    currency: "EUR",
    style: "currency",
  }).format(value);
}

function getAlbumPrintEstimate(photoCount: number) {
  const safePhotoCount = Math.max(photoCount, 1);
  const basePrice = 18;
  const photoSurcharge = Math.min(22, safePhotoCount * 0.65);
  const subtotal = Number((basePrice + photoSurcharge).toFixed(2));
  const shipping = 4.9;
  const total = Number((subtotal + shipping).toFixed(2));

  return {
    photoPages: Math.max(20, Math.min(64, safePhotoCount * 2)),
    shipping,
    subtotal,
    total,
  };
}

export function AlbumPrintCheckoutView({ album, backHref, backLabel, isPublicPreview = false }: AlbumPrintCheckoutViewProps) {
  const pricing = getAlbumPrintEstimate(album.photoCount);
  const heroImage = album.coverUrl ?? album.photos[0]?.url ?? null;

  return (
    <main className="flex-1 bg-[#f7efe8] pb-10 md:pb-14">
      <div className="page-shell pt-10 md:pt-12">
        <section className="rounded-[1.8rem] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-4">
              <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-brand-navy/70 transition hover:text-brand-navy">
                <span aria-hidden="true">←</span>
                {backLabel}
              </Link>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.1em] text-brand-navy/55">Mock checkout</p>
                <h1 className="mt-2 font-display text-[2.5rem] font-semibold uppercase tracking-[-0.05em] text-brand-burnt sm:text-[3rem]">Imprime este álbum</h1>
                <p className="mt-3 max-w-[42rem] text-[1.02rem] leading-7 text-black/72">
                  Esta pantalla es una demo de monetización para enseñar cómo podría funcionar la impresión física de recuerdos dentro de Map 4 You.
                </p>
              </div>
            </div>

            <div className="rounded-[1.2rem] bg-[#f7efe8] px-5 py-4 ring-1 ring-brand-navy/10">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Total estimado</p>
              <p className="mt-2 font-display text-[2.1rem] font-semibold tracking-[-0.05em] text-brand-navy">{formatPrice(pricing.total)}</p>
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-burnt">Incluye envío demo</p>
            </div>
          </div>

          {isPublicPreview ? (
            <div className="mt-6 rounded-2xl border border-brand-navy/12 bg-brand-navy/5 px-4 py-3 text-sm text-brand-navy">
              Estás viendo una vista pública del álbum. Esta demo solo enseña el flujo visual de compra, no crea pedidos reales.
            </div>
          ) : null}

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,24rem)]">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-[1.4rem] bg-[#f7efe8] ring-1 ring-black/8">
                <div className="grid gap-0 sm:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
                  <div className="relative aspect-square bg-[#ead8c9]">
                    {heroImage ? (
                      <Image src={heroImage} alt={album.title} fill sizes="(max-width: 640px) 100vw, 18rem" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-orange/50 via-white to-brand-navy/20" />
                    )}
                  </div>

                  <div className="space-y-4 p-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Producto</p>
                      <h2 className="mt-2 font-display text-[2rem] font-semibold tracking-[-0.05em] text-brand-burnt">{album.title}</h2>
                    </div>

                    <p className="text-[1rem] leading-7 text-black/72">
                      Álbum cuadrado premium con cubierta mate, selección automática de fotos y maquetación pensada para convertir recuerdos digitales en un objeto físico fácil de regalar.
                    </p>

                    <div className="flex flex-wrap gap-3 text-sm font-semibold uppercase tracking-[0.08em] text-brand-navy/70">
                      <span className="rounded-full bg-white px-4 py-2 ring-1 ring-black/8">{album.photoCount} fotos</span>
                      <span className="rounded-full bg-white px-4 py-2 ring-1 ring-black/8">{pricing.photoPages} páginas</span>
                      <span className="rounded-full bg-white px-4 py-2 ring-1 ring-black/8">Tapa dura</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[1.3rem] bg-[#fbf7f3] p-5 ring-1 ring-black/8">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Incluye</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-black/72">
                    <li>Selección de portada a partir del propio álbum.</li>
                    <li>Maquetación automática con equilibrio entre fotos y espacios en blanco.</li>
                    <li>Acabado mate y formato cuadrado pensado para viajes.</li>
                  </ul>
                </div>

                <div className="rounded-[1.3rem] bg-[#fbf7f3] p-5 ring-1 ring-black/8">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Upsells demo</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-black/72">
                    <li>Versión regalo con funda rígida.</li>
                    <li>Segunda copia con descuento para amigos o familia.</li>
                    <li>Entrega exprés para campañas estacionales.</li>
                  </ul>
                </div>
              </div>
            </div>

            <aside className="rounded-[1.4rem] bg-[#fffdfb] p-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)] ring-1 ring-black/8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Resumen de compra</p>

              <div className="mt-5 space-y-4 text-sm text-black/72">
                <div className="flex items-center justify-between gap-4">
                  <span>Álbum impreso</span>
                  <span className="font-semibold text-brand-navy">{formatPrice(pricing.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Envío demo</span>
                  <span className="font-semibold text-brand-navy">{formatPrice(pricing.shipping)}</span>
                </div>
                <div className="border-t border-black/8 pt-4">
                  <div className="flex items-center justify-between gap-4 text-base font-semibold text-brand-burnt">
                    <span>Total</span>
                    <span>{formatPrice(pricing.total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button type="button" className="w-full rounded-[1rem] bg-[linear-gradient(180deg,#3266d0,#244a9a)] px-6 py-4 text-base font-semibold text-white shadow-[0_16px_30px_rgba(36,74,154,0.28)] transition hover:-translate-y-0.5">
                  Continuar al pago (demo)
                </button>
                <p className="text-xs leading-5 text-black/55">
                  Esta acción no cobra nada. Solo muestra cómo podría presentarse un checkout de impresión física dentro de la app.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
