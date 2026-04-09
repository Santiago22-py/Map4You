import { NextRequest, NextResponse } from "next/server";

import { hasSupabaseCredentials } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");
  const next = requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/profile";

  if (!hasSupabaseCredentials() || !code) {
    return NextResponse.redirect(new URL("/auth?error=No se pudo confirmar la sesion.", request.url));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/auth?error=No se pudo inicializar Supabase.", request.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/auth?error=No se pudo completar la autenticacion.", request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}