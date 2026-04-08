import Image from "next/image";
import Link from "next/link";

const headerIcons = [
  {
    alt: "Search",
    href: "/search?q=france",
    src: "/icons/magnifying-glass.svg",
    width: 31,
    height: 31,
  },
  {
    alt: "Map",
    href: "/search?q=france",
    src: "/icons/map.svg",
    width: 37,
    height: 33,
  },
  {
    alt: "Trips",
    href: "/search?q=italy",
    src: "/icons/suitcase.svg",
    width: 38,
    height: 35,
  },
  {
    alt: "Profile",
    href: "/places/paris?title=Paris&country=France",
    src: "/icons/profile.svg",
    width: 46,
    height: 46,
  },
];

export function PublicHeader() {
  return (
    <>
      <header className="page-shell flex items-center justify-between gap-4 px-1 pt-6 md:pt-10">
        <Link href="/" className="shrink-0 w-[132px] md:w-[168px]">
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

        <nav className="flex items-center gap-4 sm:gap-5 md:gap-7" aria-label="Primary shortcuts">
          {headerIcons.map((icon) => (
            <Link key={icon.alt} href={icon.href} className="landing-icon-link" aria-label={icon.alt}>
              <Image
                src={icon.src}
                alt=""
                width={icon.width}
                height={icon.height}
                className="h-auto w-6 sm:w-7 md:w-auto"
              />
            </Link>
          ))}
        </nav>
      </header>

      <div className="mt-6 w-full border-t border-brand-navy/25 shadow-[0_2px_10px_rgba(10,48,120,0.09)] md:mt-8" />
    </>
  );
}