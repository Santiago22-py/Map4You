import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PoiSectionGrid } from "@/components/poi-section-grid";
import { PublicHeader } from "@/components/public-header";
import { getDestinationDetail } from "@/lib/travel-data";

export const revalidate = 3600;

type PlacePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    title?: string;
    country?: string;
  }>;
};

export default async function PlacePage({ params, searchParams }: PlacePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const place = await getDestinationDetail({
    slug,
    title: resolvedSearchParams.title,
    country: resolvedSearchParams.country,
  });

  if (!place.title) {
    notFound();
  }

  const sections = [
    { title: "Places to stay", items: place.stay },
    { title: "Places to eat", items: place.eat },
    { title: "Places to visit", items: place.visit },
  ];

  return (
    <main className="flex-1 pb-10 md:pb-14">
      <PublicHeader />

      <div className="page-shell pt-8 md:pt-10">
        <div className="flex items-center gap-4 text-brand-navy md:gap-6">
          <Link
            href={`/search?q=${encodeURIComponent(place.countryName || place.countrySlug)}`}
            aria-label={`Back to ${place.countryName}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-brand-navy/5"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m14 6-6 6 6 6" />
              <path d="M8.5 12H20" />
            </svg>
          </Link>
        </div>

        <section className="mt-4 grid gap-10 lg:grid-cols-[minmax(360px,420px)_minmax(0,1fr)] lg:items-start lg:gap-14">
          <div>
            <div className="relative aspect-[1.07] overflow-hidden rounded-[2px] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
              {place.heroImageUrl ? (
                <Image
                  src={place.heroImageUrl}
                  alt={place.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  loading="eager"
                  fetchPriority="high"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-brand-orange/60 via-white to-brand-navy/30" />
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-5">
              {place.galleryImages.slice(1, 4).map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-[2px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                  <Image
                    src={image}
                    alt={`${place.title} gallery ${index + 1}`}
                    fill
                    sizes="(max-width: 1024px) 33vw, 120px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h1 className="font-display text-5xl font-semibold uppercase tracking-[-0.05em] text-brand-navy sm:text-6xl md:text-7xl">
              {place.title}
            </h1>
            <p className="mt-4 max-w-4xl text-xl leading-[1.45] text-black/88 md:text-[2rem] md:leading-[1.42]">
              {place.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-8 text-3xl text-black md:gap-12">
              <div className="flex items-center gap-3">
                <Image src="/icons/piggybank.svg" alt="" width={32} height={32} className="h-8 w-8" />
                <span className="text-[2rem] font-medium">{place.stats.budget}</span>
              </div>
              <div className="flex items-center gap-3">
                <Image src="/icons/star.svg" alt="" width={32} height={32} className="h-8 w-8" />
                <span className="text-[2rem] font-medium">{place.stats.score}</span>
              </div>
              <div className="flex items-center gap-3">
                <Image src="/icons/fire.svg" alt="" width={24} height={32} className="h-8 w-auto" />
                <span className="text-[2rem] font-medium">{place.stats.energy}</span>
              </div>
            </div>
          </div>
        </section>

        {sections.map((section) => (
          <section key={section.title} className="mt-16 md:mt-20">
            <h2 className="font-display text-4xl font-semibold tracking-[-0.05em] text-brand-navy sm:text-5xl">
              {section.title === "Places to stay"
                ? "Dormir"
                : section.title === "Places to eat"
                  ? "Comer"
                  : "Visitar"}
            </h2>

            <PoiSectionGrid items={section.items} />
          </section>
        ))}
      </div>

      <div className="pointer-events-none fixed bottom-5 right-5 z-10 md:bottom-6 md:right-8">
        <Image src="/icons/chat.svg" alt="Chat" width={60} height={60} className="h-14 w-14 md:h-[60px] md:w-[60px]" />
      </div>
    </main>
  );
}