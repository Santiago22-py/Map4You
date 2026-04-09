"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { siteUrl } from "@/lib/supabase/config";

type AuthPanelProps = {
  enabled: boolean;
};

function getFriendlyErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "No se pudo completar la autenticación.";
  }

  const code = error.message;

  if (code.includes("already registered") || code.includes("already been registered") || code.includes("User already registered")) {
    return "Ese correo ya está registrado.";
  }

  if (code.includes("Invalid login credentials") || code.includes("Email not confirmed")) {
    return "No se pudo iniciar sesión. Revisa tus credenciales.";
  }

  if (code.includes("Password should be at least") || code.includes("weak_password")) {
    return "La contraseña debe ser más segura.";
  }

  return "No se pudo completar la autenticación.";
}

export function AuthPanel({ enabled }: AuthPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loadingMode, setLoadingMode] = useState<"signin" | "signup" | "google" | null>(null);

  async function handleEmailSignIn(formData: FormData) {
    if (!enabled) {
      return;
    }

    setLoadingMode("signin");
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Supabase no está configurado.");
      }

      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        throw signInError;
      }

      router.replace("/profile");
      router.refresh();
    } catch (caughtError) {
      setError(getFriendlyErrorMessage(caughtError));
    } finally {
      setLoadingMode(null);
    }
  }

  async function handleEmailSignUp(formData: FormData) {
    if (!enabled) {
      return;
    }

    setLoadingMode("signup");
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Supabase no está configurado.");
      }

      const fullName = String(formData.get("fullName") ?? "").trim();
      const email = String(formData.get("signupEmail") ?? "").trim();
      const password = String(formData.get("signupPassword") ?? "");
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!data.session) {
        router.replace("/auth?notice=Revisa tu correo para confirmar la cuenta antes de entrar.");
        return;
      }

      router.replace("/profile");
      router.refresh();
    } catch (caughtError) {
      setError(getFriendlyErrorMessage(caughtError));
    } finally {
      setLoadingMode(null);
    }
  }

  async function handleGoogleSignIn() {
    if (!enabled) {
      return;
    }

    setLoadingMode("google");
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Supabase no está configurado.");
      }

      const redirectBase = typeof window !== "undefined" ? window.location.origin : siteUrl;
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${redirectBase}/auth/callback?next=/profile`,
          queryParams: { prompt: "select_account" },
        },
      });

      if (oauthError) {
        throw oauthError;
      }

      if (data.url) {
        window.location.assign(data.url);
      }
    } catch (caughtError) {
      setError(getFriendlyErrorMessage(caughtError));
    } finally {
      setLoadingMode(null);
    }
  }

  return (
    <>
      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:gap-12">
        <div>
          <h1 className="font-display text-[2.25rem] font-semibold uppercase tracking-[-0.05em] text-brand-navy sm:text-[2.7rem]">Iniciar sesión</h1>

          <form action={handleEmailSignIn} className="mt-8 space-y-5">
            <div>
              <label htmlFor="signin-email" className="mb-2 block text-xl text-black/85">Correo electrónico</label>
              <input id="signin-email" name="email" type="email" autoComplete="email" placeholder="Introduce tu correo electrónico" className="w-full rounded-[0.9rem] border border-black/12 px-5 py-3 text-lg outline-none transition focus:border-brand-navy/35" required />
            </div>

            <div>
              <label htmlFor="signin-password" className="mb-2 block text-xl text-black/85">Contraseña</label>
              <input id="signin-password" name="password" type="password" autoComplete="current-password" placeholder="Introduce tu contraseña" className="w-full rounded-[0.9rem] border border-black/12 px-5 py-3 text-lg outline-none transition focus:border-brand-navy/35" required />
            </div>

            <button type="submit" className="w-full rounded-[0.75rem] bg-brand-navy px-5 py-3 text-xl font-semibold uppercase text-white transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-50" disabled={!enabled || loadingMode !== null}>
              {loadingMode === "signin" ? "Entrando..." : "Acceder"}
            </button>
          </form>

          <button type="button" onClick={() => void handleGoogleSignIn()} className="mt-3 flex w-full items-center justify-center gap-3 rounded-[0.75rem] bg-[#e8ecef] px-5 py-3 text-lg font-medium uppercase text-black transition hover:bg-[#dfe5e9] disabled:cursor-not-allowed disabled:opacity-50" disabled={!enabled || loadingMode !== null}>
            Acceder con Google
            <Image src="/icons/icons8-google-480.svg" alt="Google" width={42} height={39} className="h-[2rem] w-[2.15rem]" />
          </button>
        </div>

        <div className="hidden bg-[#d8b49e] lg:block" />

        <div>
          <h2 className="font-display text-[2.25rem] font-semibold uppercase tracking-[-0.05em] text-brand-burnt sm:text-[2.7rem]">Registro</h2>

          <form action={handleEmailSignUp} className="mt-8 space-y-5">
            <div>
              <label htmlFor="signup-name" className="mb-2 block text-xl text-black/85">Nombre y apellidos</label>
              <input id="signup-name" name="fullName" type="text" autoComplete="name" placeholder="Daniela García" className="w-full rounded-[0.9rem] border border-black/12 px-5 py-3 text-lg outline-none transition focus:border-brand-burnt/35" required />
            </div>

            <div>
              <label htmlFor="signup-email" className="mb-2 block text-xl text-black/85">Correo electrónico</label>
              <input id="signup-email" name="signupEmail" type="email" autoComplete="email" placeholder="danielagarcia@gmail.com" className="w-full rounded-[0.9rem] border border-black/12 px-5 py-3 text-lg outline-none transition focus:border-brand-burnt/35" required />
            </div>

            <div>
              <label htmlFor="signup-password" className="mb-2 block text-xl text-black/85">Contraseña</label>
              <input id="signup-password" name="signupPassword" type="password" autoComplete="new-password" placeholder="**************" className="w-full rounded-[0.9rem] border border-black/12 px-5 py-3 text-lg outline-none transition focus:border-brand-burnt/35" required />
            </div>

            <button type="submit" className="w-full rounded-[0.75rem] bg-brand-burnt px-5 py-3 text-xl font-semibold uppercase text-white transition hover:bg-[#ac3900] disabled:cursor-not-allowed disabled:opacity-50" disabled={!enabled || loadingMode !== null}>
              {loadingMode === "signup" ? "Creando cuenta..." : "Registrar"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}