import { decryptMessageContent, encryptMessageContent, isMessageEncryptionConfigured } from "@/lib/message-crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getProfileImagePublicUrl } from "@/lib/user-profiles";
import { type FriendRequestSummary, type FriendSummary, getFriendshipPair, type SocialMessage, type SocialProfile } from "@/lib/social";

type FriendshipRow = {
  created_at: string;
  user_a_id: string;
  user_b_id: string;
};

type MessageRow = {
  content_ciphertext: string;
  content_iv: string;
  content_tag: string;
  created_at: string;
  id: string;
  recipient_user_id: string;
  sender_user_id: string;
};

type FriendRequestRow = {
  created_at: string;
  id: string;
  recipient_user_id: string;
  sender_user_id: string;
};

type ProfileRow = {
  avatar_path: string | null;
  display_name: string;
  user_id: string;
  username: string;
};

function mapSocialProfile(row: ProfileRow, supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>): SocialProfile {
  return {
    avatarUrl: row.avatar_path ? getProfileImagePublicUrl(supabase, row.avatar_path) : null,
    displayName: row.display_name,
    userId: row.user_id,
    username: row.username,
  };
}

function mapMessage(row: MessageRow): SocialMessage {
  return {
    content: decryptMessageContent(row.content_ciphertext, row.content_iv, row.content_tag),
    createdAt: row.created_at,
    id: row.id,
    recipientUserId: row.recipient_user_id,
    senderUserId: row.sender_user_id,
  };
}

async function getProfilesByUserIds(userIds: string[]) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !userIds.length) {
    return new Map<string, SocialProfile>();
  }

  const { data, error } = await supabase.from("profiles").select("user_id, username, display_name, avatar_path").in("user_id", userIds);

  if (error || !data) {
    return new Map<string, SocialProfile>();
  }

  return new Map(data.map((row) => [row.user_id, mapSocialProfile(row as ProfileRow, supabase)]));
}

async function getFriendRequestRows(userId: string): Promise<FriendRequestRow[]> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_friend_requests")
    .select("id, sender_user_id, recipient_user_id, created_at")
    .or(`sender_user_id.eq.${userId},recipient_user_id.eq.${userId}`)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as FriendRequestRow[];
}

export async function getUserFriends(userId: string): Promise<FriendSummary[]> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_friendships")
    .select("user_a_id, user_b_id, created_at")
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  const friendshipRows = data as FriendshipRow[];
  const friendIds = friendshipRows.map((row) => (row.user_a_id === userId ? row.user_b_id : row.user_a_id));
  const profilesById = await getProfilesByUserIds(friendIds);

  return friendshipRows
    .map((row) => {
      const friendId = row.user_a_id === userId ? row.user_b_id : row.user_a_id;
      const profile = profilesById.get(friendId);

      if (!profile) {
        return null;
      }

      return {
        ...profile,
        friendsSince: row.created_at,
      } satisfies FriendSummary;
    })
    .filter((item): item is FriendSummary => Boolean(item));
}

export async function getPublicFriendCountByUserId(userId: string): Promise<number> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return 0;
  }

  const { count, error } = await supabase
    .from("user_friendships")
    .select("user_a_id", { count: "exact", head: true })
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function getUserFriendRequests(userId: string): Promise<FriendRequestSummary[]> {
  const requestRows = await getFriendRequestRows(userId);
  const otherUserIds = requestRows.map((row) => (row.sender_user_id === userId ? row.recipient_user_id : row.sender_user_id));
  const profilesById = await getProfilesByUserIds(otherUserIds);

  return requestRows
    .map((row) => {
      const otherUserId = row.sender_user_id === userId ? row.recipient_user_id : row.sender_user_id;
      const profile = profilesById.get(otherUserId);

      if (!profile) {
        return null;
      }

      return {
        ...profile,
        createdAt: row.created_at,
        direction: row.sender_user_id === userId ? "outgoing" : "incoming",
        requestId: row.id,
      } satisfies FriendRequestSummary;
    })
    .filter((item): item is FriendRequestSummary => Boolean(item));
}

export async function searchProfilesToFriend(userId: string, query: string): Promise<SocialProfile[]> {
  const supabase = createSupabaseAdminClient();
  const normalizedQuery = query.trim();

  if (!supabase || normalizedQuery.length < 2) {
    return [];
  }

  const friends = await getUserFriends(userId);
  const requests = await getUserFriendRequests(userId);
  const blockedIds = new Set([userId, ...friends.map((friend) => friend.userId), ...requests.map((request) => request.userId)]);
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, avatar_path")
    .or(`username.ilike.%${normalizedQuery}%,display_name.ilike.%${normalizedQuery}%`)
    .limit(12);

  if (error || !data) {
    return [];
  }

  return (data as ProfileRow[])
    .filter((profile) => !blockedIds.has(profile.user_id))
    .map((profile) => mapSocialProfile(profile, supabase));
}

async function getProfileByUserId(userId: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.from("profiles").select("user_id, username, display_name, avatar_path").eq("user_id", userId).maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapSocialProfile(data as ProfileRow, supabase);
}

export async function createFriendRequest(userId: string, friendUserId: string): Promise<FriendRequestSummary> {
  if (userId === friendUserId) {
    throw new Error("No puedes añadirte como amigo.");
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Falta la configuración privada de Supabase.");
  }

  const friendProfile = await getProfileByUserId(friendUserId);

  if (!friendProfile) {
    throw new Error("No encontramos ese perfil.");
  }

  const currentFriends = await getUserFriends(userId);

  if (currentFriends.some((friend) => friend.userId === friendUserId)) {
    throw new Error("Ese perfil ya está en tu lista de amigos.");
  }

  const currentRequests = await getUserFriendRequests(userId);
  const existingRequest = currentRequests.find((request) => request.userId === friendUserId);

  if (existingRequest) {
    if (existingRequest.direction === "incoming") {
      throw new Error("Ya tienes una solicitud pendiente de ese perfil. Acéptala o recházala.");
    }

    throw new Error("Ya has enviado una solicitud a ese perfil.");
  }

  const { data, error } = await supabase
    .from("user_friend_requests")
    .insert({
      recipient_user_id: friendUserId,
      sender_user_id: userId,
    })
    .select("id, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya existe una solicitud pendiente entre ambos perfiles.");
    }

    throw new Error("No se pudo enviar la solicitud.");
  }

  return {
    ...friendProfile,
    createdAt: String(data?.created_at ?? new Date().toISOString()),
    direction: "outgoing",
    requestId: String(data?.id ?? ""),
  };
}

export async function removeFriend(userId: string, friendUserId: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Falta la configuración privada de Supabase.");
  }

  const [userAId, userBId] = getFriendshipPair(userId, friendUserId);
  const { error } = await supabase.from("user_friendships").delete().match({ user_a_id: userAId, user_b_id: userBId });

  if (error) {
    throw new Error("No se pudo eliminar el amigo.");
  }
}

export async function deleteFriendRequest(userId: string, requestId: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Falta la configuración privada de Supabase.");
  }

  const { error } = await supabase
    .from("user_friend_requests")
    .delete()
    .eq("id", requestId)
    .or(`sender_user_id.eq.${userId},recipient_user_id.eq.${userId}`);

  if (error) {
    throw new Error("No se pudo rechazar o cancelar la solicitud.");
  }
}

export async function acceptFriendRequest(userId: string, requestId: string): Promise<FriendSummary> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Falta la configuración privada de Supabase.");
  }

  const { data: request, error: requestError } = await supabase
    .from("user_friend_requests")
    .select("id, sender_user_id, recipient_user_id")
    .eq("id", requestId)
    .eq("recipient_user_id", userId)
    .maybeSingle();

  if (requestError || !request) {
    throw new Error("No encontramos esa solicitud pendiente.");
  }

  const friendProfile = await getProfileByUserId(String(request.sender_user_id));

  if (!friendProfile) {
    throw new Error("No encontramos ese perfil.");
  }

  const [userAId, userBId] = getFriendshipPair(String(request.sender_user_id), String(request.recipient_user_id));
  const { error: insertError } = await supabase.from("user_friendships").insert({ user_a_id: userAId, user_b_id: userBId });

  if (insertError && insertError.code !== "23505") {
    throw new Error("No se pudo aceptar la solicitud.");
  }

  const { error: deleteError } = await supabase.from("user_friend_requests").delete().eq("id", requestId);

  if (deleteError) {
    throw new Error("La amistad se creó, pero no se pudo cerrar la solicitud pendiente.");
  }

  return {
    ...friendProfile,
    friendsSince: new Date().toISOString(),
  };
}

export async function getConversation(userId: string, friendUserId: string): Promise<SocialMessage[]> {
  if (!isMessageEncryptionConfigured()) {
    throw new Error("Configura MESSAGE_ENCRYPTION_KEY para activar la mensajería cifrada.");
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const [userAId, userBId] = getFriendshipPair(userId, friendUserId);
  const { data: friendship } = await supabase.from("user_friendships").select("user_a_id").match({ user_a_id: userAId, user_b_id: userBId }).maybeSingle();

  if (!friendship) {
    throw new Error("Solo puedes chatear con usuarios que ya son tus amigos.");
  }

  const { data, error } = await supabase
    .from("user_messages")
    .select("id, sender_user_id, recipient_user_id, content_ciphertext, content_iv, content_tag, created_at")
    .or(`and(sender_user_id.eq.${userId},recipient_user_id.eq.${friendUserId}),and(sender_user_id.eq.${friendUserId},recipient_user_id.eq.${userId})`)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error || !data) {
    return [];
  }

  return (data as MessageRow[]).map(mapMessage);
}

export async function sendMessageToFriend(userId: string, friendUserId: string, content: string): Promise<SocialMessage> {
  const message = content.trim();

  if (!message) {
    throw new Error("Escribe un mensaje antes de enviarlo.");
  }

  if (!isMessageEncryptionConfigured()) {
    throw new Error("Configura MESSAGE_ENCRYPTION_KEY para activar la mensajería cifrada.");
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Falta la configuración privada de Supabase.");
  }

  const [userAId, userBId] = getFriendshipPair(userId, friendUserId);
  const { data: friendship } = await supabase.from("user_friendships").select("user_a_id").match({ user_a_id: userAId, user_b_id: userBId }).maybeSingle();

  if (!friendship) {
    throw new Error("Solo puedes enviar mensajes a usuarios que ya son tus amigos.");
  }

  const encrypted = encryptMessageContent(message);
  const { data, error } = await supabase
    .from("user_messages")
    .insert({
      content_ciphertext: encrypted.ciphertext,
      content_iv: encrypted.iv,
      content_tag: encrypted.tag,
      recipient_user_id: friendUserId,
      sender_user_id: userId,
    })
    .select("id, sender_user_id, recipient_user_id, content_ciphertext, content_iv, content_tag, created_at")
    .single();

  if (error || !data) {
    throw new Error("No se pudo enviar el mensaje.");
  }

  return mapMessage(data as MessageRow);
}
