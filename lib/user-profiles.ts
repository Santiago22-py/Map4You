export const profileImageBucket = "profile-images";

export const maxProfileDisplayNameLength = 60;
export const maxProfileUsernameLength = 32;

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

export function sanitizeUsername(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, maxProfileUsernameLength);
}

export function normalizeDisplayName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxProfileDisplayNameLength);
}

export function getDisplayNameValidationError(value: string) {
  const normalizedValue = normalizeDisplayName(value);

  if (!normalizedValue) {
    return "Escribe tu nombre visible.";
  }

  if (normalizedValue.length < 2) {
    return "El nombre visible debe tener al menos 2 caracteres.";
  }

  return null;
}

export function getUsernameValidationError(value: string) {
  const normalizedValue = sanitizeUsername(value);

  if (!value.trim()) {
    return "Escribe tu nombre de usuario.";
  }

  if (!normalizedValue) {
    return "El usuario solo puede incluir letras, numeros y guiones bajos.";
  }

  if (normalizedValue.length < 3) {
    return "El usuario debe tener al menos 3 caracteres.";
  }

  return null;
}

export function getProfileImagePublicUrl(client: ProfileStorageClient, path: string) {
  return client.storage.from(profileImageBucket).getPublicUrl(path).data.publicUrl;
}

export function getProfileImageStoragePath(userId: string, fileName: string) {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExtension = fileExtension.replace(/[^a-z0-9]/g, "");
  const timestamp = Date.now();

  return `${userId}/avatar-${timestamp}.${safeExtension || "jpg"}`;
}
