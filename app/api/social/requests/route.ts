import { NextResponse } from "next/server";

import { buildRateLimitHeaders, checkScopedRateLimit, getRequestClientId } from "@/lib/request-rate-limit";
import { isValidUserId } from "@/lib/social";
import { createFriendRequest, getUserFriendRequests } from "@/lib/social-server";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const requests = await getUserFriendRequests(user.id);
  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = checkScopedRateLimit({
    clientId: `${user.id}:${getRequestClientId(request)}`,
    scope: "social-request-create",
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Has enviado demasiadas solicitudes en poco tiempo. Espera antes de volver a intentarlo." },
      { status: 429, headers: buildRateLimitHeaders(rateLimitResult) },
    );
  }

  const body = (await request.json().catch(() => null)) as { friendUserId?: string } | null;
  const friendUserId = body?.friendUserId?.trim();

  if (!friendUserId) {
    return NextResponse.json({ error: "Falta el perfil al que quieres enviar la solicitud." }, { status: 400, headers: buildRateLimitHeaders(rateLimitResult) });
  }

  if (!isValidUserId(friendUserId)) {
    return NextResponse.json({ error: "El identificador del perfil no es válido." }, { status: 400, headers: buildRateLimitHeaders(rateLimitResult) });
  }

  try {
    const requestSummary = await createFriendRequest(user.id, friendUserId);
    return NextResponse.json({ request: requestSummary }, { status: 201, headers: buildRateLimitHeaders(rateLimitResult) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo enviar la solicitud.";
    return NextResponse.json({ error: message }, { status: 400, headers: buildRateLimitHeaders(rateLimitResult) });
  }
}