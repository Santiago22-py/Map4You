import { createBrowserClient } from "@supabase/ssr";

import { hasSupabaseCredentials, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export function createSupabaseBrowserClient() {
  if (!hasSupabaseCredentials()) {
    return null;
  }

  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}