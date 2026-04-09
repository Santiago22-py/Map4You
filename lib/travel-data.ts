import {
  countries,
  getCountryBySlug,
  getPlaceByName,
  getPlaceBySlug,
  getPlacesByCountrySlug,
  normalizeSearchQuery,
  type PlaceSectionItem,
} from "@/lib/public-data";

type GeoDbCitiesResponse = {
  data?: Array<{
    city?: string;
    country?: string;
    countryCode?: string;
    population?: number;
  }>;
};

type UnsplashSearchResponse = {
  results?: Array<{
    urls?: {
      regular?: string;
      small?: string;
    };
  }>;
};

type GooglePlacePhoto = {
  name?: string;
  widthPx?: number;
  heightPx?: number;
};

type GooglePlacePhotoMediaResponse = {
  photoUri?: string;
};

type GooglePlace = {
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  photos?: GooglePlacePhoto[];
  priceLevel?: string;
  primaryType?: string;
  rating?: number;
  userRatingCount?: number;
};

type GooglePlacesResponse = {
  places?: GooglePlace[];
};

type GoogleDestinationPhotoSources = {
  landmarkPlaces: GooglePlace[];
  cityPlaces: GooglePlace[];
};

type GoogleDestinationContext = GoogleDestinationPhotoSources & {
  bestPlace: GooglePlace | null;
};

export type CountryMatch = {
  name: string;
  slug: string;
  code?: string;
  capital?: string;
};

export type DestinationCard = {
  slug: string;
  title: string;
  countryName: string;
  countrySlug: string;
  countryCode?: string;
  summary: string;
  imageUrl: string | null;
};

export type RecommendationCard = {
  name: string;
  detail: string;
  imageUrl: string | null;
  location: string;
  popularity: string;
  priceRange: string;
  dateHint: string;
};

export type DestinationDetail = {
  slug: string;
  title: string;
  countryName: string;
  countrySlug: string;
  description: string;
  heroImageUrl: string | null;
  galleryImages: string[];
  stats: {
    budget: string;
    score: string;
    energy: string;
  };
  stay: RecommendationCard[];
  eat: RecommendationCard[];
  visit: RecommendationCard[];
};

export type SearchResultsPayload = {
  country: CountryMatch;
  destinations: DestinationCard[];
  directDestination: DestinationCard | null;
  source: "curated" | "directory" | "geodb" | "fallback";
  providerConfigured: boolean;
};

const GEODB_BASE = process.env.GEODB_API_ENDPOINT || "https://wft-geo-db.p.rapidapi.com/v1/geo";
const GEODB_HOST = process.env.GEODB_API_HOST || "wft-geo-db.p.rapidapi.com";
const GEODB_API_KEY = process.env.GEODB_API_KEY;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_BASE = "https://places.googleapis.com/v1";
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_SEARCH_BASE = "https://api.unsplash.com/search/photos";
const COUNTRY_LOOKUP_REVALIDATE = 60 * 60 * 12;
const PLACE_DETAILS_REVALIDATE = 60 * 60;
const PHOTO_URL_REVALIDATE = 60 * 60 * 6;

const COUNTRY_DIRECTORY: Array<CountryMatch & { aliases?: string[]; cities?: string[]; cityAliases?: string[] }> = [
  { name: "France", slug: "france", code: "FR", capital: "Paris", aliases: ["francia"], cities: ["Paris", "Lyon", "Marseille", "Nice", "Bordeaux"] },
  { name: "Italy", slug: "italy", code: "IT", capital: "Rome", aliases: ["italia"], cities: ["Rome", "Milan", "Florence", "Naples", "Venice"], cityAliases: ["roma", "milan", "milan", "florencia", "napoles", "nápoles", "venecia"] },
  { name: "Spain", slug: "spain", code: "ES", capital: "Madrid", aliases: ["espana", "españa"], cities: ["Madrid", "Barcelona", "Seville", "Valencia", "Granada"], cityAliases: ["sevilla"] },
  { name: "Germany", slug: "germany", code: "DE", capital: "Berlin", aliases: ["alemania"], cities: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt"], cityAliases: ["munich", "múnich", "colonia", "francfort"] },
  { name: "Brazil", slug: "brazil", code: "BR", capital: "Brasilia", aliases: ["brasil"], cities: ["Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Recife"] },
  { name: "Portugal", slug: "portugal", code: "PT", capital: "Lisbon", cities: ["Lisbon", "Porto", "Faro", "Coimbra", "Funchal"], cityAliases: ["lisboa"] },
  { name: "Netherlands", slug: "netherlands", code: "NL", capital: "Amsterdam", aliases: ["holland", "holanda", "paises bajos", "países bajos"], cities: ["Amsterdam", "Rotterdam", "Utrecht", "The Hague", "Eindhoven"], cityAliases: ["la haya"] },
  { name: "Belgium", slug: "belgium", code: "BE", capital: "Brussels", aliases: ["belgica", "bélgica"], cities: ["Brussels", "Bruges", "Antwerp", "Ghent", "Liege"], cityAliases: ["bruselas", "amberes", "gante", "lieja"] },
  { name: "Austria", slug: "austria", code: "AT", capital: "Vienna", cities: ["Vienna", "Salzburg", "Innsbruck", "Graz", "Linz"], cityAliases: ["viena"] },
  { name: "Switzerland", slug: "switzerland", code: "CH", capital: "Bern", aliases: ["suiza"], cities: ["Zurich", "Geneva", "Lucerne", "Bern", "Lausanne"], cityAliases: ["zúrich", "zurich", "ginebra", "lucerna", "berna", "lausana"] },
  { name: "United Kingdom", slug: "united-kingdom", code: "GB", capital: "London", aliases: ["uk", "britain", "great britain", "england", "reino unido", "gran bretana", "gran bretaña", "inglaterra"], cities: ["London", "Edinburgh", "Manchester", "Liverpool", "Bath"], cityAliases: ["londres", "edimburgo"] },
  { name: "United States", slug: "united-states", code: "US", capital: "Washington", aliases: ["usa", "us", "america", "estados unidos", "eeuu", "ee.uu."], cities: ["New York", "Los Angeles", "Chicago", "San Francisco", "Miami"], cityAliases: ["nueva york", "san francisco"] },
  { name: "Japan", slug: "japan", code: "JP", capital: "Tokyo", aliases: ["japon", "japón"], cities: ["Tokyo", "Kyoto", "Osaka", "Sapporo", "Fukuoka"], cityAliases: ["tokio", "kioto"] },
  { name: "South Korea", slug: "south-korea", code: "KR", capital: "Seoul", aliases: ["korea", "corea del sur"], cities: ["Seoul", "Busan", "Incheon", "Daegu", "Jeju City"], cityAliases: ["seul", "ciudad de jeju"] },
  { name: "Australia", slug: "australia", code: "AU", capital: "Canberra", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"], cityAliases: ["sidney", "sídney", "adelaida"] },
  { name: "Canada", slug: "canada", code: "CA", capital: "Ottawa", cities: ["Toronto", "Montreal", "Vancouver", "Quebec City", "Calgary"], cityAliases: ["montreal", "montreal", "ciudad de quebec", "otawa"] },
];

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function repairTextEncoding(value?: string | null) {
  if (!value) {
    return null;
  }

  if (!/[ÃÂ�][^\s]/.test(value)) {
    return value;
  }

  try {
    return Buffer.from(value, "latin1").toString("utf8");
  } catch {
    return value;
  }
}

function sanitizeExternalQueryValue(value?: string | null, maxLength = 80) {
  const repaired = repairTextEncoding(value)?.replace(/\s+/g, " ").trim();

  if (!repaired) {
    return null;
  }

  const cleaned = repaired.replace(/[^\p{L}\p{N}\s.'-]/gu, "").trim().slice(0, maxLength);
  return cleaned.length >= 2 ? cleaned : null;
}

function resolveSupportedCountryName(inputCountry?: string | null, fallbackCountry?: string) {
  const sanitizedCountry = sanitizeExternalQueryValue(inputCountry, 60);

  if (sanitizedCountry) {
    const normalizedCountry = slugify(sanitizedCountry);
    const localCountry = countries.find(
      (country) => country.slug === normalizedCountry || normalizeSearchQuery(country.name) === normalizeSearchQuery(sanitizedCountry),
    );
    const directoryCountry = findCountryRecord(normalizedCountry);

    if (localCountry || directoryCountry) {
      return localCountry?.name ?? directoryCountry?.name ?? sanitizedCountry;
    }
  }

  return sanitizeExternalQueryValue(fallbackCountry, 60) ?? "";
}

function findCountryRecord(query: string) {
  const normalizedQuery = normalizeSearchQuery(query);

  return COUNTRY_DIRECTORY.find((country) => {
    const values = [country.slug, country.name, country.capital, ...(country.aliases ?? []), ...(country.cities ?? []), ...(country.cityAliases ?? [])].map((value) => normalizeSearchQuery(value));
    return values.some((value) => value.includes(normalizedQuery) || normalizedQuery.includes(value));
  });
}

function getDirectoryCityCandidates(country: CountryMatch) {
  const record = findCountryRecord(country.slug) ?? findCountryRecord(country.name.toLowerCase());
  return record?.cities?.map((title, index) => ({
    title,
    population: record.cities!.length - index,
  })) ?? [];
}

async function fetchCountryMatch(query?: string | string[]): Promise<CountryMatch> {
  const normalized = normalizeSearchQuery(query);
  const fallbackCountry = countries[0];

  if (!normalized) {
    const fallbackRecord = findCountryRecord(fallbackCountry.slug);

    return {
      name: fallbackCountry.name,
      slug: fallbackCountry.slug,
      code: fallbackRecord?.code,
      capital: fallbackRecord?.capital,
    };
  }

  const localCountry = countries.find(
    (item) => normalizeSearchQuery(item.slug).includes(normalized) || normalizeSearchQuery(item.name).includes(normalized),
  );
  const countryRecord = findCountryRecord(normalized);

  if (countryRecord) {
    return {
      name: localCountry?.name ?? countryRecord.name,
      slug: localCountry?.slug ?? countryRecord.slug,
      code: countryRecord.code,
      capital: countryRecord.capital,
    };
  }

  const fallback = localCountry ?? fallbackCountry;
  const fallbackRecord = findCountryRecord(fallback.slug);

  return {
    name: fallback.name,
    slug: fallback.slug,
    code: fallbackRecord?.code,
    capital: fallbackRecord?.capital,
  };
}

async function fetchGeoDbCityCandidates(country: CountryMatch) {
  if (!GEODB_API_KEY || !country.code) {
    return [];
  }

  const params = new URLSearchParams({
    countryIds: country.code,
    limit: "5",
    sort: "-population",
    minPopulation: "180000",
    types: "CITY",
  });

  let response: GeoDbCitiesResponse | null = null;

  try {
    const fetchResponse = await fetch(`${GEODB_BASE}/cities?${params.toString()}`, {
      next: { revalidate: COUNTRY_LOOKUP_REVALIDATE },
      headers: {
        Accept: "application/json",
        "User-Agent": "Map4You/0.1 (development)",
        "X-RapidAPI-Key": GEODB_API_KEY,
        "X-RapidAPI-Host": GEODB_HOST,
      },
    });

    if (!fetchResponse.ok) {
      return [];
    }

    response = (await fetchResponse.json()) as GeoDbCitiesResponse;
  } catch {
    return [];
  }

  const ADMIN_PREFIXES = /^(metropolitan city of|city of|province of|greater|municipality of)\s+/i;

  const cleaned =
    response?.data
      ?.map((item) => {
        const raw = repairTextEncoding(item.city?.trim());
        if (!raw) return null;
        const title = raw.replace(ADMIN_PREFIXES, "").trim() || raw;
        return { title, population: item.population ?? 0 };
      })
      .filter((item): item is { title: string; population: number } => Boolean(item))
      .filter((item) => {
        const n = item.title.toLowerCase();
        return !n.includes("metropolitan area") && !n.includes("metro area");
      })
      .sort((left, right) => right.population - left.population) ?? [];

  // Deduplicate: if two names overlap (e.g. "Milan" vs "North Milan"),
  // keep only the shorter/canonical version with the higher population.
  const unique: typeof cleaned = [];
  for (const city of cleaned) {
    const lc = city.title.toLowerCase();
    const duplicate = unique.some((existing) => {
      const elc = existing.title.toLowerCase();
      return elc === lc || elc.includes(lc) || lc.includes(elc);
    });
    if (!duplicate) {
      unique.push(city);
    }
  }

  return unique;
}

function buildPhotoQueries(title: string, countryName: string) {
  return [
    `${title} ${countryName} cityscape`,
    `${title} ${countryName} travel destination`,
    `${title} landmark scenic`,
  ];
}

async function resolveGooglePhotoUrl(photoName?: string, width = 1600) {
  if (!GOOGLE_PLACES_API_KEY || !photoName) {
    return null;
  }

  const mediaUrl = new URL(`${GOOGLE_PLACES_BASE}/${photoName}/media`);
  mediaUrl.searchParams.set("key", GOOGLE_PLACES_API_KEY);
  mediaUrl.searchParams.set("maxWidthPx", String(width));
  mediaUrl.searchParams.set("skipHttpRedirect", "true");

  try {
    const fetchResponse = await fetch(mediaUrl, {
      next: { revalidate: PHOTO_URL_REVALIDATE },
      headers: {
        Accept: "application/json",
      },
    });

    if (!fetchResponse.ok) {
      return null;
    }

    const response = (await fetchResponse.json()) as GooglePlacePhotoMediaResponse;
    return response.photoUri ?? null;
  } catch {
    return null;
  }
}

const LANDMARK_TYPES = new Set([
  "tourist_attraction",
  "landmark",
  "national_park",
  "monument",
  "church",
  "mosque",
  "synagogue",
  "hindu_temple",
  "museum",
  "art_gallery",
  "castle",
  "palace",
  "cultural_landmark",
  "historical_landmark",
  "scenic_spot",
]);

function scoreGooglePlaceMatch(place: GooglePlace, title: string) {
  const candidate = slugify(place.displayName?.text ?? "");
  const normalizedTitle = slugify(title);
  const typeBonus = LANDMARK_TYPES.has(place.primaryType ?? "") ? 40 : 0;

  if (candidate === normalizedTitle) {
    return 120 + typeBonus;
  }

  if (candidate.startsWith(normalizedTitle) || normalizedTitle.startsWith(candidate)) {
    return 80 + typeBonus;
  }

  if (candidate.includes(normalizedTitle) || normalizedTitle.includes(candidate)) {
    return 45 + typeBonus;
  }

  return typeBonus;
}

function scoreGooglePhoto(photo: GooglePlacePhoto, placeScore: number) {
  const width = photo.widthPx ?? 0;
  const height = photo.heightPx ?? 0;

  if (!width || !height) {
    return placeScore;
  }

  // Hard reject tiny or strongly portrait photos (selfies, phone portraits)
  if (width < 600 || height < 400) {
    return -1000;
  }

  const areaScore = Math.min((width * height) / 250000, 60);
  const aspectRatio = width / height;
  // Strongly punish portrait photos — they're usually selfies or people shots
  const landscapeBonus =
    aspectRatio >= 1.25 && aspectRatio <= 2.2
      ? 35
      : aspectRatio > 1
        ? 12
        : aspectRatio < 0.8
          ? -80
          : -40;
  const sharpnessBonus = width >= 1800 ? 18 : width >= 1400 ? 10 : width >= 1100 ? 4 : -10;

  return placeScore + areaScore + landscapeBonus + sharpnessBonus;
}

async function getGooglePlacePhotos(places: GooglePlace[], title: string, count: number, width: number) {
  const rankedCandidates = places
    .flatMap((place) => {
      const placeScore = scoreGooglePlaceMatch(place, title);
      return (
        place.photos?.map((photo) => ({
          photo,
          score: scoreGooglePhoto(photo, placeScore),
        })) ?? []
      );
    })
    .filter((candidate) => Boolean(candidate.photo.name))
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(count * 3, 8));

  if (rankedCandidates.length === 0) {
    return [];
  }

  const urls = await Promise.all(
    rankedCandidates.map((candidate) => resolveGooglePhotoUrl(candidate.photo.name, width)),
  );

  return urls.filter((url): url is string => Boolean(url)).slice(0, count);
}

function pickGooglePrimaryPhoto(place: GooglePlace) {
  return (
    place.photos?.find(
      (photo) => Boolean(photo.name) && (photo.widthPx ?? 0) >= 1000 && (photo.widthPx ?? 0) >= (photo.heightPx ?? 0),
    ) ??
    place.photos?.find((photo) => Boolean(photo.name) && (photo.widthPx ?? 0) >= 900) ??
    place.photos?.find((photo) => Boolean(photo.name)) ??
    null
  );
}

async function getGooglePlacePrimaryPhoto(place: GooglePlace, width: number) {
  const primaryPhoto = pickGooglePrimaryPhoto(place);
  return await resolveGooglePhotoUrl(primaryPhoto?.name, width);
}

function pickBestGooglePlace(places: GooglePlace[], title: string) {
  const normalizedTitle = slugify(title);

  return (
    places.find((place) => {
      const candidate = slugify(place.displayName?.text ?? "");
      return candidate === normalizedTitle || candidate.includes(normalizedTitle) || normalizedTitle.includes(candidate);
    }) ?? places[0] ?? null
  );
}

async function searchGooglePlaces(textQuery: string, pageSize: number, includedType?: string) {
  if (!GOOGLE_PLACES_API_KEY) {
    return [];
  }

  try {
    const body: Record<string, unknown> = { textQuery, pageSize };
    if (includedType) {
      body.includedType = includedType;
    }

    const fetchResponse = await fetch(`${GOOGLE_PLACES_BASE}/places:searchText`, {
      method: "POST",
      next: { revalidate: PLACE_DETAILS_REVALIDATE },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.photos,places.primaryType,places.rating,places.userRatingCount",
      },
      body: JSON.stringify(body),
    });

    if (!fetchResponse.ok) {
      return [];
    }

    const response = (await fetchResponse.json()) as GooglePlacesResponse;
    return response.places ?? [];
  } catch {
    return [];
  }
}

async function fetchGoogleDestinationContext(title: string, countryName: string): Promise<GoogleDestinationContext> {
  const [landmarkPlaces, cityPlacesRaw] = await Promise.all([
    searchGooglePlaces(
      `famous landmarks in ${title} ${countryName}`,
      5,
      "tourist_attraction",
    ),
    searchGooglePlaces(`${title}, ${countryName}`, 5),
  ]);

  const landmarkKeys = new Set(
    landmarkPlaces
      .map((place) => slugify(place.displayName?.text ?? ""))
      .filter(Boolean),
  );

  const cityPlaces = cityPlacesRaw.filter((place) => !landmarkKeys.has(slugify(place.displayName?.text ?? "")));

  return {
    bestPlace: pickBestGooglePlace(cityPlacesRaw, title),
    landmarkPlaces,
    cityPlaces,
  };
}

function buildGooglePoiDetail(place: GooglePlace) {
  const parts: string[] = [];

  if (place.formattedAddress) {
    parts.push(place.formattedAddress);
  }

  if (typeof place.rating === "number") {
    const votes = typeof place.userRatingCount === "number" ? ` segun ${place.userRatingCount}+ resenas` : "";
    parts.push(`Valorado con ${place.rating.toFixed(1)}${votes}`);
  } else if (place.primaryType) {
    parts.push(place.primaryType.replace(/_/g, " "));
  }

  return parts.join(" • ") || "Parada popular de la zona.";
}

function buildPopularityLabel(place: Pick<GooglePlace, "rating" | "userRatingCount">) {
  if (typeof place.rating === "number" && typeof place.userRatingCount === "number") {
    return `${place.rating.toFixed(1)} · ${place.userRatingCount}+ resenas`;
  }

  if (typeof place.rating === "number") {
    return `${place.rating.toFixed(1)} · muy valorado`;
  }

  return "Alta popularidad";
}

function buildPriceRangeLabel(priceLevel: string | undefined, section: "stay" | "eat" | "visit") {
  switch (priceLevel) {
    case "PRICE_LEVEL_FREE":
      return "Gratis";
    case "PRICE_LEVEL_INEXPENSIVE":
      return "€";
    case "PRICE_LEVEL_MODERATE":
      return "€€";
    case "PRICE_LEVEL_EXPENSIVE":
      return "€€€";
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return "€€€€";
    default:
      return section === "stay" ? "Precio variable" : section === "eat" ? "Gasto medio" : "Gratis / entrada";
  }
}

function buildDateHint(section: "stay" | "eat" | "visit", name: string) {
  const normalizedName = slugify(name);

  if (section === "stay") {
    return "Ideal para estancias de 2 a 4 noches";
  }

  if (section === "eat") {
    if (normalizedName.includes("cafe") || normalizedName.includes("coffee") || normalizedName.includes("brunch")) {
      return "Mejor por la mañana";
    }

    if (normalizedName.includes("dinner") || normalizedName.includes("cena") || normalizedName.includes("bistro")) {
      return "Mejor por la noche";
    }

    return "Funciona muy bien a mediodía";
  }

  if (normalizedName.includes("sunset") || normalizedName.includes("mirador") || normalizedName.includes("viewpoint")) {
    return "Mejor al atardecer";
  }

  if (
    normalizedName.includes("museum") ||
    normalizedName.includes("museo") ||
    normalizedName.includes("cathedral") ||
    normalizedName.includes("basilica") ||
    normalizedName.includes("church")
  ) {
    return "Mejor por la manana";
  }

  return "Ideal entre semana";
}

function buildFallbackRecommendationMeta(input: {
  section: "stay" | "eat" | "visit";
  title: string;
  countryName: string;
  itemName: string;
}) {
  const { section, title, countryName, itemName } = input;

  return {
    location: countryName ? `${title}, ${countryName}` : title,
    popularity: section === "visit" ? "Recomendado para una primera visita" : section === "eat" ? "Muy frecuentado" : "Buena valoracion general",
    priceRange: buildPriceRangeLabel(undefined, section),
    dateHint: buildDateHint(section, itemName),
  };
}

async function fetchGoogleNearbySection(
  location: NonNullable<GooglePlace["location"]> | undefined,
  section: "stay" | "eat" | "visit",
): Promise<RecommendationCard[]> {
  if (!GOOGLE_PLACES_API_KEY || !location?.latitude || !location.longitude) {
    return [];
  }

  const includedTypes =
    section === "stay"
      ? ["lodging"]
      : section === "eat"
        ? ["restaurant", "cafe"]
        : ["tourist_attraction", "museum", "art_gallery"];

  const radius = section === "visit" ? 6000 : 4000;

  try {
    const fetchResponse = await fetch(`${GOOGLE_PLACES_BASE}/places:searchNearby`, {
      method: "POST",
      next: { revalidate: PLACE_DETAILS_REVALIDATE },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.photos,places.priceLevel,places.primaryType,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({
        includedTypes,
        maxResultCount: 6,
        rankPreference: "POPULARITY",
        locationRestriction: {
          circle: {
            center: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
            radius,
          },
        },
      }),
    });

    if (!fetchResponse.ok) {
      return [];
    }

    const response = (await fetchResponse.json()) as GooglePlacesResponse;

    const places =
      response.places
        ?.filter((place): place is GooglePlace & { displayName: { text: string } } => Boolean(place.displayName?.text))
        .filter(
          (place, index, array) =>
            array.findIndex((candidate) => candidate.displayName?.text === place.displayName?.text) === index,
        )
        .slice(0, 3) ?? [];

    return await Promise.all(
      places.map(async (place) => ({
        name: place.displayName.text,
        detail: buildGooglePoiDetail(place),
        imageUrl: (await getGooglePlacePrimaryPhoto(place, 1200)) ?? null,
        location: place.formattedAddress ?? "Ubicación por confirmar",
        popularity: buildPopularityLabel(place),
        priceRange: buildPriceRangeLabel(place.priceLevel, section),
        dateHint: buildDateHint(section, place.displayName.text),
      })),
    );
  } catch {
    return [];
  }
}

function buildGeneratedSummary(title: string, countryName: string, localPlace?: { summary: string }) {
  if (localPlace?.summary) {
    return localPlace.summary;
  }

  const destinationArea = countryName || "la región";

  return `${title} es una de las paradas urbanas más atractivas de ${destinationArea}, con barrios fáciles de reconocer, una escena gastronómica potente y variedad suficiente tanto para una escapada corta como para un viaje más pausado.`;
}

async function fetchDestinationImagesFromContext(title: string, countryName: string, count: number, context: GoogleDestinationPhotoSources) {
  const { landmarkPlaces, cityPlaces } = context;
  const landmarkImages = await getGooglePlacePhotos(landmarkPlaces, title, count, 2200);

  const googleImages = [...landmarkImages];

  if (googleImages.length < count && cityPlaces.length > 0) {
    const cityImages = await getGooglePlacePhotos(cityPlaces, title, count - googleImages.length, 2200);
    for (const image of cityImages) {
      if (!googleImages.includes(image)) {
        googleImages.push(image);
      }
    }
  }

  if (googleImages.length >= count || !UNSPLASH_ACCESS_KEY) {
    return googleImages.slice(0, count);
  }

  const images = [...googleImages];

  for (const query of buildPhotoQueries(title, countryName)) {
    const params = new URLSearchParams({
      query,
      per_page: String(Math.max(count, 6)),
      orientation: "landscape",
      content_filter: "high",
      order_by: "relevant",
    });

    try {
      const fetchResponse = await fetch(`${UNSPLASH_SEARCH_BASE}?${params.toString()}`, {
        next: { revalidate: PHOTO_URL_REVALIDATE },
        headers: {
          Accept: "application/json",
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          "Accept-Version": "v1",
        },
      });

      if (!fetchResponse.ok) {
        continue;
      }

      const response = (await fetchResponse.json()) as UnsplashSearchResponse;
      const urls =
        response.results
          ?.map((item) => item.urls?.regular ?? item.urls?.small ?? null)
          .filter((url): url is string => Boolean(url)) ?? [];

      for (const url of urls) {
        if (!images.includes(url)) {
          images.push(url);
        }

        if (images.length >= count) {
          return images.slice(0, count);
        }
      }
    } catch {
      continue;
    }
  }

  return images.slice(0, count);
}

async function fetchDestinationImages(title: string, countryName: string, count: number) {
  const context = await fetchGoogleDestinationContext(title, countryName);
  return await fetchDestinationImagesFromContext(title, countryName, count, context);
}

async function buildDestinationCard(title: string, country: CountryMatch): Promise<DestinationCard | null> {
  const localPlace = getPlaceByName(title);
  const [imageUrl] = await fetchDestinationImages(title, country.name, 1);

  return {
    slug: localPlace?.slug ?? slugify(title),
    title: title,
    countryName: country.name,
    countrySlug: localPlace?.countrySlug ?? country.slug,
    countryCode: country.code,
    summary: buildGeneratedSummary(title, country.name, localPlace),
    imageUrl,
  };
}

function findExactDestinationMatch(query: string | string[] | undefined, destinations: DestinationCard[]) {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return null;
  }

  return (
    destinations.find((destination) => {
      const values = [destination.title, destination.slug].map((value) => normalizeSearchQuery(value));
      return values.includes(normalizedQuery);
    }) ?? null
  );
}

async function getDirectLocalDestinationMatch(query: string | string[] | undefined) {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return null;
  }

  const localPlace = getPlaceByName(normalizedQuery);

  if (!localPlace) {
    return null;
  }

  const localCountry = getCountryBySlug(localPlace.countrySlug);
  const countryMatch: CountryMatch = {
    capital: undefined,
    code: undefined,
    name: localCountry?.name ?? localPlace.countryName,
    slug: localPlace.countrySlug,
  };

  return {
    countryCode: countryMatch.code,
    countryName: countryMatch.name,
    countrySlug: countryMatch.slug,
    imageUrl: null,
    slug: localPlace.slug,
    summary: localPlace.summary,
    title: localPlace.name,
  } satisfies DestinationCard;
}

function decorateFallbackItems(
  items: PlaceSectionItem[],
  images: string[],
  title: string,
  countryName: string,
  section: "stay" | "eat" | "visit",
) {
  return items.map((item, index) => ({
    name: item.name,
    detail: item.detail,
    imageUrl: images[index % Math.max(images.length, 1)] ?? null,
    ...buildFallbackRecommendationMeta({ section, title, countryName, itemName: item.name }),
  }));
}

function buildGenericItems(
  title: string,
  countryName: string,
  section: "stay" | "eat" | "visit",
  images: string[],
): RecommendationCard[] {
  const templates =
    section === "stay"
      ? [
          { name: `${title} Centro`, detail: "Una base práctica cerca de los barrios principales y de las conexiones de transporte." },
          { name: `${title} Boutique`, detail: "Una opción más pequeña para viajeros que prefieren un ambiente más local." },
          { name: `${title} Habitaciones de Diseño`, detail: "Una elección cómoda para una escapada corta con un entorno fácil para recorrer a pie." },
        ]
      : section === "eat"
        ? [
            { name: `${title} Mercado`, detail: "Una parada informal para probar sabores regionales y hacer una pausa rápida al mediodía." },
            { name: `${title} Cena de Barrio`, detail: "Una opción fiable para la noche cuando la ciudad entra en su ritmo local." },
            { name: `${title} Café y Bollería`, detail: "Una alternativa ligera para empezar el día con calma o hacer una pausa breve." },
          ]
        : [
            { name: `${title} Centro Histórico`, detail: "Un primer paseo muy sólido para entender la distribución y el ambiente de la ciudad." },
            { name: `${title} Museo Principal`, detail: "Una parada cultural fiable si quieres una visita de referencia dentro del día." },
            { name: `${title} Mirador al Atardecer`, detail: "Una buena opción para terminar la ruta con vistas de la ciudad a última hora." },
          ];

  return templates.map((item, index) => ({
    ...item,
    imageUrl: images[index % Math.max(images.length, 1)] ?? null,
    ...buildFallbackRecommendationMeta({ section, title, countryName, itemName: item.name }),
  }));
}

function formatSpanishList(values: string[]) {
  if (values.length === 0) {
    return "";
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} y ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")} y ${values[values.length - 1]}`;
}

function buildDynamicDestinationDescription(input: {
  title: string;
  countryName: string;
  localPlace?: { description: string };
  context?: GoogleDestinationContext | null;
  eat?: RecommendationCard[];
  visit?: RecommendationCard[];
}) {
  const { title, countryName, localPlace, context, eat = [], visit = [] } = input;
  const destinationArea = countryName || "la región";

  const landmarkNames = context?.landmarkPlaces
    .map((place) => repairTextEncoding(place.displayName?.text)?.trim())
    .filter((value): value is string => Boolean(value))
    .slice(0, 3) ?? [];

  const bestPlace = context?.bestPlace ?? null;
  const firstVisit = visit[0]?.name;
  const firstEat = eat[0]?.name;
  const ratingText =
    typeof bestPlace?.rating === "number"
      ? ` Con una valoración de ${bestPlace.rating.toFixed(1)}${typeof bestPlace.userRatingCount === "number" ? ` basada en ${bestPlace.userRatingCount}+ reseñas` : ""}, se percibe como una parada muy consolidada.`
      : "";

  if (landmarkNames.length > 0 || firstVisit || firstEat) {
    const landmarkSentence =
      landmarkNames.length > 0
        ? `${title} destaca dentro de ${destinationArea} por referencias tan claras como ${formatSpanishList(landmarkNames)}.`
        : `${title} destaca dentro de ${destinationArea} por una mezcla muy útil de visitas, barrios y ritmo local.`;

      const visitSentence = firstVisit ? ` Para empezar el recorrido, ${firstVisit} suele funcionar muy bien como primera parada.` : "";
      const eatSentence = firstEat ? ` Si quieres una referencia práctica para comer, ${firstEat} es una buena forma de tomarle el pulso a la ciudad.` : "";

    return `${landmarkSentence}${ratingText}${visitSentence}${eatSentence}`;
  }

  if (localPlace?.description) {
    return localPlace.description;
  }

  return `${title} es una base muy sólida para explorar ${destinationArea}, con mezcla de barrios locales, grandes monumentos y una energía que cambia del día a la noche. La vista en vivo utiliza GeoDB para descubrir ciudades y Google Places para recomendaciones cercanas y fotografía, por eso este resumen se mantiene breve mientras el resto de datos se completa de forma dinámica.`;
}

function inferStats(detail: DestinationDetail["stay"], eat: DestinationDetail["eat"], visit: DestinationDetail["visit"]) {
  const volume = detail.length + eat.length + visit.length;

  return {
    budget: volume >= 6 ? "$$$" : "$$",
    score: volume >= 6 ? "4/5" : "3/5",
    energy: visit.length >= 3 ? "5/5" : "4/5",
  };
}

export async function getSearchResults(query?: string | string[]): Promise<SearchResultsPayload> {
  const directLocalDestination = await getDirectLocalDestinationMatch(query);

  if (directLocalDestination) {
    return {
      country: {
        capital: undefined,
        code: directLocalDestination.countryCode,
        name: directLocalDestination.countryName,
        slug: directLocalDestination.countrySlug,
      },
      destinations: [directLocalDestination],
      directDestination: directLocalDestination,
      source: "curated",
      providerConfigured: Boolean(GEODB_API_KEY || GOOGLE_PLACES_API_KEY),
    };
  }

  const country = await fetchCountryMatch(query);
  const localCountry = getCountryBySlug(country.slug);
  const providerConfigured = Boolean(GEODB_API_KEY || GOOGLE_PLACES_API_KEY);

  const geoDbCandidates = await fetchGeoDbCityCandidates(country);

  if (geoDbCandidates.length > 0) {
    const destinations = (
      await Promise.all(geoDbCandidates.map((candidate) => buildDestinationCard(candidate.title, country)))
    )
      .filter((item): item is DestinationCard => Boolean(item))
      .sort((left, right) => Number(Boolean(right.imageUrl)) - Number(Boolean(left.imageUrl)))
      .slice(0, 6);

    if (destinations.length > 0) {
      const directDestination = findExactDestinationMatch(query, destinations);

      return {
        country,
        directDestination,
        destinations,
        source: "geodb",
        providerConfigured,
      };
    }
  }

  const directoryCandidates = getDirectoryCityCandidates(country);

  if (directoryCandidates.length > 0) {
    const destinations = (
      await Promise.all(directoryCandidates.map((candidate) => buildDestinationCard(candidate.title, country)))
    )
      .filter((item): item is DestinationCard => Boolean(item))
      .sort((left, right) => Number(Boolean(right.imageUrl)) - Number(Boolean(left.imageUrl)))
      .slice(0, 6);

    if (destinations.length > 0) {
      const directDestination = findExactDestinationMatch(query, destinations);

      return {
        country,
        directDestination,
        destinations,
        source: "directory",
        providerConfigured,
      };
    }
  }

  if (localCountry) {
    const localPlaces = getPlacesByCountrySlug(localCountry.slug).slice(0, 6);
    const destinations = (
      await Promise.all(localPlaces.map((place) => buildDestinationCard(place.name, country)))
    ).filter((item): item is DestinationCard => Boolean(item));

    return {
      country,
      directDestination: findExactDestinationMatch(query, destinations),
      destinations,
      source: "curated",
      providerConfigured,
    };
  }

  return {
    country,
    directDestination: null,
    destinations: [],
    source: "fallback",
    providerConfigured,
  };
}

export async function getDestinationDetail(input: {
  slug: string;
  title?: string;
  country?: string;
}) {
  const localPlace = getPlaceBySlug(input.slug) ?? (input.title ? getPlaceByName(input.title) : undefined);
  const slugTitle = sanitizeExternalQueryValue(input.slug.replace(/-/g, " ")) ?? "Destino";
  const title = sanitizeExternalQueryValue(input.title ?? localPlace?.name ?? slugTitle) ?? slugTitle;
  const countryName = resolveSupportedCountryName(input.country, localPlace?.countryName);
  const countrySlug = localPlace?.countrySlug ?? slugify(countryName || "destination");
  const destinationContextPromise = countryName
    ? fetchGoogleDestinationContext(title, countryName)
    : Promise.resolve<GoogleDestinationContext>({
        bestPlace: null,
        landmarkPlaces: [],
        cityPlaces: [],
      });
  const destinationImagesPromise = destinationContextPromise.then((context) =>
    countryName ? fetchDestinationImagesFromContext(title, countryName, 4, context) : [],
  );
  const nearbySectionsPromise: Promise<[RecommendationCard[], RecommendationCard[], RecommendationCard[]]> = destinationContextPromise.then(
    (context) => {
      if (!context.bestPlace?.location) {
        return [[], [], []];
      }

      return Promise.all([
        fetchGoogleNearbySection(context.bestPlace.location, "stay"),
        fetchGoogleNearbySection(context.bestPlace.location, "eat"),
        fetchGoogleNearbySection(context.bestPlace.location, "visit"),
      ]) as Promise<[RecommendationCard[], RecommendationCard[], RecommendationCard[]]>;
    },
  );

  const [destinationContext, fetchedImages, [googleStay, googleEat, googleVisit]] = await Promise.all([
    destinationContextPromise,
    destinationImagesPromise,
    nearbySectionsPromise,
  ]);

  const heroImageUrl = fetchedImages[0] ?? null;
  const galleryImages = fetchedImages;

  const stay =
    googleStay.length > 0
      ? googleStay
      : localPlace
        ? decorateFallbackItems(localPlace.stay, galleryImages, title, countryName, "stay")
        : buildGenericItems(title, countryName, "stay", galleryImages);
  const eat =
    googleEat.length > 0
      ? googleEat
      : localPlace
        ? decorateFallbackItems(localPlace.eat, galleryImages, title, countryName, "eat")
        : buildGenericItems(title, countryName, "eat", galleryImages);
  const visit =
    googleVisit.length > 0
      ? googleVisit
      : localPlace
        ? decorateFallbackItems(localPlace.visit, galleryImages, title, countryName, "visit")
        : buildGenericItems(title, countryName, "visit", galleryImages);

  const stats = inferStats(stay, eat, visit);

  return {
    slug: localPlace?.slug ?? slugify(title),
    title,
    countryName,
    countrySlug,
    description: buildDynamicDestinationDescription({
      title,
      countryName,
      localPlace,
      context: destinationContext,
      eat,
      visit,
    }),
    heroImageUrl,
    galleryImages,
    stats,
    stay,
    eat,
    visit,
  } satisfies DestinationDetail;
}