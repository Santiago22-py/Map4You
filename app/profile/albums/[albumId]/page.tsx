import { redirect } from "next/navigation";

import { AlbumDetailView } from "@/components/album-detail-view";
import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/supabase/server";
import { getUserTravelAlbum } from "@/lib/travel-albums-server";

type AlbumDetailPageProps = {
  params: Promise<{
    albumId: string;
  }>;
};

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
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
      <AlbumDetailView album={album} />
    </>
  );
}