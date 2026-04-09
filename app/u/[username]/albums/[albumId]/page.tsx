import { redirect } from "next/navigation";

import { AlbumDetailView } from "@/components/album-detail-view";
import { PublicHeader } from "@/components/public-header";
import { getPublicTravelAlbum } from "@/lib/travel-albums-server";
import { getProfileByUsername } from "@/lib/user-profiles-server";

type PublicAlbumDetailPageProps = {
  params: Promise<{
    albumId: string;
    username: string;
  }>;
};

export default async function PublicAlbumDetailPage({ params }: PublicAlbumDetailPageProps) {
  const { albumId, username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    redirect("/");
  }

  if (username !== profile.username) {
    redirect(`/u/${profile.username}/albums/${albumId}`);
  }

  const album = await getPublicTravelAlbum(profile.userId, albumId);

  if (!album) {
    redirect(`/u/${profile.username}`);
  }

  return (
    <>
      <PublicHeader />
      <AlbumDetailView album={album} backHref={`/u/${profile.username}`} backLabel={`Volver al perfil de @${profile.username}`} checkoutHref={`/u/${profile.username}/albums/${album.id}/print`} readOnly />
    </>
  );
}