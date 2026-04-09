import { NextResponse } from "next/server";

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

  const { friendUserId } = await context.params;

  try {
    await removeFriend(user.id, friendUserId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar el amigo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
