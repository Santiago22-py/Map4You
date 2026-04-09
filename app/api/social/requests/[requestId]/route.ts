import { NextResponse } from "next/server";

import { buildRateLimitHeaders, checkScopedRateLimit, getRequestClientId } from "@/lib/request-rate-limit";
import { isValidRequestId } from "@/lib/social";
import { acceptFriendRequest, deleteFriendRequest } from "@/lib/social-server";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    requestId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { requestId } = await context.params;

  if (!isValidRequestId(requestId)) {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  try {
    const friend = await acceptFriendRequest(user.id, requestId);
    return NextResponse.json({ friend });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo aceptar la solicitud.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = checkScopedRateLimit({
    clientId: `${user.id}:${getRequestClientId(_request)}`,
    scope: "social-request-action",
    limit: 20,
    windowMs: 5 * 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Has realizado demasiadas acciones sobre solicitudes. Espera un momento." },
      { status: 429, headers: buildRateLimitHeaders(rateLimitResult) },
    );
  }

  const { requestId } = await context.params;

  if (!isValidRequestId(requestId)) {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400, headers: buildRateLimitHeaders(rateLimitResult) });
  }

  try {
    await deleteFriendRequest(user.id, requestId);
    return NextResponse.json({ ok: true }, { headers: buildRateLimitHeaders(rateLimitResult) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo rechazar o cancelar la solicitud.";
    return NextResponse.json({ error: message }, { status: 400, headers: buildRateLimitHeaders(rateLimitResult) });
  }
}