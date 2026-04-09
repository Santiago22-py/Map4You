import type { UserProfile } from "@/lib/user-profiles";

export type SocialProfile = Pick<UserProfile, "avatarUrl" | "displayName" | "userId" | "username">;

export type FriendSummary = SocialProfile & {
  friendsSince: string;
};

export type FriendRequestSummary = SocialProfile & {
  createdAt: string;
  direction: "incoming" | "outgoing";
  requestId: string;
};

export type SocialMessage = {
  content: string;
  createdAt: string;
  id: string;
  recipientUserId: string;
  senderUserId: string;
};

export function getFriendshipPair(leftUserId: string, rightUserId: string) {
  return leftUserId < rightUserId ? [leftUserId, rightUserId] : [rightUserId, leftUserId];
}

export function getFriendCountLabel(count: number) {
  return `${count} ${count === 1 ? "amigo" : "amigos"}`;
}

export function getFriendRequestCountLabel(count: number) {
  return `${count} ${count === 1 ? "solicitud" : "solicitudes"}`;
}

export function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
