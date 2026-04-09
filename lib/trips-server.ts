import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { countUniqueTripDestinations, mapTravelTrips, type TravelTrip, type TravelTripRow } from "@/lib/trips";

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

  const { data, error } = await supabase.from("user_trips").select("destination").eq("user_id", userId);

  if (error || !data) {
    return 0;
  }

  return countUniqueTripDestinations(data.map((trip) => String(trip.destination ?? "")));
}

export async function getPublicVisitedCityCountByUserId(userId: string): Promise<number> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return 0;
  }

  const { data, error } = await supabase.from("user_trips").select("destination").eq("user_id", userId);

  if (error || !data) {
    return 0;
  }

  return countUniqueTripDestinations(data.map((trip) => String(trip.destination ?? "")));
}