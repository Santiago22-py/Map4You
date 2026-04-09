export type TravelTripRow = {
  created_at: string;
  destination: string;
  end_date: string;
  id: string;
  places_to_eat: string[] | null;
  places_to_sleep: string[] | null;
  places_to_visit: string[] | null;
  start_date: string;
  updated_at: string;
};

export type TravelTrip = {
  createdAt: string;
  destination: string;
  destinationParts: string[];
  endDate: string;
  heading: string;
  id: string;
  placesToEat: string[];
  placesToSleep: string[];
  placesToVisit: string[];
  startDate: string;
  updatedAt: string;
};

export type TravelTripDraft = {
  destination: string;
  endDate: string;
  placesToEat: string;
  placesToSleep: string;
  placesToVisit: string;
  startDate: string;
};

export function splitCommaSeparatedValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinTripItems(items: string[]) {
  return items.join(", ");
}

export function getTripDestinationParts(destination: string) {
  return splitCommaSeparatedValues(destination);
}

export function getTripHeading(destination: string) {
  const parts = getTripDestinationParts(destination);

  if (!parts.length) {
    return "Viaje";
  }

  return parts.reduce((selected, current) => (current.length >= selected.length ? current : selected));
}

export function normalizeTripDestinationKey(destination: string) {
  return destination
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s,]+/g, "")
    .trim();
}

export function countUniqueTripDestinations(destinations: string[]) {
  return new Set(destinations.map(normalizeTripDestinationKey).filter(Boolean)).size;
}

export function mapTravelTrip(row: TravelTripRow): TravelTrip {
  return {
    createdAt: row.created_at,
    destination: row.destination,
    destinationParts: getTripDestinationParts(row.destination),
    endDate: row.end_date,
    heading: getTripHeading(row.destination),
    id: row.id,
    placesToEat: row.places_to_eat ?? [],
    placesToSleep: row.places_to_sleep ?? [],
    placesToVisit: row.places_to_visit ?? [],
    startDate: row.start_date,
    updatedAt: row.updated_at,
  };
}

export function mapTravelTrips(rows: TravelTripRow[]) {
  return rows.map(mapTravelTrip);
}

export function buildTripDraft(trip?: TravelTrip): TravelTripDraft {
  return {
    destination: trip?.destination ?? "",
    endDate: trip?.endDate ?? "",
    placesToEat: joinTripItems(trip?.placesToEat ?? []),
    placesToSleep: joinTripItems(trip?.placesToSleep ?? []),
    placesToVisit: joinTripItems(trip?.placesToVisit ?? []),
    startDate: trip?.startDate ?? "",
  };
}