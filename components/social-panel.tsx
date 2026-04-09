"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { formatMessageTime, getFriendCountLabel, getFriendRequestCountLabel, type FriendRequestSummary, type FriendSummary, type SocialMessage, type SocialProfile } from "@/lib/social";

type SocialPanelProps = {
  currentUserId: string;
  initialRequests: FriendRequestSummary[];
  initialFriends: FriendSummary[];
  onClose: () => void;
  onFriendCountChange: (count: number) => void;
};

function ProfileAvatar({ profile, size = 42 }: { profile: Pick<SocialProfile, "avatarUrl" | "displayName">; size?: number }) {
  if (profile.avatarUrl) {
    return <Image src={profile.avatarUrl} alt={profile.displayName} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }

  return (
    <div className="flex items-center justify-center rounded-full bg-[#e8ccb4] font-semibold text-brand-navy" style={{ width: size, height: size }}>
      {profile.displayName.charAt(0).toUpperCase()}
    </div>
  );
}

export function SocialPanel({ currentUserId, initialFriends, initialRequests, onClose, onFriendCountChange }: SocialPanelProps) {
  const [friends, setFriends] = useState(initialFriends);
  const [activeFriendId, setActiveFriendId] = useState(initialFriends[0]?.userId ?? null);
  const [requests, setRequests] = useState(initialRequests);
  const [messages, setMessages] = useState<SocialMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SocialProfile[]>([]);
  const [busySearch, setBusySearch] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(Boolean(initialFriends[0]?.userId));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encryptionConfigured, setEncryptionConfigured] = useState(true);

  const activeFriend = friends.find((friend) => friend.userId === activeFriendId) ?? null;
  const incomingRequests = requests.filter((request) => request.direction === "incoming");
  const outgoingRequests = requests.filter((request) => request.direction === "outgoing");
  const visibleMessages = activeFriendId ? messages : [];

  useEffect(() => {
    onFriendCountChange(friends.length);
  }, [friends.length, onFriendCountChange]);

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      return;
    }

    const controller = new AbortController();

    fetch(`/api/social/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as { error?: string; results?: SocialProfile[] };

        if (!response.ok) {
          throw new Error(payload.error ?? "No se pudo buscar gente ahora mismo.");
        }

        setSearchResults(payload.results ?? []);
      })
      .catch((caughtError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : "No se pudo buscar gente ahora mismo.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setBusySearch(false);
        }
      });

    return () => controller.abort();
  }, [searchQuery]);

  useEffect(() => {
    if (!activeFriendId) {
      return;
    }

    const controller = new AbortController();

    fetch(`/api/social/messages/${activeFriendId}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as { encryptionConfigured?: boolean; error?: string; messages?: SocialMessage[] };

        if (!response.ok && payload.error) {
          throw new Error(payload.error);
        }

        setEncryptionConfigured(payload.encryptionConfigured ?? true);
        setMessages(payload.messages ?? []);
      })
      .catch((caughtError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setEncryptionConfigured(false);
        setMessages([]);
        setError(caughtError instanceof Error ? caughtError.message : "No se pudo cargar el chat.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingMessages(false);
        }
      });

    return () => controller.abort();
  }, [activeFriendId]);

  async function handleAddFriend(profile: SocialProfile) {
    setError(null);

    const response = await fetch("/api/social/requests", {
      body: JSON.stringify({ friendUserId: profile.userId }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const payload = (await response.json()) as { error?: string; request?: FriendRequestSummary };

    if (!response.ok || !payload.request) {
      setError(payload.error ?? "No se pudo enviar la solicitud.");
      return;
    }

    setRequests((current) => [...current, payload.request!]);
    setError(null);
    setSearchQuery("");
    setSearchResults([]);
  }

  async function handleAcceptRequest(request: FriendRequestSummary) {
    setError(null);

    const response = await fetch(`/api/social/requests/${request.requestId}`, {
      method: "POST",
    });

    const payload = (await response.json()) as { error?: string; friend?: FriendSummary };

    if (!response.ok || !payload.friend) {
      setError(payload.error ?? "No se pudo aceptar la solicitud.");
      return;
    }

    setRequests((current) => current.filter((item) => item.requestId !== request.requestId));
    setFriends((current) => [...current, payload.friend!]);
    setLoadingMessages(true);
    setActiveFriendId(payload.friend.userId);
  }

  async function handleDeclineRequest(requestId: string) {
    setError(null);

    const response = await fetch(`/api/social/requests/${requestId}`, {
      method: "DELETE",
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "No se pudo rechazar o cancelar la solicitud.");
      return;
    }

    setRequests((current) => current.filter((item) => item.requestId !== requestId));
  }

  async function handleRemoveFriend(friendUserId: string) {
    setError(null);

    const response = await fetch(`/api/social/friends/${friendUserId}`, {
      method: "DELETE",
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "No se pudo eliminar el amigo.");
      return;
    }

    const nextFriends = friends.filter((friend) => friend.userId !== friendUserId);

    setFriends(nextFriends);

    if (activeFriendId === friendUserId) {
      setError(null);
      setLoadingMessages(Boolean(nextFriends[0]?.userId));
      setActiveFriendId(nextFriends[0]?.userId ?? null);
      setMessages([]);
    }
  }

  async function handleSendMessage() {
    if (!activeFriendId || !messageDraft.trim()) {
      return;
    }

    setSending(true);
    setError(null);

    const response = await fetch(`/api/social/messages/${activeFriendId}`, {
      body: JSON.stringify({ content: messageDraft }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const payload = (await response.json()) as { error?: string; message?: SocialMessage };

    if (!response.ok || !payload.message) {
      setError(payload.error ?? "No se pudo enviar el mensaje.");
      setSending(false);
      return;
    }

    setMessageDraft("");
    setEncryptionConfigured(true);
    setMessages((current) => [...current, payload.message!]);
    setSending(false);
  }

  return (
    <section className="overflow-hidden rounded-[1.8rem] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/8">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#d78a50] px-4 py-4 text-white sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <Image src="/icons/social-blue.svg" alt="Amigos" width={30} height={30} className="h-9 w-9 rounded-full bg-white p-1.5" />
          <div>
            <h2 className="font-display text-[1.65rem] font-semibold tracking-[-0.05em] sm:text-[2.3rem]">Amigos</h2>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/80">{getFriendCountLabel(friends.length)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <p className="hidden text-[1.7rem] font-semibold tracking-[-0.04em] sm:block">{activeFriend?.displayName ?? "Selecciona un amigo"}</p>
          <button type="button" onClick={onClose} aria-label="Cerrar panel social" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#7f3107] text-[#7f3107] transition hover:bg-white/25">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid border-t border-black/15 lg:grid-cols-[minmax(15rem,16.5rem)_minmax(0,1fr)]">
        <aside className="border-b border-black/15 bg-[#f8f4ef] p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <label className="sr-only" htmlFor="friend-search">Buscar amigos</label>
          <input
            id="friend-search"
            value={searchQuery}
            onChange={(event) => {
              const nextQuery = event.target.value;

              setSearchQuery(nextQuery);

              if (nextQuery.trim().length >= 2) {
                setBusySearch(true);
              } else {
                setBusySearch(false);
                setSearchResults([]);
              }
            }}
            placeholder="Enviar solicitud por nombre o usuario"
            className="w-full rounded-[1rem] border border-black/12 bg-white px-4 py-3 text-sm text-brand-ink outline-none transition focus:border-brand-navy/35"
          />

          {searchQuery.trim().length >= 2 ? (
            <div className="mt-4 space-y-2 rounded-[1rem] border border-black/10 bg-white p-3">
              {busySearch ? <p className="text-sm text-black/55">Buscando...</p> : null}
              {!busySearch && !searchResults.length ? <p className="text-sm text-black/55">No hemos encontrado perfiles nuevos.</p> : null}
              {searchResults.map((profile) => (
                <div key={profile.userId} className="flex flex-wrap items-center justify-between gap-3 rounded-[0.9rem] px-2 py-2 hover:bg-[#f7efe8]">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <ProfileAvatar profile={profile} size={36} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-burnt">{profile.displayName}</p>
                      <p className="truncate text-xs text-black/55">@{profile.username}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => void handleAddFriend(profile)} className="shrink-0 rounded-full bg-brand-navy px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-brand-blue">
                    Solicitar
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {incomingRequests.length ? (
            <div className="mt-5 rounded-[1rem] border border-[#d78a50]/20 bg-white p-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-black/55">Entrantes · {getFriendRequestCountLabel(incomingRequests.length)}</p>
              <div className="mt-3 space-y-3">
                {incomingRequests.map((request) => (
                  <div key={request.requestId} className="rounded-[0.9rem] bg-[#f8f4ef] px-3 py-3">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar profile={request} size={36} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-brand-burnt">{request.displayName}</p>
                        <p className="truncate text-xs text-black/55">@{request.username}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => void handleAcceptRequest(request)} className="rounded-full bg-brand-navy px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-brand-blue">
                        Aceptar
                      </button>
                      <button type="button" onClick={() => void handleDeclineRequest(request.requestId)} className="rounded-full border border-black/12 bg-white px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-black/65 transition hover:bg-black/5">
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {outgoingRequests.length ? (
            <div className="mt-5 rounded-[1rem] border border-black/10 bg-white p-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-black/55">Enviadas · {getFriendRequestCountLabel(outgoingRequests.length)}</p>
              <div className="mt-3 space-y-3">
                {outgoingRequests.map((request) => (
                  <div key={request.requestId} className="flex flex-wrap items-center justify-between gap-3 rounded-[0.9rem] bg-[#f8f4ef] px-3 py-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <ProfileAvatar profile={request} size={36} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-brand-burnt">{request.displayName}</p>
                        <p className="truncate text-xs text-black/55">Pendiente</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => void handleDeclineRequest(request.requestId)} className="shrink-0 rounded-full border border-black/12 bg-white px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-black/65 transition hover:bg-black/5">
                      Cancelar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 space-y-2">
            {friends.length ? (
              friends.map((friend) => (
                <button
                  key={friend.userId}
                  type="button"
                  onClick={() => {
                    setError(null);
                    setLoadingMessages(true);
                    setActiveFriendId(friend.userId);
                  }}
                  className={`flex w-full items-center gap-3 rounded-[1rem] px-3 py-3 text-left transition ${friend.userId === activeFriendId ? "bg-white shadow-[0_8px_18px_rgba(0,0,0,0.08)]" : "hover:bg-white/70"}`}
                >
                  <ProfileAvatar profile={friend} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-burnt">{friend.displayName}</p>
                    <p className="truncate text-xs text-black/55">@{friend.username}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="rounded-[1rem] bg-white px-4 py-4 text-sm leading-6 text-black/60">Todavía no tienes amigos. Busca perfiles arriba para empezar a chatear.</p>
            )}
          </div>
        </aside>

        <div className="flex min-h-[26rem] flex-col bg-white lg:min-h-[44rem]">
          {activeFriend ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 px-4 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <ProfileAvatar profile={activeFriend} size={48} />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-brand-burnt">{activeFriend.displayName}</p>
                    <p className="truncate text-sm text-black/55">@{activeFriend.username}</p>
                  </div>
                </div>

                <button type="button" onClick={() => void handleRemoveFriend(activeFriend.userId)} className="shrink-0 rounded-full border border-[#cf4e14]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#cf4e14] transition hover:bg-[#fff1ea]">
                  Eliminar amigo
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                {loadingMessages ? <p className="text-sm text-black/55">Cargando conversación...</p> : null}
                {!loadingMessages && !visibleMessages.length && encryptionConfigured ? <p className="text-sm leading-7 text-black/55">Todavía no habéis hablado. Envía el primer mensaje cuando quieras.</p> : null}
                {!encryptionConfigured ? <p className="text-sm leading-7 text-red-700">Configura `MESSAGE_ENCRYPTION_KEY` en el servidor para guardar y leer mensajes cifrados.</p> : null}

                {visibleMessages.map((message) => {
                  const ownMessage = message.senderUserId === currentUserId;

                  return (
                    <div key={message.id} className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[88%] rounded-[1.4rem] px-4 py-4 sm:max-w-[70%] sm:px-6 sm:py-5 ${ownMessage ? "bg-[#d69b71] text-[#4c2208]" : "bg-[#f7efe8] text-brand-ink"}`}>
                        <p className="text-[1.05rem] font-semibold leading-8">{message.content}</p>
                        <p className="mt-2 text-right text-sm text-black/65">{formatMessageTime(message.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-black/10 px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <input
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    placeholder="Escribe tu mensaje"
                    className="w-full rounded-[1rem] border border-black/20 bg-white px-5 py-4 text-[1.05rem] text-brand-ink outline-none transition focus:border-brand-navy/35"
                    disabled={!encryptionConfigured || sending}
                  />
                  <button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    disabled={!messageDraft.trim() || !encryptionConfigured || sending}
                    className="inline-flex h-12 w-12 shrink-0 self-end items-center justify-center rounded-full text-brand-navy transition hover:bg-brand-navy/5 disabled:opacity-40 sm:self-auto"
                    aria-label="Enviar mensaje"
                  >
                    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 20 21 12 3 4l4 8-4 8Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-8 py-12 text-center">
              <div>
                <h3 className="font-display text-[2rem] font-semibold tracking-[-0.05em] text-brand-burnt">Tu espacio social está listo</h3>
                <p className="mt-3 max-w-[28rem] text-[1.05rem] leading-8 text-black/70">Busca perfiles por nombre o usuario, envía solicitudes y acepta las que te lleguen para abrir una conversación desde este panel.</p>
              </div>
            </div>
          )}

          {error ? <p className="border-t border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
