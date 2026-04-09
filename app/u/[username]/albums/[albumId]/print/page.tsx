import { redirect } from "next/navigation";

import { AlbumPrintCheckoutView } from "@/components/album-print-checkout-view";
import { PublicHeader } from "@/components/public-header";
import { getPublicTravelAlbum } from "@/lib/travel-albums-server";
import { getProfileByUsername } from "@/lib/user-profiles-server";

type PublicAlbumPrintPageProps = {
  params: Promise<{
    albumId: string;
    username: string;
  }>;
};

export default async function PublicAlbumPrintPage({ params }: PublicAlbumPrintPageProps) {
  const { albumId, username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    redirect("/");
  }

  if (username !== profile.username) {
    redirect(`/u/${profile.username}/albums/${albumId}/print`);
  }

  const album = await getPublicTravelAlbum(profile.userId, albumId);

  if (!album) {
    redirect(`/u/${profile.username}`);
  }

  return (
    <>
      <PublicHeader />
      <AlbumPrintCheckoutView album={album} backHref={`/u/${profile.username}/albums/${album.id}`} backLabel={`Volver al álbum de @${profile.username}`} isPublicPreview />
    </>
  );
}
