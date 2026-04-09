export const travelAlbumBucket = "travel-albums";

export type TravelAlbumPhoto = {
  id: string;
  path: string;
  sortOrder: number;
  url: string;
};

export type TravelAlbum = {
  coverPath: string | null;
  coverUrl: string | null;
  createdAt: string;
  id: string;
  photoCount: number;
  photos: TravelAlbumPhoto[];
  title: string;
};

type AlbumStorageClient = {
  storage: {
    from(bucket: string): {
      getPublicUrl(path: string): {
        data: {
          publicUrl: string;
        };
      };
    };
  };
};

export function getTravelAlbumPublicUrl(client: AlbumStorageClient, path: string) {
  return client.storage.from(travelAlbumBucket).getPublicUrl(path).data.publicUrl;
}

export function getTravelAlbumStoragePath(userId: string, albumId: string, index: number, fileName: string) {
  const segments = fileName.split(".");
  const extension = segments.length > 1 ? segments.at(-1) : null;
  const safeExtension = extension ? extension.toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const timestamp = Date.now();

  return `${userId}/${albumId}/${timestamp}-${index}.${safeExtension || "jpg"}`;
}