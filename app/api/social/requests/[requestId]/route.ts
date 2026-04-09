import { NextResponse } from "next/server";

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

  const { requestId } = await context.params;

  try {
    await deleteFriendRequest(user.id, requestId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo rechazar o cancelar la solicitud.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}