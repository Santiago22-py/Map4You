export type PlaceSectionItem = {
  name: string;
  detail: string;
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
};

export type Country = {
  slug: string;
  name: string;
  teaser: string;
  places: Array<Pick<Place, "slug" | "name" | "summary" | "vibe">>;
};

const places: Place[] = [
  {
    aliases: ["paris", "parís"],
    slug: "paris",
    countrySlug: "france",
    countryName: "Francia",
    name: "Paris",
    summary: "Arquitectura, paseos junto al río y barrios icónicos concentrados en una sola ciudad.",
    description:
      "París combina mañanas de museos, terrazas de café, calles con estilo y vistas nocturnas sobre el Sena. Es ideal para quienes buscan una ciudad densa y con muchas capas, donde cada arrondissement se siente distinto.",
    vibe: "Escapadas románticas y recorridos centrados en la cultura",
    bestFor: ["Escapadas de fin de semana", "Museos", "Viajes gastronómicos", "Primer viaje a Europa"],
    gallery: ["Skyline en hora dorada", "Orillas del Sena", "Cafés de barrio"],
    stay: [
      { name: "Estancia Boutique Le Marais", detail: "Una base muy caminable cerca de galerías, pastelerías y zonas animadas al caer la tarde." },
      { name: "Apartamento Saint-Germain", detail: "Buenas mañanas tranquilas, librerías y acceso sencillo al río." },
      { name: "Loft Canal Saint-Martin", detail: "Una opción con un aire más local para paseos largos y comidas informales." },
    ],
    eat: [
      { name: "Ruta Gastronómica Rue Cler", detail: "Quesos, bollería, compras para picnic y paradas fáciles para comer al mediodía." },
      { name: "Circuito de Bistrós Nocturnos", detail: "Platos parisinos clásicos en comedores pequeños y con ambiente cálido." },
      { name: "Café Matinal en Montorgueil", detail: "Muy buena opción para empezar el día con calma antes de museos o compras." },
    ],
    visit: [
      { name: "Louvre y Tuileries", detail: "Funciona mejor si se reparte entre un bloque de museo y un paseo por los jardines por la tarde." },
      { name: "Calles de Montmartre", detail: "Un recorrido en altura con vistas, escaleras y calles laterales con mucho carácter." },
      { name: "Sena al Atardecer", detail: "Una actividad fácil de colocar para la primera tarde o noche en la ciudad." },
    ],
  },
  {
    aliases: ["versailles", "versalles"],
    slug: "versailles",
    countrySlug: "france",
    countryName: "Francia",
    name: "Versailles",
    summary: "Interiores reales, jardines formales y una gran excursión de un día desde París.",
    description:
      "Versalles funciona muy bien como contraste tranquilo frente a París. El palacio acapara la atención, pero la finca, los canales y los jardines son lo que convierten la visita en un día completo y no en una parada rápida.",
    vibe: "Excursiones elegantes y tardes culturales pausadas",
    bestFor: ["Excursiones de un día", "Historia", "Jardines", "Fotografía"],
    gallery: ["Fachadas del palacio", "Jardines formales", "Reflejos del canal"],
    stay: [
      { name: "Hotel del Centro Histórico", detail: "Práctico para entrar pronto en el recinto y disfrutar de calles tranquilas por la tarde." },
      { name: "Casa de Huéspedes junto al Jardín", detail: "Una opción más residencial y calmada si decides pasar la noche." },
      { name: "Habitaciones Boutique en Casa Solariega", detail: "Un pequeño lujo para viajeros que prefieren un itinerario más pausado." },
    ],
    eat: [
      { name: "Almuerzo en la Plaza del Mercado", detail: "Platos locales sencillos y comidas centradas en producto cerca de la zona del palacio." },
      { name: "Pausa en Salón de Té", detail: "Buena parada a media tarde después de recorrer los interiores del palacio." },
      { name: "Brasserie junto al Recinto", detail: "Un descanso fácil antes de volver en tren a París." },
    ],
    visit: [
      { name: "Galería de los Espejos", detail: "Conviene ir pronto para evitar la franja con más gente." },
      { name: "Jardines y Fuentes", detail: "Es en la parte más amplia del recinto donde la visita realmente gana aire." },
      { name: "Ruta del Gran Trianon", detail: "Una mejor elección para quienes prefieren rincones más tranquilos." },
    ],
  },
  {
    aliases: ["provence", "provenza"],
    slug: "provence",
    countrySlug: "france",
    countryName: "Francia",
    name: "Provence",
    summary: "Carreteras entre pueblos, mercados locales, luz cálida y viajes lentos centrados en comer bien.",
    description:
      "La Provenza gira menos en torno a un único monumento y más a una secuencia: mercados por la mañana, comidas largas, carreteras escénicas y tardes en pueblos pequeños. Va muy bien para viajeros que buscan un ritmo suave y mucho carácter regional.",
    vibe: "Rutas escénicas por carretera y pueblos recorridos sin prisa",
    bestFor: ["Viajes por carretera", "Mercados", "Escapadas de verano", "Comida local"],
    gallery: ["Calles de piedra", "Puestos de mercado al aire libre", "Luz del campo"],
    stay: [
      { name: "Maison Rural", detail: "Buena base para moverse entre pueblos sin cambiar de alojamiento constantemente." },
      { name: "Posada en la Colina", detail: "Vistas, cenas sencillas y tardes mucho más tranquilas." },
      { name: "Estancia en Finca de Lavanda", detail: "Encaja mejor en itinerarios de temporada con mucho tiempo al aire libre." },
    ],
    eat: [
      { name: "Almuerzo de Mercado Semanal", detail: "Monta la comida con producto local, pan y puestos de queso del mercado." },
      { name: "Cena en Terraza de Pueblo", detail: "Menús regionales en plazas pequeñas y con un servicio más pausado." },
      { name: "Ruta de Desayuno en Panaderías", detail: "Muy útil para salir temprano hacia el siguiente pueblo." },
    ],
    visit: [
      { name: "Pueblos del Luberon", detail: "Una ruta compacta para combinar arquitectura, vistas y pequeñas compras." },
      { name: "Arles y herencia romana", detail: "Aporta una capa cultural e histórica mucho más marcada." },
      { name: "Meseta de Valensole", detail: "Se disfruta mucho más si se visita en la temporada adecuada." },
    ],
  },
  {
    aliases: ["rome", "roma"],
    slug: "rome",
    countrySlug: "italy",
    countryName: "Italia",
    name: "Rome",
    summary: "Historia en capas, calles con energía y días largos marcados por la comida.",
    description:
      "Roma es densa, ruidosa y enormemente agradecida para quien la recorre bien. Funciona para viajeros que disfrutan caminar, parar con frecuencia y dejar que las ruinas, las plazas y las cenas de barrio marquen el ritmo del día.",
    vibe: "Grandes ciudades históricas y caminatas de todo el día",
    bestFor: ["Historia", "Viajes a pie", "Viajes gastronómicos", "Escapadas urbanas"],
    gallery: ["Vida en las plazas", "Ruinas antiguas", "Callejones al anochecer"],
    stay: [
      { name: "Centro Storico Rooms", detail: "Acceso rápido a los grandes monumentos y a los paseos de última hora." },
      { name: "Casa Urbana en Trastevere", detail: "Noches más animadas y un barrio con mucha más textura local." },
      { name: "Hotel de Diseño en Monti", detail: "Buen equilibrio entre estilo, gastronomía y recorridos a pie." },
    ],
    eat: [
      { name: "Ruta de Cenas por Trastevere", detail: "Ideal para quienes buscan la energía social de la ciudad al final del día." },
      { name: "Vuelta de Espresso Matinal", detail: "Paradas cortas para café antes de entrar en ruinas o museos." },
      { name: "Parada Gastronómica en Testaccio", detail: "Comida más local y con los pies en la tierra, fuera del núcleo más turístico." },
    ],
    visit: [
      { name: "Foro y Coliseo", detail: "Conviene hacerlo temprano y dejar tiempo para las colinas de alrededor." },
      { name: "Del Panteón a Piazza Navona", detail: "Una ruta compacta llena del ritmo cotidiano de Roma." },
      { name: "Museos Vaticanos", detail: "Merece la pena reservarle medio día completo por separado." },
    ],
  },
  {
    aliases: ["florence", "florencia"],
    slug: "florence",
    countrySlug: "italy",
    countryName: "Italia",
    name: "Florence",
    summary: "Ciudad de arte compacta, colinas panorámicas y muy buena conexión para excursiones.",
    description:
      "Florencia tiene un ritmo más compacto y caminable que Roma. Permite repartir el tiempo entre monumentos renacentistas, tardes junto al río y escapadas sencillas a la Toscana.",
    vibe: "Fines de semana centrados en arte y entrada pausada a la Toscana",
    bestFor: ["Arte", "Recorridos a pie", "Parejas", "Acceso a la Toscana"],
    gallery: ["Skyline del Duomo", "Atardecer en el Arno", "Detalles de taller"],
    stay: [
      { name: "Hotel del Barrio del Duomo", detail: "Muy cómodo para primeras visitas cortas que priorizan estar en el centro." },
      { name: "Casa de Huéspedes en Oltrarno", detail: "Barrio con tradición artesanal y un ambiente más calmado por la tarde." },
      { name: "Suites junto al Río", detail: "Útil cuando quieres equilibrar tiempo en ciudad con alguna excursión." },
    ],
    eat: [
      { name: "Parada en Mercato Centrale", detail: "Buena variedad para grupos mixtos y comidas rápidas al mediodía." },
      { name: "Mesas de Cena en Oltrarno", detail: "Más tranquilo que los puntos más saturados del centro." },
      { name: "Aperitivo al Atardecer", detail: "Funciona especialmente bien si lo combinas con un mirador sobre la ciudad." },
    ],
    visit: [
      { name: "Duomo y Plaza Central", detail: "El núcleo arquitectónico que mejor resume una primera visita." },
      { name: "Visita a los Uffizi", detail: "Se disfruta más si se plantea como una visita concentrada y no exhaustiva." },
      { name: "Piazzale Michelangelo", detail: "Un cierre muy fiable para la hora dorada." },
    ],
  },
  {
    slug: "barcelona",
    countrySlug: "spain",
    countryName: "España",
    name: "Barcelona",
    summary: "Energia de ciudad costera, arquitectura potente y exploracion guiada por barrios.",
    description:
      "Barcelona mezcla la facilidad de una ciudad costera con una trama urbana muy densa. Funciona especialmente bien para quienes quieren arquitectura, mercados y noches largas dentro de una ciudad compacta.",
    vibe: "Escapadas urbanas con mucho diseño y energía mediterránea",
    bestFor: ["Arquitectura", "Viajes de fin de semana", "Comida", "Ciudades de verano"],
    gallery: ["Curvas de Gaudi", "Luz de playa", "Pasillos de mercado"],
    stay: [
      { name: "Base en Eixample", detail: "Opción equilibrada para moverse bien, comer bien y llegar con facilidad a los principales lugares." },
      { name: "Hotel Boutique en El Born", detail: "Muy buena elección para paseos al atardecer y calles con más ambiente." },
      { name: "Apartamento en Barceloneta", detail: "Especialmente útil si quieres dar al tiempo de playa tanta importancia como al tiempo de ciudad." },
    ],
    eat: [
      { name: "Ruta de Almuerzo por Mercados", detail: "Tapas, producto fresco y platos rápidos en mercados y espacios centrales de comida." },
      { name: "Circuito de Cenas Tardías", detail: "Barcelona recompensa a quienes retrasan el ritmo y se meten de lleno en la noche." },
      { name: "Paradas para el Vermut", detail: "Un ritual de barrio facil de encajar entre una visita importante y la siguiente." },
    ],
    visit: [
      { name: "Sagrada Família", detail: "El gran ancla de la ciudad; conviene organizar el día alrededor de ella y no meterla con prisa." },
      { name: "Barrio Gótico", detail: "Se disfruta más caminando sin una ruta demasiado cerrada." },
      { name: "Mirador de los Bunkers", detail: "Un cierre muy potente para ver la ciudad entera al atardecer." },
    ],
  },
];

export const countries: Country[] = [
  {
    slug: "france",
    name: "Francia",
    teaser: "Ciudades románticas, escapadas reales y rutas regionales llenas de luz.",
    places: places
      .filter((place) => place.countrySlug === "france")
      .map(({ slug, name, summary, vibe }) => ({ slug, name, summary, vibe })),
  },
  {
    slug: "italy",
    name: "Italia",
    teaser: "Ciudades históricas, fines de semana entre galerías y viajes guiados por la mesa.",
    places: places
      .filter((place) => place.countrySlug === "italy")
      .map(({ slug, name, summary, vibe }) => ({ slug, name, summary, vibe })),
  },
  {
    slug: "spain",
    name: "España",
    teaser: "Escapadas urbanas con diseño, mercados y calidez costera.",
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