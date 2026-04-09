export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

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