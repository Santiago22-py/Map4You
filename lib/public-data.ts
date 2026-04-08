export type PlaceSectionItem = {
  name: string;
  detail: string;
};

export type Place = {
  slug: string;
  countrySlug: string;
  countryName: string;
  name: string;
  summary: string;
  description: string;
  vibe: string;
  bestFor: string[];
  gallery: string[];
  stay: PlaceSectionItem[];
  eat: PlaceSectionItem[];
  visit: PlaceSectionItem[];
};

export type Country = {
  slug: string;
  name: string;
  teaser: string;
  places: Array<Pick<Place, "slug" | "name" | "summary" | "vibe">>;
};

const places: Place[] = [
  {
    slug: "paris",
    countrySlug: "france",
    countryName: "France",
    name: "Paris",
    summary: "Architecture, river walks, and iconic neighborhoods wrapped into one city.",
    description:
      "Paris balances museum-heavy mornings, café terraces, fashion streets, and late-night views over the Seine. It is ideal for travelers who want a dense, layered city where every arrondissement feels different.",
    vibe: "Romantic city breaks and culture-first itineraries",
    bestFor: ["Weekend escapes", "Museums", "Food lovers", "First-time Europe trips"],
    gallery: ["Golden hour skyline", "Seine riverside", "Neighborhood cafés"],
    stay: [
      { name: "Le Marais Boutique Stay", detail: "Walkable base close to galleries, pastry shops, and lively evenings." },
      { name: "Saint-Germain Apartment", detail: "Quiet mornings, bookstores, and easy access to the river." },
      { name: "Canal Saint-Martin Loft", detail: "A more local-feeling option for long walks and casual dining." },
    ],
    eat: [
      { name: "Rue Cler Food Run", detail: "Cheese, pastries, picnic supplies, and easy lunch stops." },
      { name: "Bistro Evening Circuit", detail: "Classic Parisian plates in compact dining rooms with warm lighting." },
      { name: "Montorgueil Morning Coffee", detail: "Good for a slow start before museums or shopping." },
    ],
    visit: [
      { name: "Louvre and Tuileries", detail: "Best split across a museum block and an afternoon garden walk." },
      { name: "Montmartre Streets", detail: "A hilltop route with views, staircases, and painterly side streets." },
      { name: "Seine at Sunset", detail: "Easy anchor activity for the first evening in the city." },
    ],
  },
  {
    slug: "versailles",
    countrySlug: "france",
    countryName: "France",
    name: "Versailles",
    summary: "Royal interiors, formal gardens, and easy day-trip grandeur from Paris.",
    description:
      "Versailles works best as a calm contrast to Paris. The palace draws the headlines, but the estate, canals, and gardens are what turn the visit into a full day rather than a fast checklist stop.",
    vibe: "Elegant day trips and slow cultural afternoons",
    bestFor: ["Day trips", "History", "Gardens", "Photography"],
    gallery: ["Palace façades", "Formal gardens", "Canal reflections"],
    stay: [
      { name: "Historic Center Hotel", detail: "Practical for an early estate entry and quiet evening streets." },
      { name: "Garden-side Guesthouse", detail: "A softer, residential option if you stay overnight." },
      { name: "Boutique Manor Rooms", detail: "Small-scale luxury for travelers building a slower itinerary." },
    ],
    eat: [
      { name: "Market Square Lunch", detail: "Simple local dishes and produce-led meals near the palace district." },
      { name: "Tea Room Pause", detail: "Good mid-afternoon stop after covering the palace interiors." },
      { name: "Brasserie by the Estate", detail: "An easy reset before trains back to Paris." },
    ],
    visit: [
      { name: "Hall of Mirrors", detail: "Go early to avoid the most crowded window." },
      { name: "Gardens and Fountains", detail: "The wider estate is where the visit starts to breathe." },
      { name: "Grand Trianon Route", detail: "A better pick for travelers who prefer quieter corners." },
    ],
  },
  {
    slug: "provence",
    countrySlug: "france",
    countryName: "France",
    name: "Provence",
    summary: "Village drives, local markets, warm light, and food-focused slow travel.",
    description:
      "Provence is less about one landmark and more about sequence: market mornings, long lunches, scenic roads, and evenings in small towns. It suits travelers who want a softer pace and regional character.",
    vibe: "Scenic road trips and slow village-hopping",
    bestFor: ["Road trips", "Markets", "Summer escapes", "Local food"],
    gallery: ["Village stone streets", "Open-air market stalls", "Countryside light"],
    stay: [
      { name: "Countryside Maison", detail: "Base for driving between villages without constant hotel changes." },
      { name: "Hilltop Inn", detail: "Views, easy dinners, and quieter evenings." },
      { name: "Lavender Farm Stay", detail: "Works best in seasonal itineraries with outdoor focus." },
    ],
    eat: [
      { name: "Weekly Market Lunch", detail: "Build a meal from local produce, bread, and cheese stalls." },
      { name: "Village Terrace Dinner", detail: "Regional menus in small squares with slower service." },
      { name: "Bakery Breakfast Circuit", detail: "Useful for early departures between towns." },
    ],
    visit: [
      { name: "Luberon Villages", detail: "A compact route for architecture, views, and shopping." },
      { name: "Arles and Roman Heritage", detail: "Adds a stronger cultural and historical layer." },
      { name: "Valensole Plateau", detail: "Most rewarding when timed for the right season." },
    ],
  },
  {
    slug: "rome",
    countrySlug: "italy",
    countryName: "Italy",
    name: "Rome",
    summary: "Layered history, energetic streets, and long meal-based days.",
    description:
      "Rome is dense, loud, and endlessly rewarding. It works for travelers who like to move on foot, stop often, and let ruins, piazzas, and neighborhood dinners guide the day rather than a rigid checklist.",
    vibe: "Historic cities and all-day wandering",
    bestFor: ["History", "Walking trips", "Food lovers", "City breaks"],
    gallery: ["Piazza life", "Ancient ruins", "Evening alleys"],
    stay: [
      { name: "Centro Storico Rooms", detail: "Fast access to major landmarks and evening walks." },
      { name: "Trastevere Townhouse", detail: "Livelier nights and more neighborhood texture." },
      { name: "Monti Design Hotel", detail: "Good balance of style, dining, and walkability." },
    ],
    eat: [
      { name: "Trastevere Dinner Trail", detail: "Ideal for travelers who want the social energy of the city." },
      { name: "Morning Espresso Loop", detail: "Short café stops before ruins or museums." },
      { name: "Testaccio Food Break", detail: "More grounded local food away from the busiest core." },
    ],
    visit: [
      { name: "Forum and Colosseum Window", detail: "Best tackled early with time left for the surrounding hills." },
      { name: "Pantheon to Piazza Navona", detail: "A compact route full of Rome's everyday rhythm." },
      { name: "Vatican Museums", detail: "Worth isolating as its own half-day anchor." },
    ],
  },
  {
    slug: "florence",
    countrySlug: "italy",
    countryName: "Italy",
    name: "Florence",
    summary: "Compact art city with panoramic hills and strong day-trip links.",
    description:
      "Florence offers a tighter, more walkable rhythm than Rome. Travelers can split time between Renaissance landmarks, riverside evenings, and easy escapes into Tuscany.",
    vibe: "Art-focused weekends and slower Tuscany gateways",
    bestFor: ["Art", "Walkability", "Couples", "Tuscany access"],
    gallery: ["Duomo skyline", "Arno sunset", "Studio details"],
    stay: [
      { name: "Duomo Quarter Hotel", detail: "Best for short first visits that prioritize central access." },
      { name: "Oltrarno Guesthouse", detail: "Craft-focused neighborhood with a calmer evening feel." },
      { name: "Riverside Suites", detail: "Useful when balancing city time with day trips." },
    ],
    eat: [
      { name: "Mercato Centrale Stop", detail: "Good range for mixed groups and quick lunches." },
      { name: "Oltrarno Dinner Tables", detail: "Less rushed than the busiest center spots." },
      { name: "Sunset Aperitivo", detail: "Best paired with viewpoints above the city." },
    ],
    visit: [
      { name: "Duomo and Piazza Core", detail: "The architectural centerpiece of a first visit." },
      { name: "Uffizi Session", detail: "Works best when kept focused rather than exhaustive." },
      { name: "Piazzale Michelangelo", detail: "Reliable golden-hour finish." },
    ],
  },
  {
    slug: "barcelona",
    countrySlug: "spain",
    countryName: "Spain",
    name: "Barcelona",
    summary: "Beach-city energy, bold architecture, and neighborhood-led exploring.",
    description:
      "Barcelona blends seaside ease with dense urban texture. It works especially well for travelers who want architecture, markets, and late evenings all within a compact city layout.",
    vibe: "Design-heavy city escapes with coastal energy",
    bestFor: ["Architecture", "Weekend trips", "Food", "Summer cities"],
    gallery: ["Gaudí curves", "Beach light", "Market corridors"],
    stay: [
      { name: "Eixample Base", detail: "Balanced option for transit, dining, and landmark access." },
      { name: "Born Boutique Hotel", detail: "Best for evening walks and a livelier street scene." },
      { name: "Barceloneta Apartment", detail: "Useful if beach time matters as much as city time." },
    ],
    eat: [
      { name: "Market Lunch Run", detail: "Tapas, produce, and quick plates in central food halls." },
      { name: "Late Dinner Circuit", detail: "Barcelona rewards travelers who shift later into the evening." },
      { name: "Vermouth Stops", detail: "An easy neighborhood ritual between major visits." },
    ],
    visit: [
      { name: "Sagrada Família", detail: "The city anchor; book around it rather than squeezing it in." },
      { name: "Gothic Quarter", detail: "Best explored by wandering rather than strict routes." },
      { name: "Bunkers Viewpoint", detail: "A strong city-wide finish at sunset." },
    ],
  },
];

export const countries: Country[] = [
  {
    slug: "france",
    name: "France",
    teaser: "Romantic cities, royal escapes, and sunlit regional drives.",
    places: places
      .filter((place) => place.countrySlug === "france")
      .map(({ slug, name, summary, vibe }) => ({ slug, name, summary, vibe })),
  },
  {
    slug: "italy",
    name: "Italy",
    teaser: "Historic cities, gallery weekends, and long meal-led itineraries.",
    places: places
      .filter((place) => place.countrySlug === "italy")
      .map(({ slug, name, summary, vibe }) => ({ slug, name, summary, vibe })),
  },
  {
    slug: "spain",
    name: "Spain",
    teaser: "Design-heavy city breaks, markets, and coastal warmth.",
    places: places
      .filter((place) => place.countrySlug === "spain")
      .map(({ slug, name, summary, vibe }) => ({ slug, name, summary, vibe })),
  },
];

export function normalizeSearchQuery(query?: string | string[]) {
  const value = Array.isArray(query) ? query[0] : query;
  return value?.trim().toLowerCase() ?? "";
}

export function getCountryBySlug(slug: string) {
  return countries.find((country) => country.slug === slug);
}

export function findCountryByQuery(query?: string | string[]) {
  const normalized = normalizeSearchQuery(query);

  if (!normalized) {
    return countries[0];
  }

  return (
    countries.find(
      (country) =>
        country.slug.includes(normalized) ||
        country.name.toLowerCase().includes(normalized),
    ) ?? countries[0]
  );
}

export function getPlaceBySlug(slug: string) {
  return places.find((place) => place.slug === slug);
}