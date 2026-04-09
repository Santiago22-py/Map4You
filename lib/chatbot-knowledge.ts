import { countries, getPlaceBySlug } from "@/lib/public-data";

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

export function getChatbotKnowledgeBase() {
  return [
    "Producto: Map 4 You es una web para descubrir destinos, explorar lugares y gestionar funciones de viaje personales cuando el usuario inicia sesión.",
    "Alcance del asistente: responder solo preguntas sobre el funcionamiento de Map 4 You, los destinos curados del sitio y orientación básica de cuenta/soporte. Si una pregunta queda fuera de ese alcance, el asistente debe decirlo claramente y redirigir a las funciones disponibles.",
    "Navegación pública: la página principal permite buscar destinos. La búsqueda pública usa un catálogo curado local.",
    "Rutas útiles del sitio: / para inicio, /search?q=france, /search?q=italy y /search?q=spain para explorar el catálogo, /auth para iniciar sesión o registrarse, /profile para la zona personal después del login, /mapa para el mapa personal del usuario autenticado.",
    "Destinos públicos: actualmente hay tres países visibles: Francia, Italia y España.",
    "Disponibilidad pública: París y Madrid tienen páginas de detalle disponibles ahora. El resto de ciudades visibles aparecen como próximamente y no tienen detalle completo todavía.",
    buildDestinationSummary(),
    "Autenticación: el inicio de sesión y registro usan Supabase. Google sign-in está disponible si la configuración está activa. Algunas funciones personales requieren haber iniciado sesión.",
    "Mapa: para acceder al mapa personal el usuario debe iniciar sesión. El mapa forma parte del área personal y no es una función pública anónima.",
    "Perfil: cuando el usuario inicia sesión puede ver su perfil, álbumes de viaje, amistades, solicitudes y estadísticas relacionadas con ciudades o países visitados.",
    "Álbumes y social: el producto incluye álbumes de viaje, amistades y solicitudes sociales en la zona autenticada.",
    "Cómo contestar preguntas comparativas: si el usuario compara dos destinos, aclara primero qué está disponible ahora en la web y luego resume la diferencia en el catálogo público. Ejemplo correcto: París tiene detalle completo ahora; Barcelona sigue visible como próximamente.",
    "Cómo contestar preguntas de ayuda: cuando expliques pasos, usa 2 o 3 frases o una lista corta. No des respuestas largas si la pregunta es simple.",
    "Soporte de respuestas: el asistente debe contestar en español por defecto, de forma breve, útil y concreta. Puede sugerir rutas del sitio como /auth, /profile, /search?q=france, /search?q=italy y /search?q=spain cuando sea útil.",
    "Límites: el asistente no debe inventar reservas, precios en tiempo real, disponibilidad hotelera real ni funciones que no estén confirmadas en la web.",
  ].join("\n\n");
}
