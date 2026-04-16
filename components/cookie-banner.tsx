"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "map4you_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function acceptAll() {
    localStorage.setItem(STORAGE_KEY, "all");
    setVisible(false);
  }

  function rejectNonEssential() {
    localStorage.setItem(STORAGE_KEY, "essential");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-navy/20 bg-white shadow-[0_-4px_24px_rgba(10,48,120,0.12)]">
      <div className="page-shell py-4 md:py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
          <div className="flex-1 text-sm text-foreground/80">
            <p>
              Utilizamos cookies propias estrictamente necesarias para el funcionamiento del Sitio Web (gestión de la
              sesión de usuario). No utilizamos cookies de análisis ni publicidad.{" "}
              <button
                onClick={() => setShowDetails((v) => !v)}
                className="underline hover:text-foreground transition-colors"
              >
                {showDetails ? "Ocultar detalles" : "Más información"}
              </button>{" "}
              o consulta nuestra{" "}
              <Link href="/legal/politica-cookies" className="underline hover:text-foreground transition-colors">
                Política de Cookies
              </Link>
              .
            </p>

            {showDetails && (
              <div className="mt-3 rounded-lg border border-brand-navy/15 bg-brand-cream p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-2 border-brand-blue bg-brand-blue">
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 8">
                      <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-xs">Cookies estrictamente necesarias</p>
                    <p className="text-xs text-muted mt-0.5">
                      Cookie de sesión de autenticación (Supabase). Permite mantener al usuario identificado mientras
                      navega. No puede desactivarse sin afectar al funcionamiento del Sitio Web.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-2 border-brand-navy/30 bg-white">
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-xs">Cookies analíticas y de terceros</p>
                    <p className="text-xs text-muted mt-0.5">
                      No se utilizan en este Sitio Web.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col md:items-end lg:flex-row">
            <button
              onClick={rejectNonEssential}
              className="rounded-lg border border-brand-navy/25 bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-brand-navy/5 transition-colors"
            >
              Solo esenciales
            </button>
            <button
              onClick={acceptAll}
              className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-brand-burnt transition-colors"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
