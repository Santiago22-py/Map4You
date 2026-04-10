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

export type SocialUnreadSummary = SocialProfile & {
  latestIncomingMessageAt: string;
};

export function isValidUserId(value: string) {
  return /^[0-9a-fA-F-]{20,}$/.test(value);
}

export function isValidRequestId(value: string) {
  return /^[0-9a-fA-F-]{20,}$/.test(value);
}

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

export function formatMessageDayLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const messageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (messageDay.getTime() === today.getTime()) {
    return "Hoy";
  }

  if (messageDay.getTime() === yesterday.getTime()) {
    return "Ayer";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: messageDay.getFullYear() === today.getFullYear() ? undefined : "numeric",
  }).format(date);
}
