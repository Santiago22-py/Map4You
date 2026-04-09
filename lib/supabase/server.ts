import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { hasSupabaseCredentials, hasSupabaseServiceRoleCredentials, supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from "@/lib/supabase/config";

export async function createSupabaseServerClient() {
  if (!hasSupabaseCredentials()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Route handlers and middleware persist auth cookies; server components can still read them.
        }
      },
    },
  });
}

export function createSupabaseAdminClient() {
  if (!hasSupabaseServiceRoleCredentials()) {
    return null;
  }

  return createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
