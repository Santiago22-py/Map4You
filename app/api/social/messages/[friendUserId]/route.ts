import { NextResponse } from "next/server";

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

  try {
    const { friendUserId } = await context.params;
    const messages = await getConversation(user.id, friendUserId);
    return NextResponse.json({ encryptionConfigured: true, messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar la conversación.";
    const status = message.includes("MESSAGE_ENCRYPTION_KEY") ? 503 : 400;
    return NextResponse.json({ encryptionConfigured: false, error: message, messages: [] }, { status });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { content?: string } | null;
  const content = body?.content ?? "";

  try {
    const { friendUserId } = await context.params;
    const message = await sendMessageToFriend(user.id, friendUserId, content);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo enviar el mensaje.";
    const status = message.includes("MESSAGE_ENCRYPTION_KEY") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
