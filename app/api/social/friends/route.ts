import { NextResponse } from "next/server";

import { getUserFriends } from "@/lib/social-server";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const friends = await getUserFriends(user.id);
  return NextResponse.json({ friends });
}

export async function POST() {
  return NextResponse.json({ error: "Usa /api/social/requests para enviar solicitudes." }, { status: 405 });
}
