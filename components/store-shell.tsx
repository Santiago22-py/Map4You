import Link from "next/link";
import type { ReactNode } from "react";

import { PublicHeader } from "@/components/public-header";
import { StoreCartLink as StoreCartLinkClient } from "@/components/store-cart-link";

type StorePageShellProps = {
  title: string;
  children: ReactNode;
  compact?: boolean;
};

type StorePanelProps = {
  children: ReactNode;
  className?: string;
};

type StoreSearchFormProps = {
  action: string;
  placeholder?: string;
  defaultValue?: string;
  buttonLabel?: string;
};

export function StorePageShell({ title, children, compact = false }: StorePageShellProps) {
  return (
    <main className="flex-1 bg-[#f7efe8] pb-10 md:pb-14">
      <PublicHeader />

      <div className={`page-shell ${compact ? "pt-8 md:pt-10" : "pt-10 md:pt-12"}`}>
        <div className="space-y-8 md:space-y-10">
          <h1 className="text-balance text-center font-display text-[2.5rem] font-semibold tracking-[-0.05em] text-brand-burnt sm:text-[3.15rem]">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </main>
  );
}

export function StorePanel({ children, className = "" }: StorePanelProps) {
  return <section className={`rounded-[1.8rem] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.1)] ring-1 ring-black/10 sm:p-8 ${className}`}>{children}</section>;
}

export function StoreBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.08em] text-brand-navy/72 transition hover:text-brand-navy">
      <span aria-hidden="true" className="text-xl leading-none">←</span>
      {label}
    </Link>
  );
}

export function StoreSearchForm({ action, placeholder = "Escribir destino", defaultValue = "", buttonLabel = "Buscar" }: StoreSearchFormProps) {
  return (
    <form action={action} method="get" className="flex w-full max-w-[28rem] flex-col gap-3 sm:flex-row sm:items-center">
      <label htmlFor={`${action}-query`} className="sr-only">
        Buscar destino
      </label>
      <input
        id={`${action}-query`}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-full border border-black/35 bg-white px-5 py-3 text-base text-brand-ink outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/12"
      />
      <button type="submit" className="rounded-full bg-[linear-gradient(180deg,#5f8ae6,#244a9a)] px-7 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(36,74,154,0.24)] transition hover:-translate-y-0.5">
        {buttonLabel}
      </button>
    </form>
  );
}

export function StoreCartLink({ href = "/tienda/carrito", label = "Carrito demo" }: { href?: string; label?: string }) {
  return <StoreCartLinkClient href={href} label={label} />;
}