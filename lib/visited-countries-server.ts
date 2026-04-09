import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { mapVisitedCountries, type VisitedCountry } from "@/lib/visited-countries";

export async function getUserVisitedCountries(userId: string): Promise<VisitedCountry[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("visited_countries")
    .select("country_code, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return mapVisitedCountries(data);
}

export async function getPublicVisitedCountriesByUserId(userId: string): Promise<VisitedCountry[]> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("visited_countries")
    .select("country_code, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return mapVisitedCountries(data);
}