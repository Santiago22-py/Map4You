export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const messageEncryptionKey = process.env.MESSAGE_ENCRYPTION_KEY;
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

type RequestLike = {
  headers: Headers;
  nextUrl?: {
    origin: string;
  };
  url: string;
};

export function hasSupabaseCredentials() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function hasSupabaseServiceRoleCredentials() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function getConfiguredSiteUrl() {
  return siteUrl?.replace(/\/$/, "") ?? null;
}

export function getBrowserSiteUrl() {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return getConfiguredSiteUrl();
}

export function getRequestSiteUrl(request: RequestLike) {
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, "");
  }

  if (request.nextUrl?.origin) {
    return request.nextUrl.origin.replace(/\/$/, "");
  }

  return getConfiguredSiteUrl() ?? new URL(request.url).origin;
}