"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthPanel } from "@/components/auth-panel";

type AuthModalProps = {
  closeHref?: string;
  disabledReason?: string | null;
  enabled: boolean;
  error?: string;
  notice?: string;
  onClose?: () => void;
  open: boolean;
};

export function AuthModal({ closeHref, disabledReason, enabled, error, notice, onClose, open }: AuthModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (onClose) {
          onClose();
          return;
        }

        if (closeHref) {
          router.push(closeHref);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeHref, onClose, open, router]);

  if (!open) {
    return null;
  }

  function handleClose() {
    if (onClose) {
      onClose();
      return;
    }

    if (closeHref) {
      router.push(closeHref);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#c98a60]/28 px-4 py-8 backdrop-blur-[6px]" onClick={handleClose}>
      <section className="relative w-full max-w-[68rem] rounded-[1.9rem] bg-white px-7 py-8 shadow-[0_18px_42px_rgba(0,0,0,0.16)] ring-1 ring-black/8 sm:px-10 sm:py-10 lg:px-14 lg:py-12" aria-modal="true" role="dialog" onClick={(event) => event.stopPropagation()}>
        <button type="button" aria-label="Cerrar" onClick={handleClose} className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-black/5">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12" />
            <path d="M18 6 6 18" />
          </svg>
        </button>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {notice ? (
          <div className="mb-6 rounded-2xl border border-brand-navy/15 bg-brand-navy/5 px-4 py-3 text-sm text-brand-navy">{notice}</div>
        ) : null}

        {!enabled ? (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {disabledReason ?? "Configura las credenciales de Supabase para activar la autenticación."}
          </div>
        ) : null}

        <AuthPanel enabled={enabled} />
      </section>
    </div>
  );
}