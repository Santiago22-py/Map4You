import Link from "next/link";
import { notFound } from "next/navigation";

import { getPlaceBySlug } from "@/lib/public-data";

type PlacePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PlacePage({ params }: PlacePageProps) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);

  if (!place) {
    notFound();
  }

  const sections = [
    { title: "Places to stay", items: place.stay },
    { title: "Places to eat", items: place.eat },
    { title: "Places to visit", items: place.visit },
  ];

  return (
    <main className="flex-1 py-6 md:py-10">
      <div className="page-shell flex flex-col gap-8">
        <section className="hero-card min-h-[28rem] overflow-hidden rounded-[2rem] p-6 text-white md:p-8"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 18%), linear-gradient(160deg, rgba(10,48,120,0.95), rgba(3,18,42,0.84) 42%, rgba(255,100,47,0.72) 100%)",
          }}
        >
          <div className="flex h-full flex-col justify-between gap-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href={`/search?q=${place.countrySlug}`} className="rounded-full bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                Back to {place.countryName}
              </Link>
              <div className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
                {place.vibe}
              </div>
            </div>

            <div className="max-w-3xl">
              <div className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
                {place.countryName}
              </div>
              <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl md:text-7xl">
                {place.name}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
                {place.description}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <article className="soft-panel rounded-[2rem] p-6 md:p-7">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-orange">
                Overview
              </div>
              <p className="mt-3 text-base leading-8 text-muted">{place.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {place.bestFor.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-brand-navy/6 px-3 py-1.5 text-sm font-semibold text-brand-navy"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>

            <div className="grid gap-5 md:grid-cols-3">
              {place.gallery.map((item, index) => (
                <div
                  key={item}
                  className="hero-card min-h-56 p-5 text-white"
                  style={{
                    background:
                      index === 0
                        ? "linear-gradient(155deg, rgba(255,100,47,0.92), rgba(10,48,120,0.7))"
                        : index === 1
                          ? "linear-gradient(145deg, rgba(10,48,120,0.92), rgba(73,82,151,0.72))"
                          : "linear-gradient(165deg, rgba(3,18,42,0.9), rgba(255,100,47,0.8))",
                  }}
                >
                  <div className="flex h-full items-end">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
                        Gallery note
                      </div>
                      <div className="mt-2 font-display text-2xl font-semibold">{item}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="soft-panel rounded-[2rem] p-6 md:p-7">
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-orange">
              Good for
            </div>
            <p className="mt-3 text-sm leading-7 text-muted">
              This structure mirrors the eventual real-data experience, where the summary, supporting imagery, and practical categories all live on the same scrollable place page.
            </p>
            <div className="mt-6 space-y-4">
              {sections.map((section) => (
                <a
                  key={section.title}
                  href={`#${section.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-brand-navy ring-1 ring-brand-navy/8 transition hover:text-brand-orange"
                >
                  {section.title}
                  <span aria-hidden="true">↓</span>
                </a>
              ))}
            </div>
          </aside>
        </section>

        {sections.map((section) => (
          <section
            key={section.title}
            id={section.title.toLowerCase().replace(/\s+/g, "-")}
            className="soft-panel rounded-[2rem] p-6 md:p-8"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-orange">
                  {place.name}
                </div>
                <h2 className="mt-2 font-display text-3xl font-semibold text-brand-navy md:text-4xl">
                  {section.title}
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-muted">
                Public travelers should be able to quickly understand the practical options around a destination without logging in or opening separate tools.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {section.items.map((item) => (
                <article key={item.name} className="rounded-[1.75rem] bg-white p-5 ring-1 ring-brand-navy/8">
                  <h3 className="font-display text-2xl font-semibold text-brand-navy">{item.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.detail}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}