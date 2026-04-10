import type { SocialUnreadSummary } from "@/lib/social";

const socialUnreadStoragePrefix = "map4you.social-unread-seen";

type SocialUnreadSeenMap = Record<string, string>;

function getSocialUnreadStorageKey(userId: string) {
  return `${socialUnreadStoragePrefix}:${userId}`;
}

export function getSocialUnreadSeenMap(userId: string) {
  if (typeof window === "undefined") {
    return {} as SocialUnreadSeenMap;
  }

  try {
    const raw = window.localStorage.getItem(getSocialUnreadStorageKey(userId));
    return raw ? (JSON.parse(raw) as SocialUnreadSeenMap) : {};
  } catch {
    return {} as SocialUnreadSeenMap;
  }
}

function persistSocialUnreadSeenMap(userId: string, nextMap: SocialUnreadSeenMap) {
  window.localStorage.setItem(getSocialUnreadStorageKey(userId), JSON.stringify(nextMap));
}

export function isUnreadSummaryUnread(summary: SocialUnreadSummary, seenMap: SocialUnreadSeenMap) {
  const seenAt = seenMap[summary.userId];

  if (!seenAt) {
    return true;
  }

  return new Date(summary.latestIncomingMessageAt).getTime() > new Date(seenAt).getTime();
}

export function getUnreadFriendIds(summaries: SocialUnreadSummary[], seenMap: SocialUnreadSeenMap) {
  return summaries.filter((summary) => isUnreadSummaryUnread(summary, seenMap)).map((summary) => summary.userId);
}

export function markFriendConversationSeen(userId: string, friendUserId: string, seenAt: string) {
  if (typeof window === "undefined") {
    return;
  }

  const currentMap = getSocialUnreadSeenMap(userId);
  const currentValue = currentMap[friendUserId];

  if (currentValue && new Date(currentValue).getTime() >= new Date(seenAt).getTime()) {
    return;
  }

  persistSocialUnreadSeenMap(userId, {
    ...currentMap,
    [friendUserId]: seenAt,
  });

  window.dispatchEvent(new CustomEvent("social-unread-updated"));
}