import { countries, getPlaceBySlug } from "@/lib/public-data";
import { subscriptionPlans, esimDestinations, souvenirCollections, formatEuro } from "@/lib/fake-store";

export type ChatSuggestion = {
  id: string;
  label: string;
  prompt: string;
};

export const chatbotSuggestions: ChatSuggestion[] = [
  {
    id: "map-access",
    label: "¿Cómo entro al mapa?",
    prompt: "¿Cómo puedo acceder al mapa y qué necesito para usarlo?",
  },
  {
    id: "search-destinations",
    label: "¿Qué destinos hay?",
    prompt: "¿Qué destinos están disponibles ahora en la parte pública?",
  },
  {
    id: "profile-help",
    label: "¿Qué puedo hacer en mi perfil?",
    prompt: "¿Qué funciones tengo en mi perfil cuando inicio sesión?",
  },
  {
    id: "paris-vs-barcelona",
    label: "¿París o Barcelona?",
    prompt: "¿Qué diferencia hay ahora mismo en la web entre París y Barcelona?",
  },
  {
    id: "store-overview",
    label: "¿Qué hay en la tienda?",
    prompt: "¿Qué puedo comprar o contratar en la tienda de Map 4 You?",
  },
];

function buildDestinationSummary() {
  return countries
    .map((country) => {
      const placeSummaries = country.places
        .map((place) => {
          const fullPlace = getPlaceBySlug(place.slug);
          const availability = fullPlace?.isAvailable ? "disponible ahora" : "próximamente";
          return `- ${place.name}: ${availability}. ${place.summary}`;
        })
        .join("\n");

      return `${country.name}:\n${placeSummaries}`;
    })
    .join("\n\n");
}

function buildSubscriptionPlansSummary() {
  const parts = subscriptionPlans.map((plan) => {
    const price = plan.priceEuro === 0 ? "gratis" : `${formatEuro(plan.priceEuro)}/mes`;
    const bulletList = plan.bullets.join(", ");
    return `${plan.title} (${price}): ${bulletList}`;
  });
  return `Planes de suscripción: hay ${subscriptionPlans.length} planes. ${parts.join(". ")}. Ruta: /tienda/planes.`;
}

function buildEsimSummary() {
  const destList = esimDestinations.map((dest) => {
    const price = dest.basePricePerGbDayEuro.toFixed(2).replace(".", ",");
    return `${dest.name} (desde ${price} €/GB/día)`;
  });
  return `eSIM: se pueden configurar eSIMs de datos para ${esimDestinations.length} destinos: ${destList.join(", ")}. El precio final depende de los GB diarios elegidos y la duración del viaje; hay descuentos para estancias de 10 o más días. Ruta: /tienda/esim.`;
}

function buildSouvenirsSummary() {
  const colList = souvenirCollections.map((col) => {
    const prices = col.products.map((p) => p.priceEuro);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const count = col.products.length;
    return `${col.name} (${count} producto${count !== 1 ? "s" : ""}, desde ${formatEuro(min)} hasta ${formatEuro(max)})`;
  });
  return `Souvenirs: hay colecciones de recuerdos de ${souvenirCollections.length} destinos: ${colList.join(", ")}. Son productos físicos de demostración. Ruta: /tienda/souvenirs.`;
}

export function getChatbotKnowledgeBase() {
  return [
    "Producto: Map 4 You es una web para descubrir destinos, explorar lugares y gestionar funciones de viaje personales cuando el usuario inicia sesión.",
    "Alcance del asistente: responder solo preguntas sobre el funcionamiento de Map 4 You, los destinos curados del sitio y orientación básica de cuenta/soporte. Si una pregunta queda fuera de ese alcance, el asistente debe decirlo claramente y redirigir a las funciones disponibles.",
    "Navegación pública: la página principal permite buscar destinos. La búsqueda pública usa un catálogo curado local.",
    "Rutas útiles del sitio: / para inicio, /search?q=france, /search?q=italy y /search?q=spain para explorar el catálogo, /auth para iniciar sesión o registrarse, /profile para la zona personal después del login, /mapa para el mapa personal del usuario autenticado, /tienda para la tienda, /tienda/planes para los planes de suscripción, /tienda/esim para la eSIM y /tienda/souvenirs para los souvenirs.",
    "Destinos públicos: actualmente hay tres países visibles: Francia, Italia y España.",
    "Disponibilidad pública: París y Madrid tienen páginas de detalle disponibles ahora. El resto de ciudades visibles aparecen como próximamente y no tienen detalle completo todavía.",
    buildDestinationSummary(),
    "Autenticación: el inicio de sesión y registro usan Supabase. Google sign-in está disponible si la configuración está activa. Algunas funciones personales requieren haber iniciado sesión.",
    "Mapa: para acceder al mapa personal el usuario debe iniciar sesión. El mapa forma parte del área personal y no es una función pública anónima.",
    "Perfil: cuando el usuario inicia sesión puede ver su perfil, álbumes de viaje, amistades, solicitudes y estadísticas relacionadas con ciudades o países visitados.",
    "Álbumes y social: el producto incluye álbumes de viaje, amistades y solicitudes sociales en la zona autenticada.",
    "Tienda (mock): Map 4 You tiene una tienda demo accesible en /tienda con tres secciones: souvenirs, planes de suscripción y eSIM. Es una tienda de demostración, los pagos no son reales pero el flujo completo está simulado.",
    buildSubscriptionPlansSummary(),
    buildEsimSummary(),
    buildSouvenirsSummary(),
    "Cómo contestar preguntas comparativas: si el usuario compara dos destinos, aclara primero qué está disponible ahora en la web y luego resume la diferencia en el catálogo público. Ejemplo correcto: París tiene detalle completo ahora; Barcelona sigue visible como próximamente.",
    "Cómo contestar preguntas de ayuda: cuando expliques pasos, usa 2 o 3 frases o una lista corta. No des respuestas largas si la pregunta es simple.",
    "Soporte de respuestas: el asistente debe contestar en español por defecto, de forma breve, útil y concreta. Puede sugerir rutas del sitio como /auth, /profile, /search?q=france, /search?q=italy, /search?q=spain, /tienda, /tienda/planes, /tienda/esim y /tienda/souvenirs cuando sea útil.",
    "Límites: el asistente no debe inventar reservas, precios en tiempo real, disponibilidad hotelera real ni funciones que no estén confirmadas en la web.",
  ].join("\n\n");
}
