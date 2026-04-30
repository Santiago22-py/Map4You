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

export type EsimPlan = {
  slug: string;
  title: string;
  imageUrl: string;
  blurb: string;
  dataLabel: string;
  durationLabel: string;
  features: string[];
  priceEuro: number;
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

export const esimPlans: EsimPlan[] = [
  {
    slug: "basico",
    title: "Plan Básico",
    imageUrl: "/images/Monetize/EsimPage/Europa.png",
    blurb: "Ideal para escapadas cortas o puentes. Datos suficientes para navegar sin preocupaciones.",
    dataLabel: "5 GB",
    durationLabel: "7 días",
    features: [
      "5 GB de datos durante 7 días",
      "Activación mediante código QR",
      "Mantén tu línea principal activa para llamadas y WhatsApp",
      "Sin permanencia",
      "Compatible con iPhone y Android",
    ],
    priceEuro: 9,
  },
  {
    slug: "estandar",
    title: "Plan Estándar",
    imageUrl: "/images/Monetize/EsimPage/Mundo.png",
    blurb: "Perfecto para vacaciones de duración media. Navega sin límites durante dos semanas.",
    dataLabel: "15-20 GB",
    durationLabel: "15 días",
    features: [
      "Hasta 20 GB de datos durante 15 días",
      "Activación mediante código QR",
      "Cobertura multired con cambio automático entre redes locales",
      "Compartir datos permitido",
      "Sin tarjeta física ni permanencia",
    ],
    priceEuro: 18,
  },
  {
    slug: "premium",
    title: "Plan Premium",
    imageUrl: "/images/Monetize/EsimPage/Brasil.png",
    blurb: "La opción más completa para viajes largos. Datos ilimitados durante un mes entero.",
    dataLabel: "Ilimitados",
    durationLabel: "30 días",
    features: [
      "Datos ilimitados durante 30 días",
      "Activación mediante código QR",
      "Red 4G/5G en más de 110 destinos",
      "Panel de consumo demo incluido",
      "Sin permanencia ni tarjeta física",
    ],
    priceEuro: 35,
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
    slug: "esencial",
    name: "Pack Esencial",
    heroImageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir1.png"),
    summary: "Lo justo para recordar el viaje. Un imán de diseño exclusivo, un llavero Map4You y dos postales personalizadas con tus destinos favoritos.",
    teaser: "Pack Esencial",
    products: [
      {
        id: "pack-esencial",
        name: "Pack Esencial",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir1.png"),
        priceEuro: 12.50,
        description: "1 imán de diseño exclusivo + 1 llavero Map4You + 2 postales personalizadas.",
      },
    ],
  },
  {
    slug: "explorador",
    name: "Pack Explorador",
    heroImageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir2.png"),
    summary: "Para quienes quieren ir un paso más allá. Una camiseta de diseño del país o ciudad, una taza de cerámica y un imán de recuerdo.",
    teaser: "Pack Explorador",
    products: [
      {
        id: "pack-explorador",
        name: "Pack Explorador",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir2.png"),
        priceEuro: 29,
        description: "1 camiseta de diseño (país/ciudad) + 1 taza de cerámica + 1 imán.",
      },
    ],
  },
  {
    slug: "premium",
    name: "Pack Premium",
    heroImageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir3.png"),
    summary: "La experiencia completa del viajero. Una tote bag orgánica, camiseta, libreta de viaje Map4You y un pack de pegatinas de los sitios visitados.",
    teaser: "Pack Premium",
    products: [
      {
        id: "pack-premium",
        name: "Pack Premium",
        imageUrl: withSouvenirImageVersion("/images/Monetize/SouvenirsPage/Souvenir3.png"),
        priceEuro: 48,
        description: "1 tote bag orgánica + 1 camiseta + 1 libreta de viaje Map4You + 1 pack de pegatinas de los sitios visitados.",
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

export function getEsimPlan(slug: string) {
  return esimPlans.find((plan) => plan.slug === slug) ?? null;
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