import {
  countries,
  findCountryByQuery,
  getCountryBySlug,
  getPlaceByName,
  getPlaceBySlug,
  getPlacesByCountrySlug,
  normalizeSearchQuery,
  type Place,
  type PlaceSectionItem,
} from "@/lib/public-data";

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
  available: boolean;
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

function buildPriceRangeLabel(section: "stay" | "eat" | "visit") {
  if (section === "stay") {
    return "Precio variable";
  }

  if (section === "eat") {
    return "Gasto medio";
  }

  return "Gratis / entrada";
}

function buildDateHint(section: "stay" | "eat" | "visit", name: string) {
  const normalizedName = normalizeSearchQuery(name);

  if (section === "stay") {
    return "Ideal para estancias de 2 a 4 noches";
  }

  if (section === "eat") {
    if (normalizedName.includes("cafe") || normalizedName.includes("brunch")) {
      return "Mejor por la manana";
    }

    return "Funciona muy bien a mediodia";
  }

  if (normalizedName.includes("mirador") || normalizedName.includes("sunset")) {
    return "Mejor al atardecer";
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
    priceRange: buildPriceRangeLabel(section),
    dateHint: buildDateHint(section, itemName),
  };
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
    imageUrl: item.imageUrl ?? images[index % Math.max(images.length, 1)] ?? null,
    ...buildFallbackRecommendationMeta({ section, title, countryName, itemName: item.name }),
  }));
}

function inferStats(stay: RecommendationCard[], eat: RecommendationCard[], visit: RecommendationCard[]) {
  const volume = stay.length + eat.length + visit.length;

  return {
    budget: volume >= 9 ? "$$$" : "$$",
    score: visit.length >= 3 ? "4/5" : "3/5",
    energy: eat.length >= 3 && visit.length >= 3 ? "5/5" : "4/5",
  };
}

function buildCountryMatch(countrySlug: string, fallbackCountryName?: string): CountryMatch {
  const localCountry = getCountryBySlug(countrySlug);

  return {
    capital: undefined,
    code: undefined,
    name: localCountry?.name ?? fallbackCountryName ?? countries[0].name,
    slug: localCountry?.slug ?? countrySlug,
  };
}

function buildCuratedDestinationCard(place: Place): DestinationCard {
  return {
    slug: place.slug,
    title: place.name,
    countryName: place.countryName,
    countrySlug: place.countrySlug,
    countryCode: undefined,
    summary: place.summary,
    imageUrl: place.cardImageUrl,
    available: place.isAvailable,
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
      return destination.available && values.includes(normalizedQuery);
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

  return buildCuratedDestinationCard(localPlace);
}

export async function getSearchResults(query?: string | string[]): Promise<SearchResultsPayload> {
  const directLocalDestination = await getDirectLocalDestinationMatch(query);

  if (directLocalDestination?.available) {
    return {
      country: buildCountryMatch(directLocalDestination.countrySlug, directLocalDestination.countryName),
      destinations: [directLocalDestination],
      directDestination: directLocalDestination,
      source: "curated",
      providerConfigured: false,
    };
  }

  const matchedPlace = query ? getPlaceByName(normalizeSearchQuery(query)) : undefined;
  const localCountry = matchedPlace ? getCountryBySlug(matchedPlace.countrySlug) : findCountryByQuery(query);

  if (localCountry) {
    const destinations = getPlacesByCountrySlug(localCountry.slug).slice(0, 6).map(buildCuratedDestinationCard);

    return {
      country: buildCountryMatch(localCountry.slug, localCountry.name),
      directDestination: matchedPlace?.isAvailable ? findExactDestinationMatch(query, destinations) : null,
      destinations,
      source: "curated",
      providerConfigured: false,
    };
  }

  return {
    country: buildCountryMatch(countries[0].slug, countries[0].name),
    directDestination: null,
    destinations: [],
    source: "fallback",
    providerConfigured: false,
  };
}

export async function getDestinationDetail(input: {
  slug: string;
  title?: string;
  country?: string;
}) {
  const localPlace = getPlaceBySlug(input.slug) ?? (input.title ? getPlaceByName(input.title) : undefined);

  if (!localPlace || !localPlace.isAvailable) {
    return {
      slug: input.slug,
      title: "",
      countryName: "",
      countrySlug: "",
      description: "",
      heroImageUrl: null,
      galleryImages: [],
      stats: {
        budget: "",
        score: "",
        energy: "",
      },
      stay: [],
      eat: [],
      visit: [],
    } satisfies DestinationDetail;
  }

  const galleryImages = localPlace.galleryImageUrls.length > 0
    ? localPlace.galleryImageUrls
    : localPlace.cardImageUrl
      ? [localPlace.cardImageUrl, localPlace.cardImageUrl, localPlace.cardImageUrl, localPlace.cardImageUrl]
      : [];
  const heroImageUrl = galleryImages[0] ?? localPlace.cardImageUrl ?? null;
  const stay = decorateFallbackItems(localPlace.stay, galleryImages, localPlace.name, localPlace.countryName, "stay");
  const eat = decorateFallbackItems(localPlace.eat, galleryImages, localPlace.name, localPlace.countryName, "eat");
  const visit = decorateFallbackItems(localPlace.visit, galleryImages, localPlace.name, localPlace.countryName, "visit");

  return {
    slug: localPlace.slug,
    title: localPlace.name,
    countryName: localPlace.countryName,
    countrySlug: localPlace.countrySlug,
    description: localPlace.description,
    heroImageUrl,
    galleryImages,
    stats: inferStats(stay, eat, visit),
    stay,
    eat,
    visit,
  } satisfies DestinationDetail;
}
