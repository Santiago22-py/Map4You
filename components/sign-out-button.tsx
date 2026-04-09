"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);

    try {
      const supabase = createSupabaseBrowserClient();

      if (supabase) {
        await supabase.auth.signOut();
      }

      router.replace("/");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button type="button" onClick={handleSignOut} className="rounded-full border border-brand-navy/20 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-brand-navy transition hover:bg-brand-navy/5 disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending}>
      {isPending ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}