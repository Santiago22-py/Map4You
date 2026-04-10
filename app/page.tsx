import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { HeaderShortcuts } from "@/components/header-shortcuts";
import { hasSupabaseCredentials } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";

function enterDelay(delay: string): CSSProperties {
  return { "--enter-delay": delay } as CSSProperties;
}

export default async function Home() {
  const currentUser = await getCurrentUser();
  const authEnabled = hasSupabaseCredentials();
  const authWarning = authEnabled ? null : "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY.";

  return (
    <main className="flex-1 overflow-x-clip pb-10 pt-6 md:pb-16 md:pt-10">
      <div className="flex flex-col gap-8 md:gap-12">
        <header className="page-shell flex items-center justify-between gap-4 px-1">
          <Link href="/" className="motion-fade-up shrink-0 w-[132px] md:w-[168px]" style={enterDelay("40ms")}>
            <Image
              src="/icons/logo.svg"
              alt="Map 4 You"
              width={170}
              height={48}
              loading="eager"
              className="w-full"
              style={{ height: "auto" }}
            />
          </Link>

          <HeaderShortcuts currentUser={Boolean(currentUser)} currentUserId={currentUser?.id ?? null} authEnabled={authEnabled} authWarning={authWarning} animated />
        </header>

        <div
          className="motion-fade-up w-full border-t border-brand-navy/25 shadow-[0_2px_10px_rgba(10,48,120,0.09)]"
          style={enterDelay("210ms")}
        />

        <section className="page-shell grid min-h-[calc(100dvh-13rem)] items-center gap-12 pt-4 md:gap-14 lg:grid-cols-[minmax(540px,1fr)_minmax(420px,0.9fr)] lg:pt-10">
          <div className="relative order-2 min-h-[25rem] sm:min-h-[33rem] lg:order-1 lg:min-h-[42rem]">
            <div
              className="landing-photo motion-fade-up absolute left-[6%] top-[26%] w-[34%] min-w-[9rem] max-w-[15rem] md:left-[2%] md:top-[31%] md:w-[32%] lg:left-[1%] lg:top-[36%] lg:w-[36%]"
              style={enterDelay("240ms")}
            >
              <Image
                src="/images/landing/lake.png"
                alt="Paisaje de lago"
                width={430}
                height={430}
                className="h-auto w-full"
                sizes="(max-width: 1024px) 34vw, 15rem"
              />
            </div>

            <div
              className="landing-photo motion-fade-up absolute left-[39%] top-[2%] w-[45%] min-w-[14rem] max-w-[18rem] md:left-[37%] md:top-[4%] md:w-[46%] lg:left-[42%] lg:top-[4%] lg:w-[46%]"
              style={enterDelay("360ms")}
            >
              <Image
                src="/images/landing/group.png"
                alt="Grupo de viajeros en la montaña"
                width={430}
                height={430}
                className="h-auto w-full"
                sizes="(max-width: 1024px) 45vw, 18rem"
              />
            </div>

            <div
              className="landing-photo motion-fade-up absolute left-[42%] top-[55%] w-[43%] min-w-[14rem] max-w-[18rem] md:left-[40%] md:top-[56%] md:w-[45%] lg:left-[45%] lg:top-[56%] lg:w-[44%]"
              style={enterDelay("500ms")}
            >
              <Image
                src="/images/landing/car.png"
                alt="Viajeros en un jeep naranja"
                width={430}
                height={430}
                className="h-auto w-full"
                sizes="(max-width: 1024px) 44vw, 18rem"
              />
            </div>
          </div>

          <div className="order-1 flex flex-col items-center text-center lg:order-2 lg:items-start lg:text-left">
            <p
              className="motion-fade-up font-display text-[1.75rem] font-medium tracking-[-0.04em] text-black sm:text-[2rem] md:text-[2.2rem]"
              style={enterDelay("420ms")}
            >
              Planea. Viaja. Comparte
            </p>
            <h1
              className="motion-fade-up mt-6 max-w-[12ch] font-display text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.05em] text-brand-navy sm:text-[3.2rem] md:text-[3.9rem] lg:text-[4.25rem]"
              style={enterDelay("520ms")}
            >
              ¿Cuál será tu próxima aventura?
            </h1>

            <form
              action="/search"
              method="get"
              className="landing-search-shell motion-search-settle mt-8 flex w-full max-w-[31rem] items-center rounded-full bg-white pl-6 pr-2 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/8"
              style={enterDelay("640ms")}
            >
              <label htmlFor="destination-search" className="sr-only">
                Buscar destino
              </label>
              <input
                id="destination-search"
                type="search"
                name="q"
                placeholder="Buscar destino"
                defaultValue=""
                className="min-w-0 flex-1 bg-transparent py-3 text-base text-brand-ink outline-none placeholder:text-[#b8b8b8] sm:text-[1.08rem]"
              />
              <button
                type="submit"
                aria-label="Buscar destino"
                className="inline-flex h-14 w-14 items-center justify-center rounded-full text-black transition hover:bg-black/4"
              >
                <Image
                  src="/icons/magnifying-glass.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </button>
            </form>

            <div
              className="motion-fade-up mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-muted lg:justify-start"
              style={enterDelay("780ms")}
            >
              <span className="font-medium">Prueba:</span>
              <Link href="/search?q=france" className="landing-chip rounded-full bg-white/80 px-3 py-1.5 font-semibold text-brand-navy ring-1 ring-brand-navy/10 transition hover:text-brand-orange">
                Francia
              </Link>
              <Link href="/search?q=italy" className="landing-chip rounded-full bg-white/80 px-3 py-1.5 font-semibold text-brand-navy ring-1 ring-brand-navy/10 transition hover:text-brand-orange">
                Italia
              </Link>
              <Link href="/search?q=spain" className="landing-chip rounded-full bg-white/80 px-3 py-1.5 font-semibold text-brand-navy ring-1 ring-brand-navy/10 transition hover:text-brand-orange">
                España
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
