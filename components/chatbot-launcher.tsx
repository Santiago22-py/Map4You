"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { chatbotSuggestions } from "@/lib/chatbot-knowledge";

type ClientChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const initialMessages: ClientChatMessage[] = [
  {
    role: "assistant",
    content: "Hola, soy el asistente de Map 4 You. Puedo ayudarte con el funcionamiento de la web, los destinos visibles y dudas básicas de cuenta.",
  },
];

export function ChatbotLauncher() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ClientChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();

    if (!trimmed || isSending) {
      return;
    }

    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
        }),
      });

      const payload = await response.json() as { error?: string; reply?: string };

      if (!response.ok || !payload.reply) {
        throw new Error(payload.error ?? "No se recibió respuesta del asistente.");
      }

      setMessages((currentMessages) => [...currentMessages, { role: "assistant", content: payload.reply! }]);
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError.message : "No se pudo contactar con el asistente.";
      setError(nextError);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-20 md:bottom-6 md:right-8">
        <button
          type="button"
          aria-label="Abrir asistente de Map 4 You"
          onClick={() => setOpen(true)}
          className="motion-chat-in inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#f3e1d2] shadow-[0_14px_28px_rgba(0,0,0,0.16)] ring-1 ring-black/8 transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(0,0,0,0.18)] md:h-[60px] md:w-[60px]"
        >
          <Image src="/icons/chat.svg" alt="" width={60} height={60} className="h-14 w-14 md:h-[60px] md:w-[60px]" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-end bg-[#c98a60]/24 px-4 py-5 backdrop-blur-[4px] sm:items-center sm:px-6 sm:py-8" onClick={() => setOpen(false)}>
          <section
            className="chatbot-dialog-enter relative flex h-[min(78vh,44rem)] w-full max-w-[24rem] flex-col overflow-hidden rounded-[2rem] bg-[#f7efe7] shadow-[0_22px_60px_rgba(0,0,0,0.22)] ring-1 ring-black/8 sm:max-w-[25rem]"
            aria-modal="true"
            role="dialog"
            aria-labelledby="chatbot-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-[#d59267] px-5 py-4 text-white">
              <div>
                <h2 id="chatbot-title" className="font-display text-2xl font-semibold tracking-[-0.04em]">Asistente Map 4 You</h2>
                <p className="mt-1 text-sm text-white/88">Ayuda sobre la web, destinos y funciones de cuenta</p>
              </div>

              <button
                type="button"
                aria-label="Cerrar asistente"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/12"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              {messages.length <= 1 ? (
                <div className="rounded-[1.4rem] bg-white/90 p-4 ring-1 ring-brand-navy/8">
                  <p className="text-sm leading-6 text-black/65">Puedes empezar con preguntas como estas:</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {chatbotSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => void sendMessage(suggestion.prompt)}
                        className="rounded-full bg-[#f1e2d4] px-3 py-2 text-sm font-medium text-brand-navy transition hover:bg-[#ead3bd]"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={message.role === "user"
                      ? "max-w-[85%] rounded-[1.4rem] rounded-br-md bg-brand-navy px-4 py-3 text-sm leading-6 text-white"
                      : "max-w-[88%] rounded-[1.4rem] rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-black/72 ring-1 ring-black/6"
                    }
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isSending ? (
                <div className="flex justify-start">
                  <div className="rounded-[1.4rem] rounded-bl-md bg-white px-4 py-3 text-sm text-black/55 ring-1 ring-black/6">Escribiendo…</div>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              ) : null}

              <div className="rounded-[1.2rem] bg-white/70 px-4 py-3 text-xs leading-5 text-black/55 ring-1 ring-black/5">
                Responde sobre Map 4 You. Si necesitas entrar en una zona del sitio, el asistente puede guiarte hacia <Link href="/auth" className="font-semibold text-brand-burnt underline underline-offset-2">/auth</Link>, <Link href="/profile" className="font-semibold text-brand-burnt underline underline-offset-2">/profile</Link> o la búsqueda pública.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="border-t border-black/6 bg-white/80 px-4 py-4 sm:px-5">
              <div className="flex items-end gap-3 rounded-[1.6rem] bg-white px-4 py-3 shadow-[0_8px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/6">
                <label htmlFor="chatbot-input" className="sr-only">Escribe tu mensaje</label>
                <textarea
                  id="chatbot-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Escribe tu pregunta"
                  rows={1}
                  className="max-h-28 min-h-[2.5rem] flex-1 resize-none bg-transparent text-sm leading-6 text-brand-ink outline-none placeholder:text-black/35"
                />
                <button
                  type="submit"
                  disabled={isSending || input.trim().length === 0}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:bg-brand-navy/35"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 20 20 12 4 4l2.4 6L14 12l-7.6 2z" fill="currentColor" stroke="none" />
                  </svg>
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
