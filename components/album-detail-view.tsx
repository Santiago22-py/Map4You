"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useRef, useState, type ChangeEvent } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { validateImageFiles } from "@/lib/image-upload-validation";
import { getTravelAlbumPublicUrl, getTravelAlbumStoragePath, travelAlbumBucket, type TravelAlbum, type TravelAlbumPhoto } from "@/lib/travel-albums";

type AlbumDetailViewProps = {
  album: TravelAlbum;
  backHref?: string;
  backLabel?: string;
  checkoutHref?: string;
  readOnly?: boolean;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "No se pudo actualizar el álbum. Intenta otra vez.";
}

async function removeUploadedFiles(paths: string[]) {
  const supabase = createSupabaseBrowserClient();

  if (!supabase || !paths.length) {
    return;
  }

  await supabase.storage.from(travelAlbumBucket).remove(paths);
}

export function AlbumDetailView({ album, backHref = "/profile", backLabel = "Volver al perfil", checkoutHref, readOnly = false }: AlbumDetailViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState(album);
  const [titleDraft, setTitleDraft] = useState(album.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [deletingAlbum, setDeletingAlbum] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedPhotos = useMemo(
    () => [...currentAlbum.photos].sort((left, right) => left.sortOrder - right.sortOrder),
    [currentAlbum.photos],
  );

  async function saveTitle() {
    const supabase = createSupabaseBrowserClient();
    const trimmedTitle = titleDraft.trim();

    if (!trimmedTitle) {
      setError("Escribe un nombre para el álbum.");
      return;
    }

    if (!supabase) {
      setError("Faltan las credenciales públicas de Supabase.");
      return;
    }

    setSavingTitle(true);
    setError(null);

    const { error: updateError } = await supabase.from("travel_albums").update({ title: trimmedTitle }).eq("id", currentAlbum.id);

    if (updateError) {
      setSavingTitle(false);
      setError(getErrorMessage(updateError));
      return;
    }

    setCurrentAlbum((current) => ({ ...current, title: trimmedTitle }));
    setEditingTitle(false);
    setSavingTitle(false);

    startTransition(() => {
      router.refresh();
    });
  }

  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const validation = validateImageFiles(selectedFiles);
    const supabase = createSupabaseBrowserClient();

    event.target.value = "";

    if (validation.error) {
      setError(validation.error);
      return;
    }

    if (!validation.validFiles.length) {
      return;
    }

    if (!supabase) {
      setError("Faltan las credenciales públicas de Supabase.");
      return;
    }

    setUploadingPhotos(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setUploadingPhotos(false);
      setError("Tu sesión expiró. Inicia sesión otra vez.");
      return;
    }

    const uploadedPaths: string[] = [];
    const nextSortOrder = sortedPhotos.at(-1)?.sortOrder ?? -1;

    try {
      const insertedPhotos: TravelAlbumPhoto[] = [];

      for (const [index, file] of validation.validFiles.entries()) {
        const sortOrder = nextSortOrder + index + 1;
        const storagePath = getTravelAlbumStoragePath(user.id, currentAlbum.id, sortOrder, file.name);
        const { error: uploadError } = await supabase.storage.from(travelAlbumBucket).upload(storagePath, file, {
          contentType: file.type || undefined,
          upsert: false,
        });

        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(storagePath);
        insertedPhotos.push({
          id: crypto.randomUUID(),
          path: storagePath,
          sortOrder,
          url: getTravelAlbumPublicUrl(supabase, storagePath),
        });
      }

      const { data: insertedRows, error: insertError } = await supabase
        .from("travel_album_photos")
        .insert(
          insertedPhotos.map((photo) => ({
            album_id: currentAlbum.id,
            sort_order: photo.sortOrder,
            storage_path: photo.path,
          })),
        )
        .select("id, storage_path, sort_order");

      if (insertError) {
        throw insertError;
      }

      const normalizedPhotos = insertedRows.map((row) => ({
        id: row.id,
        path: row.storage_path,
        sortOrder: row.sort_order,
        url: getTravelAlbumPublicUrl(supabase, row.storage_path),
      }));

      const nextCoverPath = currentAlbum.coverPath ?? normalizedPhotos[0]?.path ?? null;

      if (nextCoverPath !== currentAlbum.coverPath) {
        const { error: coverUpdateError } = await supabase.from("travel_albums").update({ cover_path: nextCoverPath }).eq("id", currentAlbum.id);

        if (coverUpdateError) {
          throw coverUpdateError;
        }
      }

      setCurrentAlbum((current) => ({
        ...current,
        coverPath: nextCoverPath,
        coverUrl: nextCoverPath ? getTravelAlbumPublicUrl(supabase, nextCoverPath) : null,
        photoCount: current.photoCount + normalizedPhotos.length,
        photos: [...current.photos, ...normalizedPhotos],
      }));

      startTransition(() => {
        router.refresh();
      });
    } catch (uploadError) {
      await removeUploadedFiles(uploadedPaths);
      setError(getErrorMessage(uploadError));
    } finally {
      setUploadingPhotos(false);
    }
  }

  async function handleDeletePhoto(photo: TravelAlbumPhoto) {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setError("Faltan las credenciales públicas de Supabase.");
      return;
    }

    setDeletingPhotoId(photo.id);
    setError(null);

    try {
      const { error: deleteRowError } = await supabase.from("travel_album_photos").delete().eq("id", photo.id).eq("album_id", currentAlbum.id);

      if (deleteRowError) {
        throw deleteRowError;
      }

      const { error: deleteStorageError } = await supabase.storage.from(travelAlbumBucket).remove([photo.path]);

      if (deleteStorageError) {
        throw deleteStorageError;
      }

      const remainingPhotos = sortedPhotos.filter((currentPhoto) => currentPhoto.id !== photo.id);
      const nextCoverPath = currentAlbum.coverPath === photo.path ? remainingPhotos[0]?.path ?? null : currentAlbum.coverPath;

      if (nextCoverPath !== currentAlbum.coverPath) {
        const { error: coverUpdateError } = await supabase.from("travel_albums").update({ cover_path: nextCoverPath }).eq("id", currentAlbum.id);

        if (coverUpdateError) {
          throw coverUpdateError;
        }
      }

      setCurrentAlbum((current) => ({
        ...current,
        coverPath: nextCoverPath,
        coverUrl: nextCoverPath ? getTravelAlbumPublicUrl(supabase, nextCoverPath) : null,
        photoCount: remainingPhotos.length,
        photos: remainingPhotos,
      }));

      startTransition(() => {
        router.refresh();
      });
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setDeletingPhotoId(null);
    }
  }

  async function handleDeleteAlbum() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setError("Faltan las credenciales públicas de Supabase.");
      return;
    }

    const confirmed = window.confirm("¿Seguro que quieres eliminar este álbum completo? Esta acción no se puede deshacer.");

    if (!confirmed) {
      return;
    }

    setDeletingAlbum(true);
    setError(null);

    try {
      const allPaths = currentAlbum.photos.map((photo) => photo.path);

      if (allPaths.length) {
        const { error: storageError } = await supabase.storage.from(travelAlbumBucket).remove(allPaths);

        if (storageError) {
          throw storageError;
        }
      }

      const { error: deleteAlbumError } = await supabase.from("travel_albums").delete().eq("id", currentAlbum.id);

      if (deleteAlbumError) {
        throw deleteAlbumError;
      }

      startTransition(() => {
        router.push("/profile");
        router.refresh();
      });
    } catch (deleteError) {
      setDeletingAlbum(false);
      setError(getErrorMessage(deleteError));
    }
  }

  return (
    <main className="flex-1 bg-[#f7efe8] pb-10 md:pb-14">
      <div className="page-shell pt-10 md:pt-12">
        <section className="rounded-[1.8rem] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-4">
              <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-brand-navy/70 transition hover:text-brand-navy">
                <span aria-hidden="true">←</span>
                {backLabel}
              </Link>

              {!readOnly && editingTitle ? (
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    value={titleDraft}
                    onChange={(event) => setTitleDraft(event.target.value)}
                    maxLength={80}
                    className="w-full max-w-[28rem] rounded-[1rem] border border-black px-4 py-3 text-[1.5rem] font-semibold uppercase tracking-[-0.04em] text-brand-ink outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/12"
                  />
                  <button
                    type="button"
                    disabled={savingTitle}
                    onClick={saveTitle}
                    className="rounded-full bg-brand-navy px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-brand-blue disabled:opacity-60"
                  >
                    {savingTitle ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    type="button"
                    disabled={savingTitle}
                    onClick={() => {
                      setTitleDraft(currentAlbum.title);
                      setEditingTitle(false);
                      setError(null);
                    }}
                    className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-black/70 transition hover:bg-black/5 disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-[2.6rem] font-semibold uppercase tracking-[-0.05em] text-brand-burnt sm:text-[3.2rem]">{currentAlbum.title}</h1>
                  {!readOnly ? (
                    <button
                      type="button"
                      onClick={() => setEditingTitle(true)}
                      aria-label="Editar nombre del álbum"
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-brand-navy/12 bg-brand-navy/5 text-brand-navy transition hover:-translate-y-0.5 hover:bg-brand-navy/8"
                    >
                      <Image src="/icons/pen.svg" alt="" width={22} height={22} className="h-5 w-5" />
                    </button>
                  ) : null}
                </div>
              )}

              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-black/55">{currentAlbum.photoCount === 1 ? "1 foto" : `${currentAlbum.photoCount} fotos`}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {checkoutHref ? (
                <Link
                  href={checkoutHref}
                  className="inline-flex items-center rounded-full bg-[#f3e1d2] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-brand-burnt shadow-[0_10px_20px_rgba(0,0,0,0.08)] ring-1 ring-brand-burnt/12 transition hover:-translate-y-0.5 hover:bg-[#edd7c5]"
                >
                  Imprime este álbum
                </Link>
              ) : null}

              {!readOnly ? (
                <>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                  <button
                    type="button"
                    disabled={uploadingPhotos || deletingAlbum}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Agregar fotos"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#3266d0,#244a9a)] text-white shadow-[0_16px_30px_rgba(36,74,154,0.28)] transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    <Image src="/icons/add.svg" alt="" width={22} height={22} className="h-5 w-5 invert brightness-0 saturate-0" />
                  </button>
                  <button
                    type="button"
                    disabled={deletingAlbum || uploadingPhotos || savingTitle}
                    onClick={handleDeleteAlbum}
                    aria-label="Eliminar álbum"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-red-50 text-brand-burnt shadow-[0_10px_20px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:bg-red-100 disabled:opacity-60"
                  >
                    <Image src="/icons/trash.svg" alt="" width={20} height={20} className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {error ? <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          {sortedPhotos.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sortedPhotos.map((photo) => (
                <article key={photo.id} className="group relative overflow-hidden rounded-[1.2rem] bg-[#f7efe8] shadow-[0_14px_28px_rgba(10,48,120,0.14)]">
                  <div className="aspect-square" />
                  <Image src={photo.url} alt={currentAlbum.title} fill sizes="(min-width: 1280px) 21rem, (min-width: 640px) 45vw, 90vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  {!readOnly ? (
                    <button
                      type="button"
                      disabled={deletingPhotoId === photo.id}
                      onClick={() => handleDeletePhoto(photo)}
                      aria-label="Eliminar foto"
                      className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/92 text-brand-burnt shadow-[0_10px_20px_rgba(0,0,0,0.12)] transition hover:bg-white disabled:opacity-60"
                    >
                      <Image src="/icons/trash.svg" alt="" width={20} height={20} className="h-5 w-5" />
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[1.4rem] border border-dashed border-brand-navy/25 bg-[#fbf7f3] p-10 text-center">
              <p className="font-display text-[2rem] font-semibold tracking-[-0.05em] text-brand-navy">Este álbum todavía no tiene fotos</p>
              <p className="mt-3 text-base text-black/65">Agrega nuevas imágenes para volver a llenar esta página solo con recuerdos del viaje.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}