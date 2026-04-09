export type PlaceSectionItem = {
  name: string;
  detail: string;
  imageUrl?: string | null;
};

export type Place = {
  aliases?: string[];
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
  isAvailable: boolean;
  cardImageUrl: string | null;
  galleryImageUrls: string[];
};

export type Country = {
  slug: string;
  name: string;
  teaser: string;
  places: Array<Pick<Place, "slug" | "name" | "summary" | "vibe">>;
};

type CuratedPlaceInput = {
  aliases?: string[];
  slug: string;
  countrySlug: string;
  countryName: string;
  name: string;
  summary: string;
  description: string;
  vibe: string;
  bestFor: string[];
  cardImageUrl: string | null;
  galleryImageUrls?: string[];
  stay?: PlaceSectionItem[];
  eat?: PlaceSectionItem[];
  visit?: PlaceSectionItem[];
  isAvailable?: boolean;
};

function createStayItems(city: string): PlaceSectionItem[] {
  return [
    { name: `${city} Centro`, detail: "Una base practica para moverse a pie y enlazar con las zonas mas activas de la ciudad." },
    { name: `${city} Boutique`, detail: "Opcion de ritmo mas pausado para quien prioriza barrio, cafes y regreso tranquilo al final del dia." },
    { name: `${city} Diseño Local`, detail: "Buena eleccion para escapadas cortas con foco en estilo, comodidad y recorridos compactos." },
  ];
}

function createEatItems(city: string): PlaceSectionItem[] {
  return [
    { name: `Mercado de ${city}`, detail: "Parada facil para probar producto local y resolver un almuerzo informal sin perder tiempo." },
    { name: `Cena de Barrio en ${city}`, detail: "Un plan fiable para entrar en el ritmo de la ciudad y alargar la noche con calma." },
    { name: `Cafe de Mañana en ${city}`, detail: "Encaja bien antes de museos, paseos largos o una primera toma de contacto con el centro." },
  ];
}

function createVisitItems(city: string): PlaceSectionItem[] {
  return [
    { name: `${city} Histórico`, detail: "El recorrido base para entender la ciudad y detectar los barrios que merecen mas tiempo." },
    { name: `Museo Principal de ${city}`, detail: "Una visita ancla para equilibrar el viaje entre calle, contexto cultural y descanso interior." },
    { name: `Mirador de ${city}`, detail: "Buen cierre para la hora dorada y para leer la ciudad completa desde arriba." },
  ];
}

function createCuratedPlace(input: CuratedPlaceInput): Place {
  return {
    aliases: input.aliases,
    slug: input.slug,
    countrySlug: input.countrySlug,
    countryName: input.countryName,
    name: input.name,
    summary: input.summary,
    description: input.description,
    vibe: input.vibe,
    bestFor: input.bestFor,
    gallery: ["Centro urbano", "Ritmo local", "Hora dorada"],
    stay: input.stay ?? createStayItems(input.name),
    eat: input.eat ?? createEatItems(input.name),
    visit: input.visit ?? createVisitItems(input.name),
    isAvailable: input.isAvailable ?? false,
    cardImageUrl: input.cardImageUrl,
    galleryImageUrls: input.galleryImageUrls ?? (input.cardImageUrl ? [input.cardImageUrl] : []),
  };
}

function localImagePath(path: string) {
  return encodeURI(path);
}

const parisCard = localImagePath("/France/Paris.jpg");
const lyonCard = localImagePath("/France/Lyon.jpg");
const marseilleCard = localImagePath("/France/Marseille-France-Europe.jpg");
const niceCard = localImagePath("/France/nice_ss.jpg");
const bordeauxCard = localImagePath("/France/bordeaux-place-de-la-bourse.jpg");
const toulouseCard = localImagePath("/France/Toulouse.jpg");

const romeCard = localImagePath("/Italy/Rome.jpg");
const florenceCard = localImagePath("/Italy/Florence.jpeg");
const milanCard = localImagePath("/Italy/Milan-Italy.jpg");
const veniceCard = localImagePath("/Italy/Venice.jpg");
const naplesCard = localImagePath("/Italy/Naples.jpg");
const bolognaCard = localImagePath("/Italy/Bologna.jpg");

const madridCard = localImagePath("/Spain/Madrid.jpg");
const barcelonaCard = localImagePath("/Spain/Barcelona.jpg");
const sevilleCard = localImagePath("/Spain/Seville.jpg");
const valenciaCard = localImagePath("/Spain/Valencia.jpg");
const granadaCard = localImagePath("/Spain/Granada.jpg");
const bilbaoCard = localImagePath("/Spain/Bilbao.jpg");

const parisGallery = [
  parisCard,
  localImagePath("/France/Dormir/Shangri-La.jpg"),
  localImagePath("/France/Comer/BreizhCafe.jpg"),
  localImagePath("/France/Visitar/Tour_Eiffel_Wikimedia_Commons_(cropped).jpg"),
];
const madridGallery = [
  madridCard,
  localImagePath("/Spain/Dormir/FourSeasonsHotel.jpg"),
  localImagePath("/Spain/Comer/Chocolatería__San_Gines_-Madrid-2009.jpg"),
  localImagePath("/Spain/Visitar/Plaza_Mayor_de_Madrid_06.jpg"),
];

const parisStay: PlaceSectionItem[] = [
  { name: "Shangri-La Paris", detail: "Una estancia de referencia para quien quiere vistas icónicas y un ritmo claramente más especial en la ciudad.", imageUrl: localImagePath("/France/Dormir/Shangri-La.jpg") },
  { name: "Hôtel Lutetia", detail: "Muy buena base para combinar barrio, diseño clásico y acceso cómodo a paseos largos por la orilla izquierda.", imageUrl: localImagePath("/France/Dormir/Hôtel_Lutetia,_Paris_6e.jpg") },
  { name: "Pullman Paris Tour Eiffel", detail: "Encaja bien si quieres una ubicación muy reconocible y una primera visita con logística sencilla.", imageUrl: localImagePath("/France/Dormir/Pullman Hotel.jpg") },
];

const parisEat: PlaceSectionItem[] = [
  { name: "Breizh Café", detail: "Parada muy útil para una comida informal con carácter local en un entorno fácil de insertar entre paseos.", imageUrl: localImagePath("/France/Comer/BreizhCafe.jpg") },
  { name: "Du Pain et des Idées", detail: "Perfecto para empezar la mañana con bollería fuerte y una primera caminata por la ciudad.", imageUrl: localImagePath("/France/Comer/Du Pain et des idees.jpg") },
  { name: "La Maison d'Isabelle", detail: "Muy buena opción para una parada breve de panadería y café cuando el plan pide seguir caminando por el centro sin romper el ritmo.", imageUrl: localImagePath("/France/Comer/la-maison-disabelle-courtneytraub-paris-1024x659.jpg") },
];

const parisVisit: PlaceSectionItem[] = [
  { name: "Torre Eiffel", detail: "La gran ancla visual del viaje; conviene dejarle un tramo propio del día y no verla con prisa.", imageUrl: localImagePath("/France/Visitar/Tour_Eiffel_Wikimedia_Commons_(cropped).jpg") },
  { name: "Museo del Louvre", detail: "Funciona mejor como visita central del itinerario cultural, con tiempo para entrar y salir sin apretar demasiado el resto.", imageUrl: localImagePath("/France/Visitar/paris-louvre-pyramid-hd.jpg") },
  { name: "Arco del Triunfo", detail: "Muy buena parada para leer la escala monumental de París y enlazar con un paseo más amplio por la zona.", imageUrl: localImagePath("/France/Visitar/arco-do-triunfo-1.jpg") },
];

const madridStay: PlaceSectionItem[] = [
  { name: "Four Seasons Hotel Madrid", detail: "Una base muy sólida para una escapada amplia, con ubicación central y una estancia claramente más premium.", imageUrl: localImagePath("/Spain/Dormir/FourSeasonsHotel.jpg") },
  { name: "The Palace, Madrid", detail: "Encaja especialmente bien si quieres combinar museos, paseos elegantes y un punto clásico en la experiencia.", imageUrl: localImagePath("/Spain/Dormir/ThePalace.jpg") },
  { name: "Tótem Madrid", detail: "Opción más contenida y de diseño para quien prefiere moverse por barrios con algo más de calma.", imageUrl: localImagePath("/Spain/Dormir/Totem.jpg") },
];

const madridEat: PlaceSectionItem[] = [
  { name: "Chocolatería San Ginés", detail: "Una parada muy reconocible para abrir o cerrar la ruta con uno de los clásicos más fáciles de encajar.", imageUrl: localImagePath("/Spain/Comer/Chocolatería__San_Gines_-Madrid-2009.jpg") },
  { name: "Amazónico", detail: "Buena referencia para una cena con más escena y un ritmo claramente nocturno.", imageUrl: localImagePath("/Spain/Comer/Amazonic.jpg") },
  { name: "Vips", detail: "Solución práctica para una comida rápida cuando el plan del día prioriza moverse mucho por la ciudad.", imageUrl: localImagePath("/Spain/Comer/Vips.jpg") },
];

const madridVisit: PlaceSectionItem[] = [
  { name: "Plaza Mayor", detail: "Punto muy útil para entrar en el corazón histórico y empezar a leer el centro con facilidad.", imageUrl: localImagePath("/Spain/Visitar/Plaza_Mayor_de_Madrid_06.jpg") },
  { name: "Parque del Retiro", detail: "Compensa mucho como pausa larga entre museos y barrios más densos del itinerario.", imageUrl: localImagePath("/Spain/Visitar/Parque del Retiro.jpg") },
  { name: "Santiago Bernabéu", detail: "Una parada muy clara para quien quiere añadir una capa contemporánea y deportiva al viaje por Madrid.", imageUrl: localImagePath("/Spain/Visitar/santiago-bernabeu-at-night-hero.jpg") },
];

const places: Place[] = [
  createCuratedPlace({ aliases: ["paris", "parís"], slug: "paris", countrySlug: "france", countryName: "Francia", name: "París", summary: "Arquitectura iconica, paseos junto al Sena y una ciudad muy facil de convertir en escapada cultural.", description: "París funciona muy bien para una primera gran escapada urbana: barrios con personalidad, museos fuertes, calles elegantes y un ritmo que permite mezclar monumentos con pausas largas en cafe.", vibe: "Escapadas romanticas y viajes centrados en cultura", bestFor: ["Museos", "Escapadas de fin de semana", "Viajes en pareja", "Primer viaje a Europa"], cardImageUrl: parisCard, galleryImageUrls: parisGallery, stay: parisStay, eat: parisEat, visit: parisVisit, isAvailable: true }),
  createCuratedPlace({ aliases: ["lyon", "lion"], slug: "lyon", countrySlug: "france", countryName: "Francia", name: "Lyon", summary: "Ciudad de rios, gastronomia y barrios antiguos con una escala muy comoda.", description: "Lyon es una parada muy completa para quien quiere una ciudad francesa menos obvia que Paris y mas centrada en comer bien y caminar sin tanta presion.", vibe: "Escapadas urbanas relajadas y viajes gastronomicos", bestFor: ["Gastronomia", "Fines de semana", "Paseos urbanos", "Viajes lentos"], cardImageUrl: lyonCard }),
  createCuratedPlace({ aliases: ["marseille", "marsella"], slug: "marseille", countrySlug: "france", countryName: "Francia", name: "Marsella", summary: "Puerto, energia mediterranea y rutas costeras con mas caracter que protocolo.", description: "Marsella mezcla agua, barrio y una escena callejera mas cruda. Encaja mejor en viajes que priorizan atmosfera local frente a grandes postales perfectas.", vibe: "Escapadas costeras y viajes con pulso local", bestFor: ["Costa", "Comida informal", "Viajes de verano", "Barrios con caracter"], cardImageUrl: marseilleCard }),
  createCuratedPlace({ aliases: ["nice", "niza"], slug: "nice", countrySlug: "france", countryName: "Francia", name: "Niza", summary: "Base luminosa para la Riviera con mar, paseos y buen encaje para itinerarios suaves.", description: "Niza funciona como una ciudad base facil para quien quiere combinar playa, casco viejo y pequenas escapadas por la costa sin complicarse demasiado.", vibe: "Escapadas costeras con ritmo sereno", bestFor: ["Mar", "Verano", "Paseos", "Viajes de varios dias"], cardImageUrl: niceCard }),
  createCuratedPlace({ aliases: ["bordeaux", "burdeos"], slug: "bordeaux", countrySlug: "france", countryName: "Francia", name: "Burdeos", summary: "Arquitectura uniforme, cultura del vino y una ciudad elegante pero facil de recorrer.", description: "Burdeos encaja bien en escapadas donde se quiere una ciudad pulida, paseable y con buena salida hacia bodegas o rutas regionales cercanas.", vibe: "Escapadas elegantes y viajes gastronomicos", bestFor: ["Vino", "Arquitectura", "Viajes de pareja", "Puentes cortos"], cardImageUrl: bordeauxCard }),
  createCuratedPlace({ aliases: ["toulouse", "tolosa"], slug: "toulouse", countrySlug: "france", countryName: "Francia", name: "Tolosa", summary: "Calles de tono rosado, plazas vivas y una ciudad universitaria con ritmo amable.", description: "Tolosa tiene un punto muy agradecido para viajeros que quieren una ciudad habitada, no excesivamente turistica y con vida a distintas horas del dia.", vibe: "Escapadas urbanas de caracter local", bestFor: ["Viajes lentos", "Plazas", "Comida casual", "Atmosfera estudiantil"], cardImageUrl: toulouseCard }),
  createCuratedPlace({ aliases: ["rome", "roma"], slug: "rome", countrySlug: "italy", countryName: "Italia", name: "Roma", summary: "Historia superpuesta, caminatas largas y una ciudad que pide tiempo y mucha pausa.", description: "Roma sigue siendo uno de los destinos mas densos para quien disfruta de caminar, comer entre visitas y dejar que la ciudad marque el orden del dia.", vibe: "Grandes ciudades historicas y dias enteros a pie", bestFor: ["Historia", "Comida", "Viajes urbanos", "Primer viaje a Italia"], cardImageUrl: romeCard }),
  createCuratedPlace({ aliases: ["florence", "florencia"], slug: "florence", countrySlug: "italy", countryName: "Italia", name: "Florencia", summary: "Arte, escala compacta y una de las bases mas faciles para una escapada cultural.", description: "Florencia recompensa mucho en poco espacio: una ciudad pequena, muy caminable y con suficiente densidad visual para llenar facilmente un fin de semana.", vibe: "Fines de semana de arte y paseos compactos", bestFor: ["Arte", "Parejas", "Museos", "Escapadas cortas"], cardImageUrl: florenceCard }),
  createCuratedPlace({ aliases: ["milan", "milan"], slug: "milan", countrySlug: "italy", countryName: "Italia", name: "Milán", summary: "Diseno, ritmo de gran ciudad y una puerta muy practica al norte de Italia.", description: "Milán encaja mejor para quien busca mezcla de ciudad funcional, compras, arquitectura y conexiones faciles con otros tramos del viaje.", vibe: "Escapadas urbanas rapidas y viajes con foco en diseno", bestFor: ["Diseño", "Compras", "Arquitectura", "Escalas largas"], cardImageUrl: milanCard }),
  createCuratedPlace({ aliases: ["venice", "venecia"], slug: "venice", countrySlug: "italy", countryName: "Italia", name: "Venecia", summary: "Canales, callejones y una experiencia urbana que no se parece a ninguna otra.", description: "Venecia funciona mejor cuando se acepta su ritmo: caminar, perderse, parar a menudo y no intentar cubrir demasiado en poco tiempo.", vibe: "Escapadas singulares y viajes visuales", bestFor: ["Parejas", "Fotografia", "Escapadas breves", "Ciudades iconicas"], cardImageUrl: veniceCard }),
  createCuratedPlace({ aliases: ["naples", "napoles", "nápoles"], slug: "naples", countrySlug: "italy", countryName: "Italia", name: "Nápoles", summary: "Ciudad intensa, gastronomia potente y mucha energia callejera.", description: "Nápoles tiene una fuerza dificil de replicar: caotica, viva y perfecta para quien quiere un viaje menos pulido y con mucho mas pulso local.", vibe: "Viajes urbanos intensos y gastronomicos", bestFor: ["Pizza", "Viajes con caracter", "Costa cercana", "Historia"], cardImageUrl: naplesCard }),
  createCuratedPlace({ aliases: ["bologna", "bolonia"], slug: "bologna", countrySlug: "italy", countryName: "Italia", name: "Bolonia", summary: "Porticos, cocina muy fuerte y una ciudad amable para quien viaja despacio.", description: "Bolonia recompensa especialmente a quien organiza el viaje alrededor de la mesa y de caminatas urbanas sin demasiada presion monumental.", vibe: "Escapadas culinarias y ciudades habitables", bestFor: ["Gastronomia", "Paseos", "Viajes lentos", "Fines de semana"], cardImageUrl: bolognaCard }),
  createCuratedPlace({ aliases: ["madrid"], slug: "madrid", countrySlug: "spain", countryName: "España", name: "Madrid", summary: "Museos grandes, barrios muy caminables y una ciudad que mejora cuando se alarga la tarde.", description: "Madrid funciona muy bien para una escapada amplia: arte, parques, terrazas, barrios con personalidad y una energia nocturna que se integra de forma natural en el viaje.", vibe: "Escapadas urbanas largas y viajes culturales con buena vida nocturna", bestFor: ["Museos", "Barrio", "Escapadas de 3 dias", "Comida y noche"], cardImageUrl: madridCard, galleryImageUrls: madridGallery, stay: madridStay, eat: madridEat, visit: madridVisit, isAvailable: true }),
  createCuratedPlace({ aliases: ["barcelona"], slug: "barcelona", countrySlug: "spain", countryName: "España", name: "Barcelona", summary: "Ciudad costera de gran energia, arquitectura potente y barrios muy legibles.", description: "Barcelona mezcla playa, diseño, paseos urbanos y comidas largas. Encaja muy bien en viajes de verano o escapadas urbanas con buen tiempo.", vibe: "Ciudades mediterraneas con diseño y movimiento", bestFor: ["Arquitectura", "Verano", "Mercados", "Escapadas urbanas"], cardImageUrl: barcelonaCard }),
  createCuratedPlace({ aliases: ["seville", "sevilla"], slug: "seville", countrySlug: "spain", countryName: "España", name: "Sevilla", summary: "Patios, calor, plazas y una ciudad muy agradecida para ver a pie con pausas largas.", description: "Sevilla gana mucho cuando el viaje se plantea a un ritmo pausado, alternando sombra, comida y recorridos cortos por barrios con mucha atmosfera.", vibe: "Escapadas culturales con ritmo sureño", bestFor: ["Primavera", "Historia", "Plazas", "Viajes tranquilos"], cardImageUrl: sevilleCard }),
  createCuratedPlace({ aliases: ["valencia"], slug: "valencia", countrySlug: "spain", countryName: "España", name: "Valencia", summary: "Ciudad de mar, barrios amplios y un equilibrio muy util entre playa y trama urbana.", description: "Valencia es una opcion muy eficaz para quien quiere una ciudad española luminosa, menos intensa que Madrid o Barcelona y con muy buen ritmo para varios dias.", vibe: "Escapadas costeras y viajes de ritmo facil", bestFor: ["Mar", "Familias", "Paseos en bici", "Viajes de varios dias"], cardImageUrl: valenciaCard }),
  createCuratedPlace({ aliases: ["granada"], slug: "granada", countrySlug: "spain", countryName: "España", name: "Granada", summary: "Miradores, capas historicas y una de las ciudades mas evocadoras para una escapada corta.", description: "Granada combina bien monumentalidad y vida de barrio. Es especialmente recomendable para viajes breves con foco en atmosfera y vistas.", vibe: "Escapadas historicas con mucha identidad", bestFor: ["Historia", "Miradores", "Parejas", "Escapadas de 2 dias"], cardImageUrl: granadaCard }),
  createCuratedPlace({ aliases: ["bilbao"], slug: "bilbao", countrySlug: "spain", countryName: "España", name: "Bilbao", summary: "Arquitectura contemporanea, gastronomia fuerte y una base solida para el norte.", description: "Bilbao encaja en viajes que quieren diseño, buena comida y una ciudad compacta desde la que organizar salidas cercanas.", vibe: "Escapadas del norte con arquitectura y mesa", bestFor: ["Gastronomia", "Arquitectura", "Lluvia amable", "Fines de semana"], cardImageUrl: bilbaoCard }),
];

export const countries: Country[] = [
  {
    slug: "france",
    name: "Francia",
    teaser: "Seis ciudades para un primer recorrido entre monumentos, gastronomia y escapadas regionales.",
    places: places
      .filter((place) => place.countrySlug === "france")
      .map(({ slug, name, summary, vibe }) => ({ slug, name, summary, vibe })),
  },
  {
    slug: "italy",
    name: "Italia",
    teaser: "Un catalogo compacto de ciudades historicas y escapadas urbanas muy caminables.",
    places: places
      .filter((place) => place.countrySlug === "italy")
      .map(({ slug, name, summary, vibe }) => ({ slug, name, summary, vibe })),
  },
  {
    slug: "spain",
    name: "España",
    teaser: "Ciudades con barrio, clima amable y ritmos distintos entre capital, costa y sur.",
    places: places
      .filter((place) => place.countrySlug === "spain")
      .map(({ slug, name, summary, vibe }) => ({ slug, name, summary, vibe })),
  },
];

export function normalizeSearchQuery(query?: string | string[]) {
  const value = Array.isArray(query) ? query[0] : query;
  return value
    ?.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase() ?? "";
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
        normalizeSearchQuery(country.slug).includes(normalized) ||
        normalizeSearchQuery(country.name).includes(normalized),
    ) ?? countries[0]
  );
}

export function getPlaceBySlug(slug: string) {
  return places.find((place) => place.slug === slug);
}

export function getPlaceByName(name: string) {
  const normalized = normalizeSearchQuery(name);
  return places.find((place) => {
    const values = [place.name, ...(place.aliases ?? [])].map((value) => normalizeSearchQuery(value));
    return values.includes(normalized);
  });
}

export function getPlacesByCountrySlug(countrySlug: string) {
  return places.filter((place) => place.countrySlug === countrySlug);
}