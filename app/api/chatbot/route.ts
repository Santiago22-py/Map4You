import { NextResponse } from "next/server";

import { checkChatbotRateLimit, getChatbotClientId } from "@/lib/chatbot-rate-limit";
import { getChatbotReply, type ChatMessage } from "@/lib/chatbot-server";

export const runtime = "nodejs";

type ChatbotRequestBody = {
  messages?: ChatMessage[];
};

function buildRateLimitHeaders(input: { limit: number; remaining: number; resetAt: number; retryAfterSeconds: number }) {
  return {
    "Retry-After": String(input.retryAfterSeconds),
    "X-RateLimit-Limit": String(input.limit),
    "X-RateLimit-Remaining": String(input.remaining),
    "X-RateLimit-Reset": String(Math.floor(input.resetAt / 1000)),
  };
}

function isValidMessageList(messages: ChatMessage[]) {
  if (messages.length === 0 || messages.length > 12) {
    return false;
  }

  return messages.every((message) => {
    return (message.role === "user" || message.role === "assistant") && typeof message.content === "string" && message.content.trim().length > 0 && message.content.length <= 2000;
  });
}

export async function POST(request: Request) {
  try {
    const rateLimitResult = checkChatbotRateLimit(getChatbotClientId(request));

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Has enviado demasiados mensajes. Espera un momento antes de volver a intentarlo.",
        },
        {
          status: 429,
          headers: buildRateLimitHeaders(rateLimitResult),
        },
      );
    }

    const body = await request.json() as ChatbotRequestBody;
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!isValidMessageList(messages)) {
      return NextResponse.json(
        {
          error: "El formato de mensajes no es válido.",
        },
        {
          status: 400,
          headers: buildRateLimitHeaders(rateLimitResult),
        },
      );
    }

    const result = await getChatbotReply(messages);

    return NextResponse.json(result, {
      headers: buildRateLimitHeaders(rateLimitResult),
    });
  } catch {
    return NextResponse.json(
      {
        error: "No se pudo procesar el mensaje del asistente.",
      },
      { status: 500 },
    );
  }
}
