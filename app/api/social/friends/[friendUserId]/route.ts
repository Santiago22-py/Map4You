import { NextResponse } from "next/server";

import { buildRateLimitHeaders, checkScopedRateLimit, getRequestClientId } from "@/lib/request-rate-limit";
import { isValidUserId } from "@/lib/social";
import { removeFriend } from "@/lib/social-server";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    friendUserId: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = checkScopedRateLimit({
    clientId: `${user.id}:${getRequestClientId(_request)}`,
    scope: "social-friend-delete",
    limit: 10,
    windowMs: 5 * 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Has realizado demasiadas acciones sobre amistades. Espera un momento." },
      { status: 429, headers: buildRateLimitHeaders(rateLimitResult) },
    );
  }

  const { friendUserId } = await context.params;

  if (!isValidUserId(friendUserId)) {
    return NextResponse.json({ error: "El identificador del amigo no es válido." }, { status: 400, headers: buildRateLimitHeaders(rateLimitResult) });
  }

  try {
    await removeFriend(user.id, friendUserId);
    return NextResponse.json({ ok: true }, { headers: buildRateLimitHeaders(rateLimitResult) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar el amigo.";
    return NextResponse.json({ error: message }, { status: 400, headers: buildRateLimitHeaders(rateLimitResult) });
  }
}
