import { getCurrentUser } from "@/lib/supabase/server";

import { getChatbotKnowledgeBase } from "@/lib/chatbot-knowledge";

type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatbotResponse = {
  reply: string;
  signedIn: boolean;
};

type QuestionFocus = "public-destination" | "account" | "navigation" | "general";

const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/$/, "") ?? "";
const azureApiKey = process.env.AZURE_OPENAI_API_KEY ?? "";
const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT ?? "";
const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";
const azureRequestTimeoutMs = 12000;

function hasAzureChatbotConfig() {
  return Boolean(azureEndpoint && azureApiKey && azureDeployment);
}

function detectQuestionFocus(message: string): QuestionFocus {
  const normalized = message.toLowerCase();

  if (/(perfil|album|álbum|amigos|solicitudes|cuenta|login|iniciar sesión|registr|auth|mapa)/.test(normalized)) {
    return "account";
  }

  if (/(paris|parís|madrid|barcelona|francia|italia|españa|espana|destino|ciudad|catalogo|catálogo)/.test(normalized)) {
    return "public-destination";
  }

  if (/(como|cómo|donde|dónde|entrar|acceder|buscar|usar|web|sitio|pagina|página)/.test(normalized)) {
    return "navigation";
  }

  return "general";
}

function buildFocusGuidance(message: string, signedIn: boolean) {
  const focus = detectQuestionFocus(message);

  if (focus === "public-destination") {
    return "La pregunta actual es sobre destinos visibles o disponibilidad pública. Responde centrándote en el catálogo público y evita mencionar funciones autenticadas como perfil, mapa o amistades salvo que el usuario las pida de forma explícita.";
  }

  if (focus === "account") {
    return signedIn
      ? "La pregunta actual es sobre funciones autenticadas. Responde solo con las funciones personales reales del sitio y evita hablar de destinos si no ayuda a resolver la duda."
      : "La pregunta actual es sobre funciones autenticadas. Explica claramente cuándo hace falta iniciar sesión y guía hacia /auth si es necesario.";
  }

  if (focus === "navigation") {
    return "La pregunta actual es de navegación o uso del sitio. Responde con pasos concretos y rutas internas si ayudan, sin añadir información fuera de la pregunta.";
  }

  return "Mantén la respuesta estrictamente enfocada en la última pregunta del usuario y evita mezclar categorías no solicitadas.";
}

function buildSystemPrompt(input: { signedIn: boolean; latestUserMessage: string }) {
  const authContext = input.signedIn
    ? "El usuario actual ha iniciado sesión, así que puedes mencionar funciones autenticadas como perfil, mapa, álbumes y amistades, pero nunca inventes datos privados ni afirmes haber leído información personal concreta."
    : "El usuario actual no ha iniciado sesión o no se debe asumir acceso privado. Cuando una acción requiera login, indícalo claramente.";

  return [
    "Eres Asistente Map 4 You, el chatbot de ayuda del sitio Map 4 You.",
    "Responde en español, con tono claro, útil y directo.",
    "Solo puedes responder sobre el funcionamiento del sitio, los destinos curados visibles y ayuda básica de cuenta/soporte.",
    "Si no sabes algo o no está dentro del alcance del sitio, dilo sin inventar.",
    "Prioriza respuestas breves: normalmente 2 o 3 frases. Usa listas solo si el usuario pide pasos o varias opciones.",
    "No mezcles funciones autenticadas en respuestas sobre destinos públicos salvo que el usuario lo pida o sea imprescindible para responder correctamente.",
    "Cuando sea útil, menciona rutas internas concretas del sitio para guiar al usuario.",
    "Si comparas destinos, explica claramente qué está disponible ahora en la web y qué sigue marcado como próximamente.",
    authContext,
    buildFocusGuidance(input.latestUserMessage, input.signedIn),
    "Base de conocimiento:\n" + getChatbotKnowledgeBase(),
  ].join("\n\n");
}

function sanitizeConversation(messages: ChatMessage[]) {
  return messages
    .filter((message) => (message.role === "user" || message.role === "assistant") && message.content.trim().length > 0)
    .slice(-8)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 1200),
    }));
}

function fallbackReply(input: { message: string; signedIn: boolean }) {
  const normalized = input.message.toLowerCase();

  if (normalized.includes("mapa")) {
    return input.signedIn
      ? "Puedes entrar al mapa desde tu zona personal una vez iniciada la sesión. Si ya estás dentro de tu cuenta, revisa la navegación de perfil y mapa para registrar países visitados."
      : "Para usar el mapa personal necesitas iniciar sesión primero. Entra en /auth y, después, accede a tu zona de perfil para encontrar el mapa.";
  }

  if (normalized.includes("paris") || normalized.includes("parís") || normalized.includes("madrid")) {
    return "Ahora mismo París y Madrid son los destinos con detalle completo dentro del catálogo público. Puedes abrirlos desde la búsqueda pública usando Francia o España.";
  }

  if (normalized.includes("barcelona")) {
    return "Barcelona aparece en el catálogo público, pero ahora mismo sigue marcada como próximamente y todavía no tiene página de detalle completa.";
  }

  if (normalized.includes("francia") || normalized.includes("italia") || normalized.includes("españa") || normalized.includes("espana")) {
    return "La navegación pública usa un catálogo curado con Francia, Italia y España. Puedes explorar esos países desde la búsqueda principal y, por ahora, París y Madrid son los destinos con detalle completo.";
  }

  if (normalized.includes("perfil") || normalized.includes("album") || normalized.includes("álbum") || normalized.includes("amigos")) {
    return input.signedIn
      ? "Dentro de tu perfil puedes revisar álbumes de viaje, amistades, solicitudes y estadísticas relacionadas con tu actividad."
      : "Las funciones de perfil, álbumes y amistades forman parte de la zona autenticada. Primero inicia sesión en /auth para acceder a ellas.";
  }

  return "Puedo ayudarte con cómo usar Map 4 You, con los destinos curados visibles y con dudas básicas de cuenta. Por ejemplo, puedes preguntarme cómo entrar al mapa, qué destinos hay disponibles o qué puedes hacer en tu perfil.";
}

async function callAzureChat(messages: ChatMessage[], signedIn: boolean) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content.trim() ?? "";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), azureRequestTimeoutMs);

  const response = await fetch(`${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=${azureApiVersion}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": azureApiKey,
    },
    signal: controller.signal,
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: buildSystemPrompt({ signedIn, latestUserMessage }),
        },
        ...sanitizeConversation(messages),
      ],
      reasoning_effort: "minimal",
      max_completion_tokens: 320,
    }),
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure chatbot request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json() as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => part.text?.trim() ?? "")
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("[chatbot] Azure response had no parsable content", JSON.stringify(data).slice(0, 2000));
  }

  return "";
}

export async function getChatbotReply(messages: ChatMessage[]): Promise<ChatbotResponse> {
  const user = await getCurrentUser();
  const signedIn = Boolean(user);
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content.trim() ?? "";

  if (!latestUserMessage) {
    return {
      reply: "Escribe una pregunta sobre cómo usar Map 4 You y te ayudo.",
      signedIn,
    };
  }

  if (!hasAzureChatbotConfig()) {
    return {
      reply: fallbackReply({ message: latestUserMessage, signedIn }),
      signedIn,
    };
  }

  try {
    const reply = await callAzureChat(messages, signedIn);

    if (!reply) {
      return {
        reply: fallbackReply({ message: latestUserMessage, signedIn }),
        signedIn,
      };
    }

    return {
      reply,
      signedIn,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "azure-request-failed";
    console.error("[chatbot] Azure request failed", reason);

    return {
      reply: fallbackReply({ message: latestUserMessage, signedIn }),
      signedIn,
    };
  }
}
