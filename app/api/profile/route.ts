import { NextResponse } from "next/server";

import { createSupabaseAdminClient, getCurrentUser } from "@/lib/supabase/server";
import {
  getDisplayNameValidationError,
  getProfileImagePublicUrl,
  getUsernameValidationError,
  normalizeDisplayName,
  sanitizeUsername,
  type UserProfile,
} from "@/lib/user-profiles";
import { ensureUserProfile } from "@/lib/user-profiles-server";

type ProfileRow = {
  avatar_path: string | null;
  bio: string | null;
  display_name: string;
  user_id: string;
  username: string;
};

function mapProfile(row: ProfileRow, supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>): UserProfile {
  return {
    avatarPath: row.avatar_path,
    avatarUrl: row.avatar_path ? getProfileImagePublicUrl(supabase, row.avatar_path) : null,
    bio: row.bio,
    displayName: row.display_name,
    userId: row.user_id,
    username: row.username,
  };
}

function getFriendlyProfileErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "No se pudo actualizar el perfil.";
  }

  if (error.message.includes("duplicate key") || error.message.includes("unique")) {
    return "Ese @usuario ya está en uso.";
  }

  return error.message || "No se pudo actualizar el perfil.";
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Necesitas iniciar sesión." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Falta la configuración privada de Supabase." }, { status: 500 });
  }

  await ensureUserProfile(user);

  const payload = (await request.json().catch(() => null)) as { displayName?: string; username?: string } | null;
  const displayName = normalizeDisplayName(payload?.displayName ?? "");
  const username = sanitizeUsername(payload?.username ?? "");
  const displayNameError = getDisplayNameValidationError(displayName);
  const usernameError = getUsernameValidationError(payload?.username ?? "");

  if (displayNameError || usernameError) {
    return NextResponse.json({ error: displayNameError ?? usernameError }, { status: 400 });
  }

  const { data: existingUsername, error: usernameLookupError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username", username)
    .maybeSingle();

  if (usernameLookupError) {
    return NextResponse.json({ error: "No se pudo comprobar la disponibilidad del usuario." }, { status: 500 });
  }

  if (existingUsername && existingUsername.user_id !== user.id) {
    return NextResponse.json({ error: "Ese @usuario ya está en uso." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      username,
    })
    .eq("user_id", user.id)
    .select("user_id, username, display_name, bio, avatar_path")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: getFriendlyProfileErrorMessage(error) }, { status: error?.message.includes("duplicate key") ? 409 : 500 });
  }

  return NextResponse.json({ profile: mapProfile(data as ProfileRow, supabase) });
}