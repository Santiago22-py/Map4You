export type RateLimitResult = {
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

const rateLimitStore = new Map<string, RateLimitEntry>();

function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function getRequestClientId(request: Request) {
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

export function checkScopedRateLimit(input: {
  clientId: string;
  scope: string;
  limit: number;
  windowMs: number;
}) : RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const key = `${input.scope}:${input.clientId}`;
  const existingEntry = rateLimitStore.get(key);

  if (!existingEntry || existingEntry.resetAt <= now) {
    const resetAt = now + input.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });

    return {
      allowed: true,
      limit: input.limit,
      remaining: input.limit - 1,
      resetAt,
      retryAfterSeconds: Math.ceil(input.windowMs / 1000),
    };
  }

  if (existingEntry.count >= input.limit) {
    return {
      allowed: false,
      limit: input.limit,
      remaining: 0,
      resetAt: existingEntry.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existingEntry.resetAt - now) / 1000)),
    };
  }

  existingEntry.count += 1;
  rateLimitStore.set(key, existingEntry);

  return {
    allowed: true,
    limit: input.limit,
    remaining: input.limit - existingEntry.count,
    resetAt: existingEntry.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((existingEntry.resetAt - now) / 1000)),
  };
}

export function buildRateLimitHeaders(input: RateLimitResult) {
  return {
    "Retry-After": String(input.retryAfterSeconds),
    "X-RateLimit-Limit": String(input.limit),
    "X-RateLimit-Remaining": String(input.remaining),
    "X-RateLimit-Reset": String(Math.floor(input.resetAt / 1000)),
  };
}
