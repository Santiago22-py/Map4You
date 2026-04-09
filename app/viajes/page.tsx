import { redirect } from "next/navigation";

import { PublicHeader } from "@/components/public-header";
import { TripsView } from "@/components/trips-view";
import { getCurrentUser } from "@/lib/supabase/server";
import { getUserTrips } from "@/lib/trips-server";

export default async function TripsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth?next=/viajes");
  }

  const trips = await getUserTrips(user.id);

  return (
    <main className="flex-1 bg-[#f7efe8] pb-10 md:pb-14">
      <PublicHeader />
      <TripsView initialTrips={trips} />
    </main>
  );
}