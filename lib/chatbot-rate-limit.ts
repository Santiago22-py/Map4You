type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 12;
const rateLimitStore = new Map<string, RateLimitEntry>();

function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function getChatbotClientId(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "anonymous";
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  const connectIp = request.headers.get("cf-connecting-ip");

  if (connectIp) {
    return connectIp.trim();
  }

  return "anonymous";
}

export function checkChatbotRateLimit(clientId: string): RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const existingEntry = rateLimitStore.get(clientId);

  if (!existingEntry || existingEntry.resetAt <= now) {
    const resetAt = now + WINDOW_MS;
    rateLimitStore.set(clientId, { count: 1, resetAt });

    return {
      allowed: true,
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetAt,
      retryAfterSeconds: Math.ceil(WINDOW_MS / 1000),
    };
  }

  if (existingEntry.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining: 0,
      resetAt: existingEntry.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existingEntry.resetAt - now) / 1000)),
    };
  }

  existingEntry.count += 1;
  rateLimitStore.set(clientId, existingEntry);

  return {
    allowed: true,
    limit: MAX_REQUESTS_PER_WINDOW,
    remaining: MAX_REQUESTS_PER_WINDOW - existingEntry.count,
    resetAt: existingEntry.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((existingEntry.resetAt - now) / 1000)),
  };
}
