"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { AuthModal } from "@/components/auth-modal";
import { getSocialUnreadSeenMap, getUnreadFriendIds } from "@/lib/social-unread";
import type { SocialUnreadSummary } from "@/lib/social";

type HeaderShortcutsProps = {
  animated?: boolean;
  authEnabled: boolean;
  authWarning?: string | null;
  currentUser: boolean;
  currentUserId?: string | null;
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
    href: "/mapa",
    src: "/icons/map.svg",
    width: 37,
    height: 33,
  },
  {
    alt: "Viajes",
    href: "/viajes",
    src: "/icons/suitcase.svg",
    width: 38,
    height: 35,
  },
  {
    alt: "Tienda",
    href: "/tienda",
    src: "/icons/airplane.svg",
    width: 37,
    height: 37,
  },
];

function getEnterDelay(index: number): CSSProperties | undefined {
  return { "--enter-delay": `${120 + index * 70}ms` } as CSSProperties;
}

export function HeaderShortcuts({ animated = false, authEnabled, authWarning, currentUser, currentUserId = null }: HeaderShortcutsProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [unreadFriendIds, setUnreadFriendIds] = useState<string[]>([]);
  const hasUnreadMessages = currentUser && currentUserId ? unreadFriendIds.length > 0 : false;

  useEffect(() => {
    if (!currentUser || !currentUserId) {
      return;
    }

    const userId = currentUserId;
    let active = true;

    async function syncUnreadState() {
      try {
        const response = await fetch("/api/social/unread-summary", { cache: "no-store" });
        const payload = (await response.json()) as { summaries?: SocialUnreadSummary[] };

        if (!response.ok || !active) {
          return;
        }

        const unreadFriendIds = getUnreadFriendIds(payload.summaries ?? [], getSocialUnreadSeenMap(userId));
        setUnreadFriendIds(unreadFriendIds);
      } catch {
        if (active) {
          setUnreadFriendIds([]);
        }
      }
    }

    void syncUnreadState();

    const intervalId = window.setInterval(() => {
      void syncUnreadState();
    }, 30000);

    const handleUnreadUpdate = () => {
      void syncUnreadState();
    };

    window.addEventListener("storage", handleUnreadUpdate);
    window.addEventListener("social-unread-updated", handleUnreadUpdate);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("storage", handleUnreadUpdate);
      window.removeEventListener("social-unread-updated", handleUnreadUpdate);
    };
  }, [currentUser, currentUserId]);

  return (
    <>
      <nav className="flex items-center gap-4 sm:gap-5 md:gap-7" aria-label="Accesos directos principales">
        {baseIcons.map((icon, index) => (
          <Link key={icon.alt} href={icon.href} className={animated ? "landing-icon-link motion-fade-up" : "landing-icon-link"} aria-label={icon.alt} style={animated ? getEnterDelay(index) : undefined}>
            <Image src={icon.src} alt="" width={icon.width} height={icon.height} className="h-auto w-6 sm:w-7 md:w-auto" />
          </Link>
        ))}

        {currentUser ? (
          <Link href="/profile" className={animated ? "landing-icon-link motion-fade-up relative" : "landing-icon-link relative"} aria-label="Perfil" style={animated ? getEnterDelay(baseIcons.length) : undefined}>
            <Image src="/icons/profile.svg" alt="" width={46} height={46} className="h-auto w-6 sm:w-7 md:w-auto" />
            {hasUnreadMessages ? <span aria-hidden="true" className="absolute bottom-[0.15rem] right-0 h-2.5 w-2.5 rounded-full bg-[#d71c1c] ring-2 ring-[#f7efe8] sm:h-3 sm:w-3" /> : null}
          </Link>
        ) : (
          <button type="button" onClick={() => setAuthOpen(true)} className={animated ? "landing-icon-link motion-fade-up relative" : "landing-icon-link relative"} aria-label="Perfil" style={animated ? getEnterDelay(baseIcons.length) : undefined}>
            <Image src="/icons/profile.svg" alt="" width={46} height={46} className="h-auto w-6 sm:w-7 md:w-auto" />
          </button>
        )}
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} enabled={authEnabled} disabledReason={authWarning} />
    </>
  );
}