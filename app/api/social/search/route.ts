import { NextResponse } from "next/server";

import { buildRateLimitHeaders, checkScopedRateLimit, getRequestClientId } from "@/lib/request-rate-limit";
import { searchProfilesToFriend } from "@/lib/social-server";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const rateLimitResult = checkScopedRateLimit({
    clientId: `${user.id}:${getRequestClientId(request)}`,
    scope: "social-search",
    limit: 20,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Has hecho demasiadas búsquedas. Espera un momento e inténtalo otra vez." },
      { status: 429, headers: buildRateLimitHeaders(rateLimitResult) },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] }, { headers: buildRateLimitHeaders(rateLimitResult) });
  }

  const results = await searchProfilesToFriend(user.id, query);
  return NextResponse.json({ results }, { headers: buildRateLimitHeaders(rateLimitResult) });
}
