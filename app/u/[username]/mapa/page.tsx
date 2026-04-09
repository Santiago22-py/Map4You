import { redirect } from "next/navigation";

import { PublicHeader } from "@/components/public-header";
import { VisitedCountriesMap } from "@/components/visited-countries-map";
import { getPublicVisitedCitiesByUserId } from "@/lib/visited-cities-server";
import { getProfileByUsername } from "@/lib/user-profiles-server";
import { getPublicVisitedCountriesByUserId } from "@/lib/visited-countries-server";

type PublicProfileMapPageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PublicProfileMapPage({ params }: PublicProfileMapPageProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    redirect("/");
  }

  if (username !== profile.username) {
    redirect(`/u/${profile.username}/mapa`);
  }

  const [visitedCountries, visitedCities] = await Promise.all([getPublicVisitedCountriesByUserId(profile.userId), getPublicVisitedCitiesByUserId(profile.userId)]);

  return (
    <main className="flex-1 bg-[#f7efe8] pb-10 md:pb-14">
      <PublicHeader />

      <div className="page-shell pt-10 md:pt-12">
        <VisitedCountriesMap initialVisitedCountries={visitedCountries} initialVisitedCities={visitedCities} profile={profile} profileHref={`/u/${profile.username}`} readOnly />
      </div>
    </main>
  );
}