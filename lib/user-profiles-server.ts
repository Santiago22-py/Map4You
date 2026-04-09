import type { User } from "@supabase/supabase-js";

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileImagePublicUrl, type UserProfile } from "@/lib/user-profiles";

type ProfileRow = {
  avatar_path: string | null;
  bio: string | null;
  display_name: string;
  user_id: string;
  username: string;
};

function sanitizeUsername(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
}

function buildDefaultProfile(user: User): UserProfile {
  const fallbackName = String(user.user_metadata.full_name ?? user.email?.split("@")[0] ?? "Viajero").trim();
  const fallbackUsername = sanitizeUsername(user.email?.split("@")[0] ?? fallbackName) || `viajero_${user.id.slice(0, 8)}`;

  return {
    avatarPath: null,
    avatarUrl: null,
    bio: null,
    displayName: fallbackName,
    userId: user.id,
    username: fallbackUsername,
  };
}

function mapProfile(row: ProfileRow, supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>): UserProfile {
  return {
    avatarPath: row.avatar_path,
    avatarUrl: row.avatar_path ? getProfileImagePublicUrl(supabase, row.avatar_path) : null,
    bio: row.bio,
    displayName: row.display_name,
    userId: row.user_id,
    username: row.username,
  };
}

async function getAvailableUsername(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  baseUsername: string,
  userId: string,
) {
  const normalizedBase = sanitizeUsername(baseUsername) || `viajero_${userId.slice(0, 8)}`;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? normalizedBase : `${normalizedBase.slice(0, Math.max(1, 32 - String(attempt).length - 1))}_${attempt}`;
    const { data } = await supabase.from("profiles").select("username").eq("username", candidate).maybeSingle();

    if (!data) {
      return candidate;
    }
  }

  return `viajero_${userId.slice(0, 8)}`;
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return buildDefaultProfile(user);
  }

  const defaults = buildDefaultProfile(user);
  const { data: existing } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, bio, avatar_path")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return mapProfile(existing as ProfileRow, supabase);
  }

  const username = await getAvailableUsername(supabase, defaults.username, user.id);

  const { data: created } = await supabase
    .from("profiles")
    .insert({
      user_id: defaults.userId,
      username,
      display_name: defaults.displayName,
    })
    .select("user_id, username, display_name, bio, avatar_path")
    .maybeSingle();

  return created ? mapProfile(created as ProfileRow, supabase) : defaults;
}

export async function getProfileByUsername(username: string): Promise<UserProfile | null> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, bio, avatar_path")
    .eq("username", sanitizeUsername(username))
    .maybeSingle();

  return data ? mapProfile(data as ProfileRow, supabase) : null;
}
