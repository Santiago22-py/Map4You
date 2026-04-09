import { redirect } from "next/navigation";

import { ProfileView } from "@/components/profile-view";
import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/supabase/server";
import { getUserTravelAlbums } from "@/lib/travel-albums-server";
import { getUserVisitedCityCount } from "@/lib/trips-server";
import { ensureUserProfile } from "@/lib/user-profiles-server";
import { getUserVisitedCountries } from "@/lib/visited-countries-server";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  const [profile, albums, visitedCitiesCount, visitedCountries] = await Promise.all([ensureUserProfile(user), getUserTravelAlbums(user.id), getUserVisitedCityCount(user.id), getUserVisitedCountries(user.id)]);

  return (
    <main className="flex-1 bg-[#f7efe8] pb-10 md:pb-14">
      <PublicHeader />

      <div className="page-shell pt-10 md:pt-12">
        <ProfileView albumBasePath="/profile/albums" initialAlbums={albums} profile={profile} visitedCityCount={visitedCitiesCount} visitedCountries={visitedCountries} />
      </div>
    </main>
  );
}