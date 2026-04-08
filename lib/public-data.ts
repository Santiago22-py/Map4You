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
    summary: "Arquitectura, paseos junto al rio y barrios iconicos concentrados en una sola ciudad.",
    description:
      "Paris combina mananas de museos, terrazas de cafe, calles con estilo y vistas nocturnas sobre el Sena. Es ideal para quienes buscan una ciudad densa y con muchas capas, donde cada arrondissement se siente distinto.",
    vibe: "Escapadas romanticas y recorridos centrados en cultura",
    bestFor: ["Escapadas de fin de semana", "Museos", "Viajes gastronomicos", "Primer viaje a Europa"],
    gallery: ["Skyline en hora dorada", "Orillas del Sena", "Cafes de barrio"],
    stay: [
      { name: "Estancia Boutique Le Marais", detail: "Una base muy caminable cerca de galerias, pastelerias y zonas animadas al caer la tarde." },
      { name: "Apartamento Saint-Germain", detail: "Buenas mananas tranquilas, librerias y acceso sencillo al rio." },
      { name: "Loft Canal Saint-Martin", detail: "Una opcion con un aire mas local para paseos largos y comidas informales." },
    ],
    eat: [
      { name: "Ruta Gastronomica Rue Cler", detail: "Quesos, bolleria, compras para picnic y paradas faciles para comer al mediodia." },
      { name: "Circuito de Bistrós Nocturnos", detail: "Platos parisinos clasicos en comedores pequenos y con ambiente calido." },
      { name: "Cafe Matinal en Montorgueil", detail: "Muy buena opcion para empezar el dia con calma antes de museos o compras." },
    ],
    visit: [
      { name: "Louvre y Tuileries", detail: "Funciona mejor si se reparte entre un bloque de museo y un paseo por los jardines por la tarde." },
      { name: "Calles de Montmartre", detail: "Un recorrido en altura con vistas, escaleras y calles laterales con mucho caracter." },
      { name: "Sena al Atardecer", detail: "Una actividad facil de colocar para la primera tarde o noche en la ciudad." },
    ],
  },
  {
    slug: "versailles",
    countrySlug: "france",
    countryName: "France",
    name: "Versailles",
    summary: "Interiores reales, jardines formales y una gran excursion de un dia desde Paris.",
    description:
      "Versalles funciona muy bien como contraste tranquilo frente a Paris. El palacio acapara la atencion, pero la finca, los canales y los jardines son lo que convierten la visita en un dia completo y no en una parada rapida.",
    vibe: "Excursiones elegantes y tardes culturales pausadas",
    bestFor: ["Excursiones de un dia", "Historia", "Jardines", "Fotografia"],
    gallery: ["Fachadas del palacio", "Jardines formales", "Reflejos del canal"],
    stay: [
      { name: "Hotel del Centro Historico", detail: "Practico para entrar pronto en el recinto y disfrutar de calles tranquilas por la tarde." },
      { name: "Casa de Huespedes junto al Jardin", detail: "Una opcion mas residencial y calmada si decides pasar la noche." },
      { name: "Habitaciones Boutique en Casa Solariega", detail: "Un pequeno lujo para viajeros que prefieren un itinerario mas pausado." },
    ],
    eat: [
      { name: "Almuerzo en la Plaza del Mercado", detail: "Platos locales sencillos y comidas centradas en producto cerca de la zona del palacio." },
      { name: "Pausa en Salon de Te", detail: "Buena parada a media tarde despues de recorrer los interiores del palacio." },
      { name: "Brasserie junto al Recinto", detail: "Un descanso facil antes de volver en tren a Paris." },
    ],
    visit: [
      { name: "Galeria de los Espejos", detail: "Conviene ir pronto para evitar la franja con mas gente." },
      { name: "Jardines y Fuentes", detail: "Es en la parte mas amplia del recinto donde la visita realmente gana aire." },
      { name: "Ruta del Gran Trianon", detail: "Una mejor eleccion para quienes prefieren rincones mas tranquilos." },
    ],
  },
  {
    slug: "provence",
    countrySlug: "france",
    countryName: "France",
    name: "Provence",
    summary: "Carreteras entre pueblos, mercados locales, luz calida y viajes lentos centrados en comer bien.",
    description:
      "La Provenza gira menos en torno a un unico monumento y mas a una secuencia: mercados por la manana, comidas largas, carreteras escenicas y tardes en pueblos pequenos. Va muy bien para viajeros que buscan un ritmo suave y mucho caracter regional.",
    vibe: "Rutas escenicas por carretera y pueblos recorridos sin prisa",
    bestFor: ["Viajes por carretera", "Mercados", "Escapadas de verano", "Comida local"],
    gallery: ["Calles de piedra", "Puestos de mercado al aire libre", "Luz del campo"],
    stay: [
      { name: "Maison Rural", detail: "Buena base para moverse entre pueblos sin cambiar de alojamiento constantemente." },
      { name: "Posada en la Colina", detail: "Vistas, cenas sencillas y tardes mucho mas tranquilas." },
      { name: "Estancia en Finca de Lavanda", detail: "Encaja mejor en itinerarios de temporada con mucho tiempo al aire libre." },
    ],
    eat: [
      { name: "Almuerzo de Mercado Semanal", detail: "Monta la comida con producto local, pan y puestos de queso del mercado." },
      { name: "Cena en Terraza de Pueblo", detail: "Menus regionales en plazas pequenas y con un servicio mas pausado." },
      { name: "Ruta de Desayuno en Panaderias", detail: "Muy util para salir temprano hacia el siguiente pueblo." },
    ],
    visit: [
      { name: "Pueblos del Luberon", detail: "Una ruta compacta para combinar arquitectura, vistas y pequenas compras." },
      { name: "Arles y herencia romana", detail: "Aporta una capa cultural e historica mucho mas marcada." },
      { name: "Meseta de Valensole", detail: "Se disfruta mucho mas si se visita en la temporada adecuada." },
    ],
  },
  {
    slug: "rome",
    countrySlug: "italy",
    countryName: "Italy",
    name: "Rome",
    summary: "Historia en capas, calles con energia y dias largos marcados por la comida.",
    description:
      "Roma es densa, ruidosa y enormemente agradecida para quien la recorre bien. Funciona para viajeros que disfrutan caminar, parar con frecuencia y dejar que las ruinas, las plazas y las cenas de barrio marquen el ritmo del dia.",
    vibe: "Grandes ciudades historicas y caminatas de todo el dia",
    bestFor: ["Historia", "Viajes a pie", "Viajes gastronomicos", "Escapadas urbanas"],
    gallery: ["Vida en las plazas", "Ruinas antiguas", "Callejones al anochecer"],
    stay: [
      { name: "Centro Storico Rooms", detail: "Acceso rapido a los grandes monumentos y a los paseos de ultima hora." },
      { name: "Casa Urbana en Trastevere", detail: "Noches mas animadas y un barrio con mucha mas textura local." },
      { name: "Hotel de Diseno en Monti", detail: "Buen equilibrio entre estilo, gastronomia y recorridos a pie." },
    ],
    eat: [
      { name: "Ruta de Cenas por Trastevere", detail: "Ideal para quienes buscan la energia social de la ciudad al final del dia." },
      { name: "Vuelta de Espresso Matinal", detail: "Paradas cortas para cafe antes de entrar en ruinas o museos." },
      { name: "Parada Gastronomica en Testaccio", detail: "Comida mas local y con los pies en la tierra, fuera del nucleo mas turistico." },
    ],
    visit: [
      { name: "Foro y Coliseo", detail: "Conviene hacerlo temprano y dejar tiempo para las colinas de alrededor." },
      { name: "Del Panteon a Piazza Navona", detail: "Una ruta compacta llena del ritmo cotidiano de Roma." },
      { name: "Museos Vaticanos", detail: "Merece la pena reservarle medio dia completo por separado." },
    ],
  },
  {
    slug: "florence",
    countrySlug: "italy",
    countryName: "Italy",
    name: "Florence",
    summary: "Ciudad de arte compacta, colinas panoramicas y muy buena conexion para excursiones.",
    description:
      "Florencia tiene un ritmo mas compacto y caminable que Roma. Permite repartir el tiempo entre monumentos renacentistas, tardes junto al rio y escapadas sencillas a la Toscana.",
    vibe: "Fines de semana centrados en arte y entrada pausada a la Toscana",
    bestFor: ["Arte", "Recorridos a pie", "Parejas", "Acceso a la Toscana"],
    gallery: ["Skyline del Duomo", "Atardecer en el Arno", "Detalles de taller"],
    stay: [
      { name: "Hotel del Barrio del Duomo", detail: "Muy comodo para primeras visitas cortas que priorizan estar en el centro." },
      { name: "Casa de Huespedes en Oltrarno", detail: "Barrio con tradicion artesanal y un ambiente mas calmado por la tarde." },
      { name: "Suites junto al Rio", detail: "Util cuando quieres equilibrar tiempo en ciudad con alguna excursion." },
    ],
    eat: [
      { name: "Parada en Mercato Centrale", detail: "Buena variedad para grupos mixtos y comidas rapidas al mediodia." },
      { name: "Mesas de Cena en Oltrarno", detail: "Mas tranquilo que los puntos mas saturados del centro." },
      { name: "Aperitivo al Atardecer", detail: "Funciona especialmente bien si lo combinas con un mirador sobre la ciudad." },
    ],
    visit: [
      { name: "Duomo y Plaza Central", detail: "El nucleo arquitectonico que mejor resume una primera visita." },
      { name: "Visita a los Uffizi", detail: "Se disfruta mas si se plantea como una visita concentrada y no exhaustiva." },
      { name: "Piazzale Michelangelo", detail: "Un cierre muy fiable para la hora dorada." },
    ],
  },
  {
    slug: "barcelona",
    countrySlug: "spain",
    countryName: "Spain",
    name: "Barcelona",
    summary: "Energia de ciudad costera, arquitectura potente y exploracion guiada por barrios.",
    description:
      "Barcelona mezcla la facilidad de una ciudad costera con una trama urbana muy densa. Funciona especialmente bien para quienes quieren arquitectura, mercados y noches largas dentro de una ciudad compacta.",
    vibe: "Escapadas urbanas con mucho diseno y energia mediterranea",
    bestFor: ["Arquitectura", "Viajes de fin de semana", "Comida", "Ciudades de verano"],
    gallery: ["Curvas de Gaudi", "Luz de playa", "Pasillos de mercado"],
    stay: [
      { name: "Base en Eixample", detail: "Opcion equilibrada para moverse bien, comer bien y llegar con facilidad a los principales lugares." },
      { name: "Hotel Boutique en El Born", detail: "Muy buena eleccion para paseos al atardecer y calles con mas ambiente." },
      { name: "Apartamento en Barceloneta", detail: "Especialmente util si quieres dar al tiempo de playa tanta importancia como al tiempo de ciudad." },
    ],
    eat: [
      { name: "Ruta de Almuerzo por Mercados", detail: "Tapas, producto fresco y platos rapidos en mercados y espacios centrales de comida." },
      { name: "Circuito de Cenas Tardias", detail: "Barcelona recompensa a quienes retrasan el ritmo y se meten de lleno en la noche." },
      { name: "Paradas para el Vermut", detail: "Un ritual de barrio facil de encajar entre una visita importante y la siguiente." },
    ],
    visit: [
      { name: "Sagrada Família", detail: "El gran ancla de la ciudad; conviene organizar el dia alrededor de ella y no meterla con prisa." },
      { name: "Barrio Gotico", detail: "Se disfruta mas caminando sin una ruta demasiado cerrada." },
      { name: "Mirador de los Bunkers", detail: "Un cierre muy potente para ver la ciudad entera al atardecer." },
    ],
  },
];

export const countries: Country[] = [
  {
    slug: "france",
    name: "France",
    teaser: "Ciudades romanticas, escapadas reales y rutas regionales llenas de luz.",
    places: places
      .filter((place) => place.countrySlug === "france")
      .map(({ slug, name, summary, vibe }) => ({ slug, name, summary, vibe })),
  },
  {
    slug: "italy",
    name: "Italy",
    teaser: "Ciudades historicas, fines de semana entre galerias y viajes guiados por la mesa.",
    places: places
      .filter((place) => place.countrySlug === "italy")
      .map(({ slug, name, summary, vibe }) => ({ slug, name, summary, vibe })),
  },
  {
    slug: "spain",
    name: "Spain",
    teaser: "Escapadas urbanas con diseno, mercados y calidez costera.",
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

export function getPlaceByName(name: string) {
  const normalized = name.trim().toLowerCase();
  return places.find((place) => place.name.toLowerCase() === normalized);
}

export function getPlacesByCountrySlug(countrySlug: string) {
  return places.filter((place) => place.countrySlug === countrySlug);
}