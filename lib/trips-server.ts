import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { mapTravelTrips, normalizeTripDestinationKey, type TravelTrip, type TravelTripRow } from "@/lib/trips";

async function getVisitedCityKeys(resource: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>> | NonNullable<ReturnType<typeof createSupabaseAdminClient>>, userId: string) {
  const { data, error } = await resource.from("visited_cities").select("city_key").eq("user_id", userId);

  if (error || !data) {
    return [];
  }

  return data.map((item) => String(item.city_key ?? "")).filter(Boolean);
}

export async function getUserTrips(userId: string): Promise<TravelTrip[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_trips")
    .select("id, destination, start_date, end_date, places_to_sleep, places_to_eat, places_to_visit, created_at, updated_at")
    .eq("user_id", userId)
    .order("start_date", { ascending: true });

  if (error || !data) {
    return [];
  }

  return mapTravelTrips(data as TravelTripRow[]);
}

export async function getUserVisitedCityCount(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return 0;
  }

  const [{ data, error }, visitedCityKeys] = await Promise.all([
    supabase.from("user_trips").select("destination").eq("user_id", userId),
    getVisitedCityKeys(supabase, userId),
  ]);

  if (error || !data) {
    return new Set(visitedCityKeys.filter(Boolean)).size;
  }

  return new Set([
    ...data.map((trip) => normalizeTripDestinationKey(String(trip.destination ?? ""))),
    ...visitedCityKeys,
  ].filter(Boolean)).size;
}

export async function getPublicVisitedCityCountByUserId(userId: string): Promise<number> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return 0;
  }

  const [{ data, error }, visitedCityKeys] = await Promise.all([
    supabase.from("user_trips").select("destination").eq("user_id", userId),
    getVisitedCityKeys(supabase, userId),
  ]);

  if (error || !data) {
    return new Set(visitedCityKeys.filter(Boolean)).size;
  }

  return new Set([
    ...data.map((trip) => normalizeTripDestinationKey(String(trip.destination ?? ""))),
    ...visitedCityKeys,
  ].filter(Boolean)).size;
}