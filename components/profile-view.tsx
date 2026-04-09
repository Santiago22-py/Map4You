"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useId, useMemo, useRef, useState, type ChangeEvent } from "react";

import { SignOutButton } from "@/components/sign-out-button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getTravelAlbumPublicUrl, getTravelAlbumStoragePath, travelAlbumBucket, type TravelAlbum, type TravelAlbumPhoto } from "@/lib/travel-albums";
import { getProfileImagePublicUrl, getProfileImageStoragePath, profileImageBucket, type UserProfile } from "@/lib/user-profiles";

const placeholderPhotos = [
  "/images/profile/paris-placeholder.jpg",
  "/images/profile/madrid-placeholder.jpg",
  "/images/profile/rio-placeholder.jpg",
];

type ProfileViewProps = {
  albumBasePath: string;
  initialAlbums: TravelAlbum[];
  profile: UserProfile;
  readOnly?: boolean;
};

type PreviewFile = {
  file: File;
  id: string;
  previewUrl: string;
};

type FeaturedPhoto = {
  albumId: string;
  albumTitle: string;
  id: string;
  url: string;
};

function getStableWeight(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getFeaturedPhotos(albums: TravelAlbum[]) {
  const featuredPhotos: FeaturedPhoto[] = [];
  const orderedAlbums = [...albums]
    .filter((album) => album.photos.length)
    .sort((left, right) => getStableWeight(left.id) - getStableWeight(right.id));
  const remainingPhotosByAlbum = new Map<string, FeaturedPhoto[]>();

  for (const album of orderedAlbums) {
    const orderedPhotos = [...album.photos]
      .sort((left, right) => getStableWeight(left.id) - getStableWeight(right.id))
      .map((photo) => ({
      albumId: album.id,
      albumTitle: album.title,
      id: photo.id,
      url: photo.url,
    }));

    if (!orderedPhotos.length) {
      continue;
    }

    featuredPhotos.push(orderedPhotos[0]);
    remainingPhotosByAlbum.set(album.id, orderedPhotos.slice(1));

    if (featuredPhotos.length === 8) {
      return featuredPhotos;
    }
  }

  for (const album of orderedAlbums) {
    const remainingPhotos = remainingPhotosByAlbum.get(album.id) ?? [];

    for (const photo of remainingPhotos) {
      featuredPhotos.push(photo);

      if (featuredPhotos.length === 8) {
        return featuredPhotos;
      }
    }
  }

  return featuredPhotos;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "No se pudo crear el álbum. Intenta otra vez.";
}

async function removeUploadedFiles(paths: string[]) {
  const supabase = createSupabaseBrowserClient();

  if (!supabase || !paths.length) {
    return;
  }

  await supabase.storage.from(travelAlbumBucket).remove(paths);
}

function CreateAlbumModal({
  busy,
  error,
  files,
  onClose,
  onCreate,
  onFilesSelected,
}: {
  busy: boolean;
  error: string | null;
  files: PreviewFile[];
  onClose: () => void;
  onCreate: (title: string) => Promise<void>;
  onFilesSelected: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const [title, setTitle] = useState("");
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, onClose]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate(title);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#d8a989]/50 px-4 py-8 backdrop-blur-[6px]" onClick={busy ? undefined : onClose}>
      <section className="relative w-full max-w-[79rem] rounded-[1.9rem] bg-white px-7 py-10 shadow-[0_18px_42px_rgba(0,0,0,0.16)] ring-1 ring-black/8 sm:px-12 sm:py-12" aria-modal="true" role="dialog" onClick={(event) => event.stopPropagation()}>
        <button type="button" aria-label="Cerrar" onClick={onClose} disabled={busy} className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12" />
            <path d="M18 6 6 18" />
          </svg>
        </button>

        <form className="flex min-h-[36rem] flex-col" onSubmit={handleSubmit}>
          <h2 className="font-display text-[2rem] font-semibold tracking-[-0.05em] text-brand-burnt sm:text-[2.6rem]">Crear álbum</h2>

          <div className="mt-6 max-w-[25rem]">
            <label htmlFor={fileInputId} className="sr-only">
              Nombre del álbum
            </label>

            <input
              id={fileInputId}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Escribe el nombre del álbum"
              className="w-full rounded-[1.2rem] border border-black px-5 py-3 text-[1.25rem] font-semibold text-brand-ink outline-none transition placeholder:text-black/30 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/12"
              maxLength={80}
            />
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />

          <div className="mt-8 flex flex-wrap items-start gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Agregar fotos al nuevo álbum"
              className="flex aspect-square w-[11rem] items-center justify-center rounded-[1.2rem] border border-black bg-[#fbf7f3] text-brand-navy transition hover:-translate-y-0.5 hover:bg-[#f5ece3]"
            >
              <Image src="/icons/add.svg" alt="" width={56} height={56} className="h-14 w-14" />
            </button>

            {files.map((file) => (
              <div key={file.id} className="overflow-hidden rounded-[1.2rem] bg-[#f7efe8] shadow-[0_10px_18px_rgba(10,48,120,0.16)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={file.previewUrl} alt={file.file.name} className="aspect-square w-[11rem] object-cover" />
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.05em] text-black/55">Puedes subir varias fotos a la vez. La primera será la portada del álbum.</p>

          {error ? <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <div className="mt-auto flex justify-end pt-10">
            <button
              type="submit"
              disabled={busy}
              className="rounded-[0.9rem] bg-[linear-gradient(180deg,#3266d0,#244a9a)] px-10 py-4 text-xl font-semibold text-white shadow-[0_16px_30px_rgba(36,74,154,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function getAlbumHref(basePath: string, albumId: string) {
  return `${basePath}/${albumId}`;
}

export function ProfileView({ albumBasePath, initialAlbums, profile, readOnly = false }: ProfileViewProps) {
  const router = useRouter();
  const [albums, setAlbums] = useState(initialAlbums);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [bioDraft, setBioDraft] = useState(profile.bio ?? "");
  const [savingBio, setSavingBio] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const featuredPhotos = useMemo(() => getFeaturedPhotos(albums), [albums]);
  const visibleAlbums = readOnly ? albums.slice(0, 6) : albums.slice(0, 5);

  useEffect(() => {
    return () => {
      for (const file of files) {
        URL.revokeObjectURL(file.previewUrl);
      }
    };
  }, [files]);

  function closeCreateModal() {
    if (creating) {
      return;
    }

    for (const file of files) {
      URL.revokeObjectURL(file.previewUrl);
    }

    setFiles([]);
    setFormError(null);
    setCreateOpen(false);
  }

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));

    if (!selectedFiles.length) {
      return;
    }

    setFiles((current) => {
      const nextFiles = [
        ...current,
        ...selectedFiles.map((file) => ({ file, id: `${file.name}-${file.size}-${crypto.randomUUID()}`, previewUrl: URL.createObjectURL(file) })),
      ].slice(0, 12);

      if (nextFiles.length > current.length + selectedFiles.length) {
        const removedFiles = nextFiles.slice(current.length + selectedFiles.length);

        for (const file of removedFiles) {
          URL.revokeObjectURL(file.previewUrl);
        }
      }

      return nextFiles;
    });

    event.target.value = "";
  }

  async function handleCreateAlbum(title: string) {
    const supabase = createSupabaseBrowserClient();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setFormError("Escribe un nombre para el álbum.");
      return;
    }

    if (!files.length) {
      setFormError("Agrega por lo menos una foto para crear el álbum.");
      return;
    }

    if (!supabase) {
      setFormError("Faltan las credenciales públicas de Supabase.");
      return;
    }

    setCreating(true);
    setFormError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setCreating(false);
      setFormError("Tu sesión expiró. Inicia sesión otra vez.");
      return;
    }

    const albumId = crypto.randomUUID();
    const uploadedPaths: string[] = [];

    try {
      const { error: albumInsertError } = await supabase.from("travel_albums").insert({
        id: albumId,
        title: trimmedTitle,
        user_id: user.id,
      });

      if (albumInsertError) {
        throw albumInsertError;
      }

      const uploadedPhotos: TravelAlbumPhoto[] = [];

      for (const [index, previewFile] of files.entries()) {
        const storagePath = getTravelAlbumStoragePath(user.id, albumId, index, previewFile.file.name);
        const { error: uploadError } = await supabase.storage.from(travelAlbumBucket).upload(storagePath, previewFile.file, {
          contentType: previewFile.file.type || undefined,
          upsert: false,
        });

        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(storagePath);
        uploadedPhotos.push({
          id: `${albumId}-${index}`,
          path: storagePath,
          sortOrder: index,
          url: getTravelAlbumPublicUrl(supabase, storagePath),
        });
      }

      const { error: photosInsertError } = await supabase.from("travel_album_photos").insert(
        uploadedPhotos.map((photo) => ({
          album_id: albumId,
          sort_order: photo.sortOrder,
          storage_path: photo.path,
        })),
      );

      if (photosInsertError) {
        throw photosInsertError;
      }

      const { error: coverUpdateError } = await supabase
        .from("travel_albums")
        .update({ cover_path: uploadedPaths[0] ?? null })
        .eq("id", albumId)
        .eq("user_id", user.id);

      if (coverUpdateError) {
        throw coverUpdateError;
      }

      const createdAlbum: TravelAlbum = {
        coverPath: uploadedPaths[0] ?? null,
        coverUrl: uploadedPhotos[0]?.url ?? null,
        createdAt: new Date().toISOString(),
        id: albumId,
        photoCount: uploadedPhotos.length,
        photos: uploadedPhotos,
        title: trimmedTitle,
      };

      setAlbums((current) => [createdAlbum, ...current]);
      closeCreateModal();

      startTransition(() => {
        router.push(`/profile/albums/${albumId}`);
        router.refresh();
      });
    } catch (error) {
      await supabase.from("travel_albums").delete().eq("id", albumId).eq("user_id", user.id);
      await removeUploadedFiles(uploadedPaths);
      setFormError(getErrorMessage(error));
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveBio() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setFormError("Faltan las credenciales públicas de Supabase.");
      return;
    }

    setSavingBio(true);
    setFormError(null);

    const trimmedBio = bioDraft.trim();
    const { error } = await supabase
      .from("profiles")
      .update({ bio: trimmedBio || null })
      .eq("user_id", currentProfile.userId);

    if (error) {
      setSavingBio(false);
      setFormError(error.message);
      return;
    }

    setCurrentProfile((current) => ({ ...current, bio: trimmedBio || null }));
    setEditingBio(false);
    setSavingBio(false);

    startTransition(() => {
      router.refresh();
    });
  }

  async function handleAvatarSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    const supabase = createSupabaseBrowserClient();

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!supabase) {
      setFormError("Faltan las credenciales públicas de Supabase.");
      return;
    }

    setUploadingAvatar(true);
    setFormError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || user.id !== currentProfile.userId) {
      setUploadingAvatar(false);
      setFormError("Tu sesión expiró. Inicia sesión otra vez.");
      return;
    }

    const nextPath = getProfileImageStoragePath(user.id, file.name);

    try {
      const { error: uploadError } = await supabase.storage.from(profileImageBucket).upload(nextPath, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

      if (uploadError) {
        throw uploadError;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_path: nextPath })
        .eq("user_id", user.id);

      if (updateError) {
        throw updateError;
      }

      if (currentProfile.avatarPath) {
        await supabase.storage.from(profileImageBucket).remove([currentProfile.avatarPath]);
      }

      setCurrentProfile((current) => ({
        ...current,
        avatarPath: nextPath,
        avatarUrl: getProfileImagePublicUrl(supabase, nextPath),
      }));

      startTransition(() => {
        router.refresh();
      });
    } catch (avatarError) {
      await supabase.storage.from(profileImageBucket).remove([nextPath]);
      setFormError(getErrorMessage(avatarError));
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[28rem_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-[1.8rem] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/8">
            <div className="flex items-start gap-6">
              <div className="relative">
                {currentProfile.avatarUrl ? (
                  <div className="relative h-40 w-40 overflow-hidden rounded-full bg-[#e8ccb4]">
                    <Image src={currentProfile.avatarUrl} alt={currentProfile.displayName} fill sizes="10rem" className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-full bg-[#e8ccb4] text-5xl font-semibold text-brand-navy">
                    {currentProfile.displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {!readOnly ? (
                  <>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelected} />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      aria-label="Cambiar foto de perfil"
                      disabled={uploadingAvatar}
                      className="absolute bottom-2 right-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-navy text-white shadow-[0_10px_20px_rgba(10,48,120,0.2)] transition hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      <Image src="/icons/add.svg" alt="" width={18} height={18} className="h-5 w-5 invert brightness-0 saturate-0" />
                    </button>
                  </>
                ) : null}
              </div>

              <div className="pt-4">
                <h1 className="font-display text-[2.6rem] font-semibold uppercase leading-[0.95] tracking-[-0.05em] text-brand-navy">{currentProfile.displayName}</h1>
                {readOnly ? (
                  <p className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-brand-burnt">@{currentProfile.username}</p>
                ) : (
                  <Link href={`/u/${currentProfile.username}`} className="mt-2 block text-[2rem] font-semibold tracking-[-0.04em] text-brand-burnt transition hover:text-brand-navy">
                    @{currentProfile.username}
                  </Link>
                )}
                <p className="mt-4 flex items-center gap-2 text-base font-semibold uppercase tracking-[0.03em] text-black/80">
                  <Image src="/icons/social-blue.svg" alt="Google" width={30} height={30} />
                  0 amigos
                </p>
              </div>
            </div>

            <p className="mt-10 text-base font-semibold uppercase tracking-[0.02em] text-black/85">0 países 0 ciudades visitadas</p>

            <div className="mt-6 rounded-[1.4rem] bg-[#fbf7f3] p-5 ring-1 ring-black/6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-[1.5rem] font-semibold tracking-[-0.04em] text-brand-burnt">Sobre mí</h2>
                {!readOnly && !editingBio ? (
                  <button
                    type="button"
                    onClick={() => setEditingBio(true)}
                    aria-label="Editar biografía"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-navy/12 bg-white text-brand-navy transition hover:-translate-y-0.5 hover:bg-brand-navy/5"
                  >
                    <Image src="/icons/pen.svg" alt="" width={18} height={18} className="h-4.5 w-4.5" />
                  </button>
                ) : null}
              </div>

              {editingBio ? (
                <div className="mt-4 space-y-4">
                  <textarea
                    value={bioDraft}
                    onChange={(event) => setBioDraft(event.target.value)}
                    maxLength={280}
                    rows={5}
                    placeholder="Cuéntale a la gente algo sobre ti y tu forma de viajar."
                    className="w-full resize-none rounded-[1rem] border border-black/12 bg-white px-4 py-3 text-base leading-7 text-brand-ink outline-none transition focus:border-brand-navy/35"
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleSaveBio}
                      disabled={savingBio}
                      className="rounded-full bg-brand-navy px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-brand-blue disabled:opacity-60"
                    >
                      {savingBio ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBioDraft(currentProfile.bio ?? "");
                        setEditingBio(false);
                        setFormError(null);
                      }}
                      disabled={savingBio}
                      className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-black/70 transition hover:bg-black/5 disabled:opacity-60"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 max-w-[24rem] text-[1.08rem] leading-8 text-black/80">
                  {currentProfile.bio?.trim()
                    ? currentProfile.bio
                    : "Tu perfil ya está listo. Ahora ya puedes crear álbumes de viaje y subir tus primeras fotos directamente desde tu cuenta."}
                </p>
              )}
            </div>

            {formError ? <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p> : null}

            {!readOnly ? (
              <div className="mt-8">
                <SignOutButton />
              </div>
            ) : null}
          </section>

          <section className="rounded-[1.8rem] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/8">
            <h2 className="font-display text-[2rem] font-semibold tracking-[-0.05em] text-brand-burnt">Álbumes de viaje</h2>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="flex aspect-square items-center justify-center rounded-[1.2rem] border border-dashed border-brand-navy/30 bg-[#fbf7f3] text-5xl text-brand-navy/80 transition hover:-translate-y-0.5 hover:bg-[#f5ece3]"
                  aria-label="Crear álbum"
                >
                  +
                </button>
              ) : null}

              {visibleAlbums.map((album) => (
                <Link
                  key={album.id}
                  href={getAlbumHref(albumBasePath, album.id)}
                  className="text-left"
                >
                  {album.coverUrl ? (
                    <div className="landing-photo relative overflow-hidden rounded-[1.2rem]">
                      <div className="aspect-square" />
                      <Image src={album.coverUrl} alt={album.title} fill sizes="(min-width: 1024px) 8rem, 28vw" className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-[1.2rem] border border-black/10 bg-[#fbf7f3] text-lg font-semibold text-brand-navy/70">
                      Sin portada
                    </div>
                  )}

                  <p className="mt-3 line-clamp-1 text-sm font-semibold text-brand-navy">{album.title}</p>
                </Link>
              ))}
            </div>

            {!albums.length ? <p className="mt-4 text-sm text-black/60">{readOnly ? "Todavía no ha publicado álbumes." : "Todavía no tienes álbumes. Crea uno y usa la primera foto como portada."}</p> : null}
          </section>
        </div>

        <section className="rounded-[1.8rem] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/8">
          {featuredPhotos.length ? (
            <>
              <div>
                <h2 className="font-display text-[2.4rem] font-semibold uppercase tracking-[-0.05em] text-brand-burnt sm:text-[2.8rem]">Fotos destacadas</h2>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-black/55">Una mezcla de recuerdos de distintos álbumes</p>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {featuredPhotos.map((photo) => (
                  <Link key={photo.id} href={getAlbumHref(albumBasePath, photo.albumId)} className="landing-photo relative overflow-hidden rounded-[1.2rem] text-left">
                    <div className="aspect-square" />
                    <Image src={photo.url} alt={photo.albumTitle} fill sizes="(min-width: 1280px) 15rem, (min-width: 640px) 40vw, 90vw" className="object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-4 py-4 text-white">
                      <p className="line-clamp-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/82">{photo.albumTitle}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-[2.8rem] font-semibold uppercase tracking-[-0.05em] text-brand-burnt">{readOnly ? "Todavía no hay fotos destacadas" : "Crea tu primer álbum"}</h2>
                  <p className="mt-3 max-w-[37rem] text-[1.05rem] leading-8 text-black/75">
                    {readOnly
                      ? "En cuanto haya álbumes con fotos, este espacio mostrará una selección destacada del perfil público."
                      : "Sigue el flujo del mockup: nombra el álbum, elige una o varias fotos y guarda. Luego podrás abrirlo en grande y seguir agregando recuerdos de tu viaje."}
                  </p>
                </div>

                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="rounded-full border border-brand-burnt/15 bg-brand-burnt px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:bg-[#b83b00]"
                  >
                    Crear álbum
                  </button>
                ) : null}
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {placeholderPhotos.map((photo, index) => (
                  <div key={`${photo}-${index}`} className="landing-photo overflow-hidden rounded-[1.2rem]">
                    <Image src={photo} alt={`Marcador de posición de álbum ${index + 1}`} width={320} height={320} className="h-auto w-full" />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {createOpen && !readOnly ? (
        <CreateAlbumModal busy={creating} error={formError} files={files} onClose={closeCreateModal} onCreate={handleCreateAlbum} onFilesSelected={handleFilesSelected} />
      ) : null}

      <div className="pointer-events-none fixed bottom-5 right-5 z-10 md:bottom-6 md:right-8">
        <Image src="/icons/chat.svg" alt="Chat" width={60} height={60} className="h-14 w-14 md:h-[60px] md:w-[60px]" />
      </div>
    </>
  );
}