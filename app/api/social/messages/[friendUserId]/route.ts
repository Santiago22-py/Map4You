import { NextResponse } from "next/server";

import { buildRateLimitHeaders, checkScopedRateLimit, getRequestClientId } from "@/lib/request-rate-limit";
import { isValidUserId } from "@/lib/social";
import { getConversation, sendMessageToFriend } from "@/lib/social-server";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    friendUserId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = checkScopedRateLimit({
    clientId: `${user.id}:${getRequestClientId(_request)}`,
    scope: "social-message-read",
    limit: 50,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Has hecho demasiadas peticiones al chat. Espera un momento." },
      { status: 429, headers: buildRateLimitHeaders(rateLimitResult) },
    );
  }

  try {
    const { friendUserId } = await context.params;

    if (!isValidUserId(friendUserId)) {
      return NextResponse.json({ encryptionConfigured: true, error: "El identificador del amigo no es válido.", messages: [] }, { status: 400, headers: buildRateLimitHeaders(rateLimitResult) });
    }

    const messages = await getConversation(user.id, friendUserId);
    return NextResponse.json({ encryptionConfigured: true, messages }, { headers: buildRateLimitHeaders(rateLimitResult) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar la conversación.";
    const status = message.includes("MESSAGE_ENCRYPTION_KEY") ? 503 : 400;
    return NextResponse.json({ encryptionConfigured: false, error: message, messages: [] }, { status, headers: buildRateLimitHeaders(rateLimitResult) });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = checkScopedRateLimit({
    clientId: `${user.id}:${getRequestClientId(request)}`,
    scope: "social-message-send",
    limit: 25,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Has enviado demasiados mensajes en poco tiempo. Espera un momento." },
      { status: 429, headers: buildRateLimitHeaders(rateLimitResult) },
    );
  }

  const body = (await request.json().catch(() => null)) as { content?: string } | null;
  const content = body?.content ?? "";

  try {
    const { friendUserId } = await context.params;

    if (!isValidUserId(friendUserId)) {
      return NextResponse.json({ error: "El identificador del amigo no es válido." }, { status: 400, headers: buildRateLimitHeaders(rateLimitResult) });
    }

    const message = await sendMessageToFriend(user.id, friendUserId, content);
    return NextResponse.json({ message }, { status: 201, headers: buildRateLimitHeaders(rateLimitResult) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo enviar el mensaje.";
    const status = message.includes("MESSAGE_ENCRYPTION_KEY") ? 503 : 400;
    return NextResponse.json({ error: message }, { status, headers: buildRateLimitHeaders(rateLimitResult) });
  }
}
