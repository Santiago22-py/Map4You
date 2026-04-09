"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useId, useMemo, useRef, useState, type ChangeEvent } from "react";

import { SignOutButton } from "@/components/sign-out-button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getTravelAlbumPublicUrl, getTravelAlbumStoragePath, travelAlbumBucket, type TravelAlbum, type TravelAlbumPhoto } from "@/lib/travel-albums";

const placeholderPhotos = [
  "/images/profile/paris-placeholder.jpg",
  "/images/profile/madrid-placeholder.jpg",
  "/images/profile/rio-placeholder.jpg",
];

type ProfileViewProps = {
  displayName: string;
  initialAlbums: TravelAlbum[];
  username: string;
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

function shuffleItems<T>(items: T[]) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const currentValue = nextItems[index];

    nextItems[index] = nextItems[randomIndex];
    nextItems[randomIndex] = currentValue;
  }

  return nextItems;
}

function getFeaturedPhotos(albums: TravelAlbum[]) {
  const featuredPhotos: FeaturedPhoto[] = [];
  const shuffledAlbums = shuffleItems(albums.filter((album) => album.photos.length));
  const remainingPhotosByAlbum = new Map<string, FeaturedPhoto[]>();

  for (const album of shuffledAlbums) {
    const shuffledPhotos = shuffleItems(album.photos).map((photo) => ({
      albumId: album.id,
      albumTitle: album.title,
      id: photo.id,
      url: photo.url,
    }));

    if (!shuffledPhotos.length) {
      continue;
    }

    featuredPhotos.push(shuffledPhotos[0]);
    remainingPhotosByAlbum.set(album.id, shuffledPhotos.slice(1));

    if (featuredPhotos.length === 8) {
      return featuredPhotos;
    }
  }

  for (const album of shuffledAlbums) {
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

export function ProfileView({ displayName, initialAlbums, username }: ProfileViewProps) {
  const router = useRouter();
  const [albums, setAlbums] = useState(initialAlbums);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [files, setFiles] = useState<PreviewFile[]>([]);

  const featuredPhotos = useMemo(() => getFeaturedPhotos(albums), [albums]);

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

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[28rem_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-[1.8rem] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/8">
            <div className="flex items-start gap-6">
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-[#e8ccb4] text-5xl font-semibold text-brand-navy">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="pt-4">
                <h1 className="font-display text-[2.6rem] font-semibold uppercase leading-[0.95] tracking-[-0.05em] text-brand-navy">{displayName}</h1>
                <p className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-brand-burnt">{username}</p>
                <p className="mt-4 flex items-center gap-2 text-base font-semibold uppercase tracking-[0.03em] text-black/80">
                  <Image src="/icons/social-blue.svg" alt="Google" width={30} height={30} />
                  0 amigos
                </p>
              </div>
            </div>

            <p className="mt-10 text-base font-semibold uppercase tracking-[0.02em] text-black/85">0 países 0 ciudades visitadas</p>
            <p className="mt-4 max-w-[24rem] text-[1.08rem] leading-8 text-black/80">
              Tu perfil ya está listo. Ahora ya puedes crear álbumes de viaje y subir tus primeras fotos directamente desde tu cuenta.
            </p>

            <div className="mt-8">
              <SignOutButton />
            </div>
          </section>

          <section className="rounded-[1.8rem] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/8">
            <h2 className="font-display text-[2rem] font-semibold tracking-[-0.05em] text-brand-burnt">Álbumes de viaje</h2>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="flex aspect-square items-center justify-center rounded-[1.2rem] border border-dashed border-brand-navy/30 bg-[#fbf7f3] text-5xl text-brand-navy/80 transition hover:-translate-y-0.5 hover:bg-[#f5ece3]"
                aria-label="Crear álbum"
              >
                +
              </button>

              {albums.slice(0, 5).map((album) => (
                <Link
                  key={album.id}
                  href={`/profile/albums/${album.id}`}
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

            {!albums.length ? <p className="mt-4 text-sm text-black/60">Todavía no tienes álbumes. Crea uno y usa la primera foto como portada.</p> : null}
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
                  <Link key={photo.id} href={`/profile/albums/${photo.albumId}`} className="landing-photo relative overflow-hidden rounded-[1.2rem] text-left">
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
                  <h2 className="font-display text-[2.8rem] font-semibold uppercase tracking-[-0.05em] text-brand-burnt">Crea tu primer álbum</h2>
                  <p className="mt-3 max-w-[37rem] text-[1.05rem] leading-8 text-black/75">
                    Sigue el flujo del mockup: nombra el álbum, elige una o varias fotos y guarda. Luego podrás abrirlo en grande y seguir agregando recuerdos de tu viaje.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="rounded-full border border-brand-burnt/15 bg-brand-burnt px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:bg-[#b83b00]"
                >
                  Crear álbum
                </button>
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

      {createOpen ? (
        <CreateAlbumModal busy={creating} error={formError} files={files} onClose={closeCreateModal} onCreate={handleCreateAlbum} onFilesSelected={handleFilesSelected} />
      ) : null}

      <div className="pointer-events-none fixed bottom-5 right-5 z-10 md:bottom-6 md:right-8">
        <Image src="/icons/chat.svg" alt="Chat" width={60} height={60} className="h-14 w-14 md:h-[60px] md:w-[60px]" />
      </div>
    </>
  );
}