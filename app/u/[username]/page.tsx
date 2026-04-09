import { redirect } from "next/navigation";

import { ProfileView } from "@/components/profile-view";
import { PublicHeader } from "@/components/public-header";
import { getPublicTravelAlbumsByUserId } from "@/lib/travel-albums-server";
import { getProfileByUsername } from "@/lib/user-profiles-server";

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

  const albums = await getPublicTravelAlbumsByUserId(profile.userId);

  return (
    <main className="flex-1 bg-[#f7efe8] pb-10 md:pb-14">
      <PublicHeader />

      <div className="page-shell pt-10 md:pt-12">
        <ProfileView albumBasePath={`/u/${profile.username}/albums`} initialAlbums={albums} profile={profile} readOnly />
      </div>
    </main>
  );
}
