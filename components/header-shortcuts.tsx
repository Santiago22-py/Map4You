"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useState } from "react";

import { AuthModal } from "@/components/auth-modal";

type HeaderShortcutsProps = {
  animated?: boolean;
  authEnabled: boolean;
  authWarning?: string | null;
  currentUser: boolean;
};

const baseIcons = [
  {
    alt: "Buscar",
    href: "/",
    src: "/icons/magnifying-glass.svg",
    width: 31,
    height: 31,
  },
  {
    alt: "Mapa",
    href: "/search?q=france",
    src: "/icons/map.svg",
    width: 37,
    height: 33,
  },
  {
    alt: "Viajes",
    href: "/search?q=italy",
    src: "/icons/suitcase.svg",
    width: 38,
    height: 35,
  },
];

function getEnterDelay(index: number): CSSProperties | undefined {
  return { "--enter-delay": `${120 + index * 70}ms` } as CSSProperties;
}

export function HeaderShortcuts({ animated = false, authEnabled, authWarning, currentUser }: HeaderShortcutsProps) {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center gap-4 sm:gap-5 md:gap-7" aria-label="Accesos directos principales">
        {baseIcons.map((icon, index) => (
          <Link key={icon.alt} href={icon.href} className={animated ? "landing-icon-link motion-fade-up" : "landing-icon-link"} aria-label={icon.alt} style={animated ? getEnterDelay(index) : undefined}>
            <Image src={icon.src} alt="" width={icon.width} height={icon.height} className="h-auto w-6 sm:w-7 md:w-auto" />
          </Link>
        ))}

        {currentUser ? (
          <Link href="/profile" className={animated ? "landing-icon-link motion-fade-up" : "landing-icon-link"} aria-label="Perfil" style={animated ? getEnterDelay(baseIcons.length) : undefined}>
            <Image src="/icons/profile.svg" alt="" width={46} height={46} className="h-auto w-6 sm:w-7 md:w-auto" />
          </Link>
        ) : (
          <button type="button" onClick={() => setAuthOpen(true)} className={animated ? "landing-icon-link motion-fade-up" : "landing-icon-link"} aria-label="Perfil" style={animated ? getEnterDelay(baseIcons.length) : undefined}>
            <Image src="/icons/profile.svg" alt="" width={46} height={46} className="h-auto w-6 sm:w-7 md:w-auto" />
          </button>
        )}
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} enabled={authEnabled} disabledReason={authWarning} />
    </>
  );
}