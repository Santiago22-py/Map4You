import { redirect } from "next/navigation";

import { PublicHeader } from "@/components/public-header";
import { VisitedCountriesMap } from "@/components/visited-countries-map";
import { getCurrentUser } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/user-profiles-server";
import { getUserVisitedCountries } from "@/lib/visited-countries-server";

export default async function MapPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth?next=/mapa");
  }

  const [profile, visitedCountries] = await Promise.all([ensureUserProfile(user), getUserVisitedCountries(user.id)]);

  return (
    <main className="flex-1 bg-[#f7efe8] pb-10 md:pb-14">
      <PublicHeader />

      <div className="page-shell pt-10 md:pt-12">
        <VisitedCountriesMap initialVisitedCountries={visitedCountries} profile={profile} />
      </div>
    </main>
  );
}