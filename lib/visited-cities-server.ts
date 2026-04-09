import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { mapVisitedCities, type VisitedCity } from "@/lib/visited-cities";

export async function getUserVisitedCities(userId: string): Promise<VisitedCity[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("visited_cities")
    .select("city_key, city_name, country_code, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return mapVisitedCities(data);
}

export async function getPublicVisitedCitiesByUserId(userId: string): Promise<VisitedCity[]> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("visited_cities")
    .select("city_key, city_name, country_code, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return mapVisitedCities(data);
}