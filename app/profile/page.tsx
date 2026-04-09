import { redirect } from "next/navigation";

import { ProfileView } from "@/components/profile-view";
import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/supabase/server";
import { getUserTravelAlbums } from "@/lib/travel-albums-server";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  const displayName = String(user.user_metadata.full_name ?? user.email?.split("@")[0] ?? "Viajero");
  const username = user.email ? `@${user.email.split("@")[0]}` : "@map4you";
  const albums = await getUserTravelAlbums(user.id);

  return (
    <main className="flex-1 bg-[#f7efe8] pb-10 md:pb-14">
      <PublicHeader />

      <div className="page-shell pt-10 md:pt-12">
        <ProfileView displayName={displayName} initialAlbums={albums} username={username} />
      </div>
    </main>
  );
}