import { notFound } from "next/navigation";

import { StoreEsimConfigurator } from "@/components/store-esim-configurator";
import { StoreBackLink, StorePageShell } from "@/components/store-shell";
import { esimPlans, getEsimDestination, type EsimPlan } from "@/lib/fake-store";

type StoreEsimDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    plan?: string;
  }>;
};

function isValidPlanId(value: string | undefined): value is EsimPlan["id"] {
  return esimPlans.some((p) => p.id === value);
}

export default async function StoreEsimDetailPage({ params, searchParams }: StoreEsimDetailPageProps) {
  const { slug } = await params;
  const destination = getEsimDestination(slug);

  if (!destination) {
    notFound();
  }

  const { plan } = await searchParams;
  const initialPlanId: EsimPlan["id"] = isValidPlanId(plan) ? plan : "estandar";

  return (
    <StorePageShell title="Consigue tu eSIM con Map4You">
      <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <div className="xl:col-span-2">
          <StoreBackLink href="/tienda/esim" label="Volver a eSIM" />
        </div>
        <StoreEsimConfigurator destination={destination} initialPlanId={initialPlanId} />
      </div>
    </StorePageShell>
  );
}