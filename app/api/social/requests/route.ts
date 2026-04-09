import { NextResponse } from "next/server";

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

  const body = (await request.json().catch(() => null)) as { friendUserId?: string } | null;
  const friendUserId = body?.friendUserId?.trim();

  if (!friendUserId) {
    return NextResponse.json({ error: "Falta el perfil al que quieres enviar la solicitud." }, { status: 400 });
  }

  try {
    const requestSummary = await createFriendRequest(user.id, friendUserId);
    return NextResponse.json({ request: requestSummary }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo enviar la solicitud.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}