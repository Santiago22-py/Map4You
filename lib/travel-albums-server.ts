import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTravelAlbumPublicUrl, type TravelAlbum, type TravelAlbumPhoto } from "@/lib/travel-albums";

type TravelAlbumRow = {
  cover_path: string | null;
  created_at: string;
  id: string;
  title: string;
};

type TravelAlbumPhotoRow = {
  album_id: string;
  id: string;
  sort_order: number;
  storage_path: string;
};

function mapTravelAlbums(albums: TravelAlbumRow[], photos: TravelAlbumPhotoRow[], supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>) {
  const photosByAlbum = new Map<string, TravelAlbumPhoto[]>();

  for (const photo of photos) {
    const albumPhotos = photosByAlbum.get(photo.album_id) ?? [];

    albumPhotos.push({
      id: photo.id,
      path: photo.storage_path,
      sortOrder: photo.sort_order,
      url: getTravelAlbumPublicUrl(supabase, photo.storage_path),
    });

    photosByAlbum.set(photo.album_id, albumPhotos);
  }

  return albums.map((album) => {
    const albumPhotos = photosByAlbum.get(album.id) ?? [];

    return {
      coverPath: album.cover_path,
      coverUrl: album.cover_path ? getTravelAlbumPublicUrl(supabase, album.cover_path) : albumPhotos[0]?.url ?? null,
      createdAt: album.created_at,
      id: album.id,
      photoCount: albumPhotos.length,
      photos: albumPhotos,
      title: album.title,
    };
  });
}

export async function getUserTravelAlbums(userId: string): Promise<TravelAlbum[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data: albums, error: albumsError } = await supabase
    .from("travel_albums")
    .select("id, title, cover_path, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (albumsError || !albums?.length) {
    return [];
  }

  const albumRows = albums as TravelAlbumRow[];
  const albumIds = albumRows.map((album) => album.id);

  const { data: photos } = await supabase
    .from("travel_album_photos")
    .select("id, album_id, storage_path, sort_order")
    .in("album_id", albumIds)
    .order("sort_order", { ascending: true });

  return mapTravelAlbums(albumRows, (photos as TravelAlbumPhotoRow[] | null) ?? [], supabase);
}

export async function getUserTravelAlbum(userId: string, albumId: string): Promise<TravelAlbum | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data: album, error: albumError } = await supabase
    .from("travel_albums")
    .select("id, title, cover_path, created_at")
    .eq("user_id", userId)
    .eq("id", albumId)
    .maybeSingle();

  if (albumError || !album) {
    return null;
  }

  const { data: photos } = await supabase
    .from("travel_album_photos")
    .select("id, album_id, storage_path, sort_order")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true });

  return mapTravelAlbums([album as TravelAlbumRow], (photos as TravelAlbumPhotoRow[] | null) ?? [], supabase)[0] ?? null;
}