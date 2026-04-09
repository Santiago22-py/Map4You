import { NextRequest, NextResponse } from "next/server";

import { getRequestSiteUrl, hasSupabaseCredentials } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const siteUrl = getRequestSiteUrl(request);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");
  const next = requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/profile";

  if (!hasSupabaseCredentials() || !code) {
    return NextResponse.redirect(new URL("/auth?error=No se pudo confirmar la sesion.", siteUrl));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/auth?error=No se pudo inicializar Supabase.", siteUrl));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/auth?error=No se pudo completar la autenticacion.", siteUrl));
  }

  return NextResponse.redirect(new URL(next, siteUrl));
}