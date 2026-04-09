export const profileImageBucket = "profile-images";

type ProfileStorageClient = {
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

export type UserProfile = {
  avatarPath: string | null;
  avatarUrl: string | null;
  bio: string | null;
  displayName: string;
  userId: string;
  username: string;
};

export function getProfileImagePublicUrl(client: ProfileStorageClient, path: string) {
  return client.storage.from(profileImageBucket).getPublicUrl(path).data.publicUrl;
}

export function getProfileImageStoragePath(userId: string, fileName: string) {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExtension = fileExtension.replace(/[^a-z0-9]/g, "");
  const timestamp = Date.now();

  return `${userId}/avatar-${timestamp}.${safeExtension || "jpg"}`;
}
