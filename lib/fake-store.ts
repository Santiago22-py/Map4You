export type StoreFeatureCard = {
  title: string;
  description: string;
  href: string;
  cta: string;
  imageUrl?: string;
  tagline?: string;
};

export type SubscriptionPlan = {
  id: string;
  title: string;
  accent: "slate" | "blue" | "orange";
  intro: string;
  bullets: string[];
  outro: string;
  priceEuro: number;
  priceLabel: string;
};

export type EsimDestination = {
  slug: string;
  name: string;
  imageUrl: string;
  blurb: string;
  coverage: string;
  activation: string;
  infoNote: string;
  conditions: string[];
  basePricePerGbDayEuro: number;
  activationFeeEuro: number;
  gbPerDayOptions: number[];
};

export type SouvenirProduct = {
  id: string;
  name: string;
  imageUrl: string;
  priceEuro: number;
  description: string;
};

export type SouvenirCollection = {
  slug: string;
  name: string;
  heroImageUrl: string;
  summary: string;
  teaser: string;
  products: SouvenirProduct[];
};

const souvenirImageVersion = "souvenirs-2026-04-09";

function withSouvenirImageVersion(path: string) {
  return `${path}?v=${souvenirImageVersion}`;
}

export const storeFeatureCards: StoreFeatureCard[] = [
  {
    title: "Tienda de souvenirs",
    description: "Llévate tus viajes contigo. Convierte tus experiencias en recuerdos personalizados mediante nuestros packs de souvenirs.",
    href: "/tienda/souvenirs",
    cta: "Visitar tienda",
    imageUrl: "/images/Monetize/Tienda.png",
  },
  {
    title: "Planes de suscripción",
    description: "Accede a funciones exclusivas que te ayudan a organizar mejor y disfrutar más cada viaje.",
    href: "/tienda/planes",
    cta: "Descubrir planes",
    imageUrl: "/images/Monetize/subscriptions.png",
    tagline: "Organiza, viaja y comparte sin límites.",
  },
  {
    title: "Consigue tu eSIM",
    description: "Conéctate desde el primer minuto en tu destino. Compra tu eSIM de datos de forma rápida y disfruta de internet sin complicaciones en el extranjero.",
    href: "/tienda/esim",
    cta: "Conseguir mi eSIM",
    imageUrl: "/images/Monetize/esim.png",
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "nomada",
    title: "Plan Nómada",
    accent: "slate",
    intro: "Este plan te permite organizar tus viajes de forma sencilla e intuitiva, con acceso a funciones esenciales:",
    bullets: [
      "Búsqueda de destinos",
      "Creación de hasta 3 itinerarios",
      "Chat social",
      "Mapa online",
      "Recomendaciones básicas con chatbot",
      "Creación de hasta 3 álbumes",
    ],
    outro: "Es perfecto para viajeros ocasionales que quieren tener todo bajo control sin complicarse.",
    priceEuro: 0,
    priceLabel: "GRATIS",
  },
  {
    id: "aventurero",
    title: "Plan Aventurero",
    accent: "blue",
    intro: "Para viajeros que quieren ir un paso más allá. Incluye herramientas avanzadas para optimizar tu viaje.",
    bullets: [
      "Búsqueda de destinos",
      "Creación de itinerarios ilimitados",
      "Chat social",
      "Mapa offline para viajar sin conexión",
      "Pack de 5 souvenirs con descuento",
      "Recomendaciones con chatbot",
      "Creación de álbumes ilimitada",
    ],
    outro: "La opción más equilibrada para quien viaja varias veces al año y quiere una experiencia más completa.",
    priceEuro: 9.95,
    priceLabel: "9,95 Euros al mes",
  },
  {
    id: "explorador",
    title: "Plan Explorador",
    accent: "orange",
    intro: "La experiencia más completa y personalizada. Incluye todas las funcionalidades anteriores y:",
    bullets: [
      "Descuento en eSIM del 20%",
      "1 pack de souvenirs gratuito",
      "Planificación colaborativa en tiempo real con amigos",
      "Acceso a un agente de viajes que ayuda a diseñar y organizar tu viaje a medida",
    ],
    outro: "Perfecto para quienes buscan comodidad total y un servicio altamente personalizado.",
    priceEuro: 29.99,
    priceLabel: "29,99 Euros al mes",
  },
];

export const esimDestinations: EsimDestination[] = [
  {
    slug: "mundo",
    name: "Mundo",
    imageUrl: "/images/Monetize/EsimPage/Mundo.png",
    blurb: "Cobertura flexible para viajes con varias escalas y cambios de país.",
    coverage: "Más de 110 destinos activos con activación inmediata al aterrizar.",
    activation: "Se activa con código QR y mantiene tu línea principal disponible para llamadas y WhatsApp.",
    infoNote: "Ideal para viajes largos, interrail, luna de miel o rutas con varios tramos internacionales.",
    conditions: ["Sin permanencia", "Activación desde la app", "Recarga demo disponible"],
    basePricePerGbDayEuro: 0.92,
    activationFeeEuro: 4.5,
    gbPerDayOptions: [1, 2, 3, 5, 10],
  },
  {
    slug: "europa",
    name: "Europa",
    imageUrl: "/images/Monetize/EsimPage/Europa.png",
    blurb: "Para moverte por la UE con datos estables y sin depender del roaming clásico.",
    coverage: "Funciona en 39 países europeos con cambio automático entre redes locales.",
    activation: "Instalación en menos de dos minutos y control del consumo desde el panel demo.",
    infoNote: "Muy útil para city breaks, Erasmus, viajes de negocios y rutas por varias capitales.",
    conditions: ["Cobertura multired", "Sin tarjeta física", "Compartir datos permitido"],
    basePricePerGbDayEuro: 0.58,
    activationFeeEuro: 2.9,
    gbPerDayOptions: [1, 2, 3, 5, 8],
  },
  {
    slug: "japon",
    name: "Japón",
    imageUrl: "/images/Monetize/EsimPage/Japon.png",
    blurb: "Pensada para navegar bien entre ciudades, estaciones y mapas sin cortes.",
    coverage: "Cobertura nacional enfocada en Tokio, Kioto, Osaka y conexiones de alta velocidad.",
    activation: "Compra, escanea y empieza a usar datos antes de salir del aeropuerto.",
    infoNote: "Perfecta si dependes de mapas, traducción y reservas en tiempo real durante el viaje.",
    conditions: ["Red 4G/5G local", "Uso intensivo de mapas", "Sin permanencia"],
    basePricePerGbDayEuro: 0.84,
    activationFeeEuro: 4.2,
    gbPerDayOptions: [1, 2, 3, 5, 7],
  },
  {
    slug: "australia",
    name: "Australia",
    imageUrl: "/images/Monetize/EsimPage/Australia.png",
    blurb: "Cobertura pensada para grandes distancias, road trips y varios cambios de ciudad.",
    coverage: "Incluye zonas urbanas prioritarias y respaldo para trayectos entre costa este y oeste.",
    activation: "Actívala antes de despegar para llegar con datos desde el primer minuto.",
    infoNote: "Recomendable para viajes largos, work & holiday o rutas entre Sídney, Melbourne y Brisbane.",
    conditions: ["Sin contrato", "Activación QR", "Panel de consumo demo"],
    basePricePerGbDayEuro: 0.88,
    activationFeeEuro: 4.8,
    gbPerDayOptions: [1, 2, 4, 6, 10],
  },
  {
    slug: "brasil",
    name: "Brasil",
    imageUrl: "/images/Monetize/EsimPage/Brasil.png",
    blurb: "Buena opción para combinar playas, ciudades grandes y trayectos internos con conexión constante.",
    coverage: "Datos rápidos en Río, São Paulo, Salvador y principales zonas turísticas.",
    activation: "Configuración guiada en la app y conexión inmediata tras validar el QR.",
    infoNote: "Pensada para subir contenido, pedir transporte y mantener ubicaciones compartidas durante el viaje.",
    conditions: ["Sin roaming extra", "Compatible con iPhone y Android", "Compra demo en euros"],
    basePricePerGbDayEuro: 0.74,
    activationFeeEuro: 3.6,
    gbPerDayOptions: [1, 2, 3, 5, 8],
  },
];

export const souvenirCollections: SouvenirCollection[] = [
  {
    slug: "espana",
    name: "España",
    heroImageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir1.png"),
    summary: "Cerámica, ilustraciones, sabores y objetos pequeños que convierten un itinerario por España en recuerdos fáciles de regalar.",
    teaser: "Recuerdos de España",
    products: [
      {
        id: "espana-azulejo",
        name: "Cuencos de cerámica pintados a mano",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/EspanaSouveniurs/SouvenirSpain1.jpg"),
        priceEuro: 14,
        description: "Piezas artesanales llenas de color, típicas de mercados locales.",
      },
      {
        id: "espana-vasos",
        name: "Alpargatas tradicionales",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/EspanaSouveniurs/SouvenirSpain2.jpg"),
        priceEuro: 22,
        description: "Calzado ligero y cómodo, un clásico del verano mediterráneo.",
      },
      {
        id: "espana-imanes",
        name: "Imanes de Sevilla hechos a mano",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/EspanaSouveniurs/SouvenirSpain3.jpg"),
        priceEuro: 9,
        description: "Recuerdos coloridos con iconos típicos de la ciudad.",
      },
      {
        id: "espana-poster",
        name: "Cerámica rústica tradicional",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/EspanaSouveniurs/SouvenirSpain4.avif"),
        priceEuro: 18,
        description: "Utensilios de barro ideales para cocina o decoración.",
      },
      {
        id: "espana-bolsa",
        name: "Jamón ibérico y embutidos",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/EspanaSouveniurs/SouvenirSpain5.jpg"),
        priceEuro: 12,
        description: "Selección gourmet de sabores tradicionales españoles.",
      },
      {
        id: "espana-libreta",
        name: "Abanicos artesanales",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/EspanaSouveniurs/SouvenirSpain6.jpg"),
        priceEuro: 11,
        description: "Accesorio elegante y práctico, típico de la cultura española.",
      },
      {
        id: "espana-postales",
        name: "Delicias gourmet en conserva",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/EspanaSouveniurs/SouvenirSpain7.jpg"),
        priceEuro: 10,
        description: "Pequeños sabores locales perfectos para degustar o regalar.",
      },
      {
        id: "espana-cesta",
        name: "Figura decorativa de toro",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/EspanaSouveniurs/SouvenirSpain8.jpg"),
        priceEuro: 26,
        description: "Pieza colorida inspirada en la tradición y cultura española.",
      },
    ],
  },
  {
    slug: "portugal",
    name: "Portugal",
    heroImageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir2.png"),
    summary: "Una selección de piezas coloridas y objetos pequeños con espíritu atlántico.",
    teaser: "Recuerdos de Portugal",
    products: [
      {
        id: "portugal-ceramica",
        name: "Cerámica atlántica",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir2.png"),
        priceEuro: 19,
        description: "Colores intensos y acabado artesanal para recordar tu ruta.",
      },
      {
        id: "portugal-pack",
        name: "Pack postal costero",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir1.png"),
        priceEuro: 13,
        description: "Un recuerdo ligero para compartir después del viaje.",
      },
    ],
  },
  {
    slug: "brasil",
    name: "Brasil",
    heroImageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir3.png"),
    summary: "Texturas, color y objetos con estética tropical para una colección más viva.",
    teaser: "Recuerdos de Brasil",
    products: [
      {
        id: "brasil-kit",
        name: "Kit de mesa tropical",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir3.png"),
        priceEuro: 21,
        description: "Piezas ligeras para revivir la parte más cálida del viaje.",
      },
      {
        id: "brasil-imanes",
        name: "Imanes color mercado",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir4.png"),
        priceEuro: 9,
        description: "Pequeño set con mucho color y fácil de regalar.",
      },
    ],
  },
  {
    slug: "japon",
    name: "Japón",
    heroImageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir5.jpg"),
    summary: "Piezas visuales, minimalistas y ordenadas para una colección más serena.",
    teaser: "Recuerdos de Japón",
    products: [
      {
        id: "japon-lamina",
        name: "Lámina de estación",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir5.jpg"),
        priceEuro: 17,
        description: "Impresión cuidada para una pared o escritorio de viaje.",
      },
      {
        id: "japon-pack",
        name: "Pack de recuerdos urbanos",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir1.png"),
        priceEuro: 15,
        description: "Selección compacta para regalar sin ocupar espacio.",
      },
    ],
  },
];

export function formatEuro(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function getEsimDestination(slug: string) {
  return esimDestinations.find((destination) => destination.slug === slug) ?? null;
}

export function getSubscriptionPlan(planId: string) {
  return subscriptionPlans.find((plan) => plan.id === planId) ?? null;
}

export function getSouvenirCollection(slug: string) {
  return souvenirCollections.find((collection) => collection.slug === slug) ?? null;
}

export function clampEsimGbPerDay(destination: EsimDestination, requestedGbPerDay?: number | null) {
  if (!requestedGbPerDay || Number.isNaN(requestedGbPerDay)) {
    return destination.gbPerDayOptions[1] ?? destination.gbPerDayOptions[0] ?? 1;
  }

  return destination.gbPerDayOptions.includes(requestedGbPerDay)
    ? requestedGbPerDay
    : destination.gbPerDayOptions[1] ?? destination.gbPerDayOptions[0] ?? 1;
}

export function getEsimDurationDays(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }

  const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffMs = normalizedEnd.getTime() - normalizedStart.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  return Math.max(1, diffDays + 1);
}

export function calculateEsimQuote(destination: EsimDestination, gbPerDay: number, startDate: string, endDate: string) {
  const durationDays = getEsimDurationDays(startDate, endDate);
  const rawDataCharge = durationDays * gbPerDay * destination.basePricePerGbDayEuro;
  const durationDiscount = durationDays >= 21 ? 0.9 : durationDays >= 10 ? 0.95 : 1;
  const dataCharge = Number((rawDataCharge * durationDiscount).toFixed(2));
  const total = Number((destination.activationFeeEuro + dataCharge).toFixed(2));

  return {
    durationDays,
    totalDataGb: durationDays * gbPerDay,
    dataCharge,
    total,
  };
}