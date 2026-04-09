import { redirect } from "next/navigation";

import { ProfileView } from "@/components/profile-view";
import { PublicHeader } from "@/components/public-header";
import { getPublicFriendCountByUserId } from "@/lib/social-server";
import { getPublicTravelAlbumsByUserId } from "@/lib/travel-albums-server";
import { getPublicVisitedCityCountByUserId } from "@/lib/trips-server";
import { getProfileByUsername } from "@/lib/user-profiles-server";
import { getPublicVisitedCountriesByUserId } from "@/lib/visited-countries-server";

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    redirect("/");
  }

  const [albums, friendCount, visitedCitiesCount, visitedCountries] = await Promise.all([getPublicTravelAlbumsByUserId(profile.userId), getPublicFriendCountByUserId(profile.userId), getPublicVisitedCityCountByUserId(profile.userId), getPublicVisitedCountriesByUserId(profile.userId)]);

  return (
    <main className="flex-1 bg-[#f7efe8] pb-10 md:pb-14">
      <PublicHeader />

      <div className="page-shell pt-10 md:pt-12">
        <ProfileView albumBasePath={`/u/${profile.username}/albums`} friendCount={friendCount} initialAlbums={albums} profile={profile} readOnly visitedCityCount={visitedCitiesCount} visitedCountries={visitedCountries} />
      </div>
    </main>
  );
}
