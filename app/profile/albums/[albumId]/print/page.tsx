import { redirect } from "next/navigation";

import { AlbumPrintCheckoutView } from "@/components/album-print-checkout-view";
import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/supabase/server";
import { getUserTravelAlbum } from "@/lib/travel-albums-server";

type AlbumPrintPageProps = {
  params: Promise<{
    albumId: string;
  }>;
};

export default async function AlbumPrintPage({ params }: AlbumPrintPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  const { albumId } = await params;
  const album = await getUserTravelAlbum(user.id, albumId);

  if (!album) {
    redirect("/profile");
  }

  return (
    <>
      <PublicHeader />
      <AlbumPrintCheckoutView album={album} backHref={`/profile/albums/${album.id}`} backLabel="Volver al álbum" />
    </>
  );
}
