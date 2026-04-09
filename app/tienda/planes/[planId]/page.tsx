import { notFound } from "next/navigation";

import { AuthModal } from "@/components/auth-modal";
import { StorePlanActivationForm } from "@/components/store-plan-activation-form";
import { StoreBackLink, StorePageShell, StorePanel } from "@/components/store-shell";
import { getSubscriptionPlan } from "@/lib/fake-store";
import { hasSupabaseCredentials } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/user-profiles-server";

type StorePlanActivationPageProps = {
  params: Promise<{
    planId: string;
  }>;
};

export default async function StorePlanActivationPage({ params }: StorePlanActivationPageProps) {
  const { planId } = await params;
  const plan = getSubscriptionPlan(planId);

  if (!plan) {
    notFound();
  }

  const authReady = hasSupabaseCredentials();
  const authWarning = authReady ? null : "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <StorePageShell title={`Activa ${plan.title}`}>
        <div className="space-y-6">
          <StoreBackLink href="/tienda/planes" label="Volver a planes" />

          <StorePanel className="space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/55">Suscripción protegida</p>
            <h2 className="font-display text-[2rem] font-semibold tracking-[-0.05em] text-brand-blue">Inicia sesión para activar {plan.title}</h2>
            <p className="mx-auto max-w-[36rem] text-[1rem] leading-8 text-black/72">Necesitamos tu cuenta para rellenar automáticamente nombre y correo, y para que el flujo de activación demo quede asociado a tu perfil.</p>
          </StorePanel>

          <AuthModal
            open
            enabled={authReady}
            disabledReason={authWarning}
            closeHref="/tienda/planes"
            nextPath={`/tienda/planes/${plan.id}`}
            notice={`Necesitas iniciar sesión o registrarte para continuar con ${plan.title}.`}
          />
        </div>
      </StorePageShell>
    );
  }

  const profile = await ensureUserProfile(currentUser);
  const userName = profile.displayName || String(currentUser.user_metadata.full_name ?? currentUser.email?.split("@")[0] ?? "Viajero");
  const userEmail = currentUser.email ?? "correo-no-disponible@map4you.demo";

  return (
    <StorePageShell title={`Activa ${plan.title}`}>
      <div className="space-y-6">
        <StoreBackLink href="/tienda/planes" label="Volver a planes" />

        <StorePlanActivationForm plan={plan} userName={userName} userEmail={userEmail} />
      </div>
    </StorePageShell>
  );
}