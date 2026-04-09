"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buildTripDraft, getTripHeading, mapTravelTrip, splitCommaSeparatedValues, type TravelTrip, type TravelTripDraft } from "@/lib/trips";

type TripsViewProps = {
  initialTrips: TravelTrip[];
};

type TripFormModalProps = {
  busy: boolean;
  draft: TravelTripDraft;
  error: string | null;
  onChange: (field: keyof TravelTripDraft, value: string) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  title: string;
};

function formatTripDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}

function getTripFormErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "No se pudo guardar el viaje. Intenta otra vez.";
}

function TripFormModal({ busy, draft, error, onChange, onClose, onSubmit, title }: TripFormModalProps) {
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

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#d8a989]/50 px-4 py-8 backdrop-blur-[6px]" onClick={busy ? undefined : onClose}>
      <section className="relative w-full max-w-[80rem] rounded-[1.9rem] bg-white px-7 py-8 shadow-[0_18px_42px_rgba(0,0,0,0.16)] ring-1 ring-black/8 sm:px-12 sm:py-10" aria-modal="true" role="dialog" onClick={(event) => event.stopPropagation()}>
        <button type="button" aria-label="Cerrar" onClick={onClose} disabled={busy} className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-black/5 disabled:opacity-60">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12" />
            <path d="M18 6 6 18" />
          </svg>
        </button>

        <div className="flex items-center gap-5">
          <Image src="/icons/backpack.svg" alt="Mochila" width={50} height={50} className="h-12 w-12" />
          <h2 className="font-display text-[2.1rem] font-semibold uppercase tracking-[-0.05em] text-brand-navy sm:text-[2.5rem]">{title}</h2>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-x-16">
          <div>
            <label className="text-[1.05rem] font-semibold uppercase tracking-[0.02em] text-black/60" htmlFor="trip-destination">Destino</label>
            <input id="trip-destination" value={draft.destination} onChange={(event) => onChange("destination", event.target.value)} placeholder="España, Madrid" className="mt-3 w-full rounded-[1rem] border border-[#cf4e14] bg-white px-4 py-4 text-lg text-brand-ink outline-none transition focus:border-brand-navy/35" maxLength={120} />

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-[1.05rem] font-semibold uppercase tracking-[0.02em] text-black/60" htmlFor="trip-start-date">Fecha inicio</label>
                <input id="trip-start-date" type="date" value={draft.startDate} onChange={(event) => onChange("startDate", event.target.value)} className="trip-date-input mt-3 w-full rounded-[1rem] border border-black/45 bg-white px-4 py-4 pr-6 text-lg text-brand-ink outline-none transition focus:border-brand-navy/35" />
              </div>

              <div>
                <label className="text-[1.05rem] font-semibold uppercase tracking-[0.02em] text-black/60" htmlFor="trip-end-date">Fecha fin</label>
                <input id="trip-end-date" type="date" value={draft.endDate} onChange={(event) => onChange("endDate", event.target.value)} className="trip-date-input mt-3 w-full rounded-[1rem] border border-black/45 bg-white px-4 py-4 pr-6 text-lg text-brand-ink outline-none transition focus:border-brand-navy/35" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[1.05rem] font-semibold uppercase tracking-[0.02em] text-black/60" htmlFor="trip-sleep">Dormir</label>
              <input id="trip-sleep" value={draft.placesToSleep} onChange={(event) => onChange("placesToSleep", event.target.value)} placeholder="Hotel, apartamento, hostal" className="mt-3 w-full rounded-[1rem] border border-[#cf4e14] bg-white px-4 py-4 text-lg text-brand-ink outline-none transition focus:border-brand-navy/35" maxLength={400} />
            </div>

            <div>
              <label className="text-[1.05rem] font-semibold uppercase tracking-[0.02em] text-black/60" htmlFor="trip-eat">Comer</label>
              <input id="trip-eat" value={draft.placesToEat} onChange={(event) => onChange("placesToEat", event.target.value)} placeholder="Restaurante, café, mercado" className="mt-3 w-full rounded-[1rem] border border-[#cf4e14] bg-white px-4 py-4 text-lg text-brand-ink outline-none transition focus:border-brand-navy/35" maxLength={400} />
            </div>

            <div>
              <label className="text-[1.05rem] font-semibold uppercase tracking-[0.02em] text-black/60" htmlFor="trip-visit">Visitar</label>
              <input id="trip-visit" value={draft.placesToVisit} onChange={(event) => onChange("placesToVisit", event.target.value)} placeholder="Museo, barrio, mirador" className="mt-3 w-full rounded-[1rem] border border-[#cf4e14] bg-white px-4 py-4 text-lg text-brand-ink outline-none transition focus:border-brand-navy/35" maxLength={600} />
            </div>
          </div>
        </div>

        {error ? <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="mt-10 flex justify-end">
          <button type="button" onClick={() => void onSubmit()} disabled={busy} className="rounded-[1rem] bg-[#cc4300] px-12 py-4 text-xl font-semibold uppercase text-white shadow-[0_10px_20px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#b73b00] disabled:opacity-60">
            {busy ? "Guardando" : "Crear"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function TripsView({ initialTrips }: TripsViewProps) {
  const router = useRouter();
  const [trips, setTrips] = useState(initialTrips);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TravelTripDraft>(buildTripDraft());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const editingTrip = useMemo(() => trips.find((trip) => trip.id === activeTripId) ?? null, [activeTripId, trips]);

  function openCreateModal() {
    setActiveTripId(null);
    setDraft(buildTripDraft());
    setError(null);
    setOpen(true);
  }

  function openEditModal(trip: TravelTrip) {
    setActiveTripId(trip.id);
    setDraft(buildTripDraft(trip));
    setError(null);
    setOpen(true);
  }

  function closeModal() {
    if (busy) {
      return;
    }

    setOpen(false);
    setActiveTripId(null);
    setDraft(buildTripDraft());
    setError(null);
  }

  function updateDraft(field: keyof TravelTripDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function saveTrip() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setError("Faltan las credenciales públicas de Supabase.");
      return;
    }

    const destination = draft.destination.trim();
    const placesToSleep = splitCommaSeparatedValues(draft.placesToSleep);
    const placesToEat = splitCommaSeparatedValues(draft.placesToEat);
    const placesToVisit = splitCommaSeparatedValues(draft.placesToVisit);

    if (!destination) {
      setError("Escribe un destino para el viaje.");
      return;
    }

    if (!draft.startDate || !draft.endDate) {
      setError("Selecciona la fecha de inicio y la fecha de fin.");
      return;
    }

    if (draft.endDate < draft.startDate) {
      setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (editingTrip) {
        const { data, error: updateError } = await supabase
          .from("user_trips")
          .update({
            destination,
            end_date: draft.endDate,
            places_to_eat: placesToEat,
            places_to_sleep: placesToSleep,
            places_to_visit: placesToVisit,
            start_date: draft.startDate,
          })
          .eq("id", editingTrip.id)
          .select("id, destination, start_date, end_date, places_to_sleep, places_to_eat, places_to_visit, created_at, updated_at")
          .single();

        if (updateError || !data) {
          throw updateError ?? new Error("No se pudo actualizar el viaje.");
        }

        const nextTrip = mapTravelTrip(data);
        setTrips((current) => current.map((trip) => (trip.id === nextTrip.id ? nextTrip : trip)));
      } else {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw userError ?? new Error("Tu sesión expiró. Inicia sesión otra vez.");
        }

        const { data, error: insertError } = await supabase
          .from("user_trips")
          .insert({
            destination,
            end_date: draft.endDate,
            places_to_eat: placesToEat,
            places_to_sleep: placesToSleep,
            places_to_visit: placesToVisit,
            start_date: draft.startDate,
            user_id: user.id,
          })
          .select("id, destination, start_date, end_date, places_to_sleep, places_to_eat, places_to_visit, created_at, updated_at")
          .single();

        if (insertError || !data) {
          throw insertError ?? new Error("No se pudo crear el viaje.");
        }

        const nextTrip = mapTravelTrip(data);
        setTrips((current) => [...current, nextTrip].sort((left, right) => left.startDate.localeCompare(right.startDate)));
      }

      closeModal();
      startTransition(() => {
        router.refresh();
      });
    } catch (caughtError) {
      setError(getTripFormErrorMessage(caughtError));
    } finally {
      setBusy(false);
    }
  }

  async function deleteTrip(trip: TravelTrip) {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setError("Faltan las credenciales públicas de Supabase.");
      return;
    }

    setError(null);

    const { error: deleteError } = await supabase.from("user_trips").delete().eq("id", trip.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setTrips((current) => current.filter((item) => item.id !== trip.id));

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <>
      <div className="page-shell pt-10 md:pt-12">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-8">
            <Link href="/profile" aria-label="Volver al perfil" className="inline-flex h-12 w-12 items-center justify-center text-brand-navy transition hover:-translate-y-0.5">
              <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12 8 24l12 12" />
                <path d="M10 24h17c7.5 0 13 5.5 13 13" />
              </svg>
            </Link>
            <h1 className="font-display text-[2.6rem] font-semibold uppercase tracking-[-0.05em] text-brand-navy sm:text-[3rem]">Mis viajes</h1>
          </div>

          <button type="button" onClick={openCreateModal} className="rounded-[0.9rem] bg-[linear-gradient(180deg,#3266d0,#244a9a)] px-8 py-4 text-base font-semibold text-white shadow-[0_12px_20px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5">
            Añadir viaje
          </button>
        </div>

        {error && !open ? <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="mt-10 space-y-10">
          {trips.length ? (
            trips.map((trip) => (
              <section key={trip.id} className="grid gap-5 md:grid-cols-[5rem_minmax(0,1fr)] md:items-start">
                <div className="flex items-start justify-center pt-2 md:justify-start">
                  <Image src="/icons/backpack.svg" alt="Viaje" width={54} height={54} className="h-[3.4rem] w-[3.4rem]" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="font-display text-[2.3rem] font-semibold uppercase tracking-[-0.05em] text-brand-navy">{getTripHeading(trip.destination)}</h2>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => openEditModal(trip)} aria-label={`Editar viaje ${trip.heading}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-navy/12 bg-white transition hover:-translate-y-0.5 hover:bg-brand-navy/5">
                        <Image src="/icons/pen.svg" alt="" width={18} height={18} className="h-4.5 w-4.5" />
                      </button>
                      <button type="button" onClick={() => void deleteTrip(trip)} aria-label={`Eliminar viaje ${trip.heading}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cf4e14]/20 bg-white transition hover:-translate-y-0.5 hover:bg-[#fff1ea]">
                        <Image src="/icons/trash.svg" alt="" width={18} height={18} className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>

                  <article className="mt-5 max-w-[48rem] rounded-[1.4rem] bg-white px-7 py-8 shadow-[0_8px_18px_rgba(0,0,0,0.16)] ring-1 ring-black/12 sm:px-10 sm:py-10">
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div>
                        <h3 className="text-[1.05rem] font-bold text-black">Destino</h3>
                        <div className="mt-2 space-y-1 text-[1.05rem] leading-8 text-black/92">
                          {trip.destinationParts.map((part) => (
                            <p key={`${trip.id}-${part}`}>{part}</p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[1.05rem] font-bold text-black">Fechas</h3>
                        <p className="mt-2 text-[1.05rem] leading-8 text-black/92">{formatTripDate(trip.startDate)} - {formatTripDate(trip.endDate)}</p>
                      </div>
                    </div>

                    <div className="mt-8 space-y-7 text-[1.05rem] leading-8 text-black/92">
                      <div>
                        <h3 className="font-bold text-black">Dormir</h3>
                        <div className="mt-1">
                          {trip.placesToSleep.length ? trip.placesToSleep.map((item) => <p key={`${trip.id}-sleep-${item}`}>{item}</p>) : <p>-</p>}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-black">Comer</h3>
                        <div className="mt-1">
                          {trip.placesToEat.length ? trip.placesToEat.map((item) => <p key={`${trip.id}-eat-${item}`}>{item}</p>) : <p>-</p>}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-black">Visitar</h3>
                        <div className="mt-1">
                          {trip.placesToVisit.length ? trip.placesToVisit.map((item) => <p key={`${trip.id}-visit-${item}`}>{item}</p>) : <p>-</p>}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </section>
            ))
          ) : (
            <section className="rounded-[1.8rem] bg-white px-8 py-10 shadow-[0_10px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/8">
              <h2 className="font-display text-[2rem] font-semibold uppercase tracking-[-0.05em] text-brand-burnt">Todavía no tienes viajes</h2>
              <p className="mt-4 max-w-[42rem] text-[1.05rem] leading-8 text-black/75">Añade tu primer viaje para guardar destino, fechas y tus sitios para dormir, comer y visitar.</p>
            </section>
          )}
        </div>
      </div>

      {open ? <TripFormModal busy={busy} draft={draft} error={error} onChange={updateDraft} onClose={closeModal} onSubmit={saveTrip} title="Planea tu viaje" /> : null}

      <div className="pointer-events-none fixed bottom-5 right-5 z-10 md:bottom-6 md:right-8">
        <Image src="/icons/chat.svg" alt="Chat" width={60} height={60} className="h-14 w-14 md:h-[60px] md:w-[60px]" />
      </div>
    </>
  );
}