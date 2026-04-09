import { notFound } from "next/navigation";

import { StoreEsimConfigurator } from "@/components/store-esim-configurator";
import { StoreBackLink, StorePageShell } from "@/components/store-shell";
import { clampEsimGbPerDay, getEsimDestination } from "@/lib/fake-store";

type StoreEsimDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    gbPerDay?: string;
    start?: string;
    end?: string;
  }>;
};

function isoDateAfter(daysFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

export default async function StoreEsimDetailPage({ params, searchParams }: StoreEsimDetailPageProps) {
  const { slug } = await params;
  const destination = getEsimDestination(slug);

  if (!destination) {
    notFound();
  }

  const { gbPerDay, start, end } = await searchParams;
  const selectedGbPerDay = clampEsimGbPerDay(destination, gbPerDay ? Number(gbPerDay) : null);
  const startDate = start ?? isoDateAfter(7);
  const endDate = end ?? isoDateAfter(16);

  return (
    <StorePageShell title="Consigue tu eSIM con Map4You">
      <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <div className="xl:col-span-2">
          <StoreBackLink href="/tienda/esim" label="Volver a eSIM" />
        </div>
        <StoreEsimConfigurator destination={destination} initialGbPerDay={selectedGbPerDay} initialStartDate={startDate} initialEndDate={endDate} />
      </div>
    </StorePageShell>
  );
}