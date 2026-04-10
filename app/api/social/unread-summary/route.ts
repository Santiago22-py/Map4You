import { NextResponse } from "next/server";

import { buildRateLimitHeaders, checkScopedRateLimit, getRequestClientId } from "@/lib/request-rate-limit";
import { getUnreadMessageSummaries } from "@/lib/social-server";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = checkScopedRateLimit({
    clientId: `${user.id}:${getRequestClientId(request)}`,
    scope: "social-unread-summary",
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Has hecho demasiadas peticiones al resumen de mensajes. Espera un momento." },
      { status: 429, headers: buildRateLimitHeaders(rateLimitResult) },
    );
  }

  try {
    const summaries = await getUnreadMessageSummaries(user.id);
    return NextResponse.json({ summaries }, { headers: buildRateLimitHeaders(rateLimitResult) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar el resumen de mensajes.";
    return NextResponse.json({ error: message, summaries: [] }, { status: 400, headers: buildRateLimitHeaders(rateLimitResult) });
  }
}