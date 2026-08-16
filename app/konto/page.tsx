"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Logo } from "../components/Logo";
import { useStore } from "../lib/store";

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "1";

export default function KontoPage() {
  const { lang } = useStore();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const notConfigured = () =>
    setNote(
      lang === "pl"
        ? "Logowanie aktywuje się po podłączeniu Google OAuth (zmienne środowiskowe)."
        : "Sign-in activates once Google OAuth is connected (environment variables).",
    );

  // ── Signed in: account dashboard ──
  if (status === "authenticated" && session?.user) {
    const u = session.user;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAdmin = (u as any).role === "ADMIN";
    return (
      <div className="min-h-screen bg-nuit px-6 py-28 text-ivoire md:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <Link href="/"><Logo /></Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-line text-[11px]">
              {lang === "pl" ? "Wyloguj" : "Sign out"}
            </button>
          </div>

          <div className="mt-14 flex items-center gap-5">
            {u.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.image} alt="" className="h-16 w-16 rounded-full border border-ivoire/15" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ombre font-serif text-2xl text-or">
                {(u.name || u.email || "N").charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-serif text-3xl">{lang === "pl" ? "Witaj" : "Welcome"}, {u.name?.split(" ")[0] || "—"}</h1>
              <p className="font-sans text-[13px] text-ivoire/55">{u.email}</p>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { k: lang === "pl" ? "Zamówienia" : "Orders", v: "0" },
              { k: lang === "pl" ? "Adresy" : "Addresses", v: "0" },
              { k: lang === "pl" ? "Ulubione" : "Favourites", v: "0" },
            ].map((c) => (
              <div key={c.k} className="rounded-sm border border-ivoire/10 bg-ombre/50 p-6">
                <p className="font-sans text-[11px] uppercase tracking-wide2 text-ivoire/45">{c.k}</p>
                <p className="mt-2 font-serif text-3xl">{c.v}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 font-sans text-[13px] leading-relaxed text-ivoire/50">
            {lang === "pl"
              ? "Historia zamówień, adresy i ulubione pojawią się tutaj po podłączeniu bazy danych (patrz SYSTEM.md)."
              : "Order history, addresses and favourites appear here once the database is connected (see SYSTEM.md)."}
          </p>

          {isAdmin && (
            <Link href="/admin" className="btn-solid mt-10 inline-flex">
              {lang === "pl" ? "Otwórz konsolę admina" : "Open the admin console"}
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ── Signed out: sign-in ──
  return (
    <div className="flex min-h-screen items-center justify-center bg-nuit px-6 py-24 text-ivoire">
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(70% 50% at 50% 20%, rgba(194,162,90,0.10), transparent 60%)" }}
      />
      <div className="relative w-full max-w-sm">
        <div className="text-center">
          <Link href="/"><Logo /></Link>
          <h1 className="display mt-10 text-4xl">{lang === "pl" ? "Twoje konto" : "Your account"}</h1>
          <p className="mt-3 font-sans text-[13px] leading-relaxed text-ivoire/55">
            {lang === "pl"
              ? "Zaloguj się, aby śledzić zamówienia, zapisywać adresy i ulubione."
              : "Sign in to track orders, save addresses and favourites."}
          </p>
        </div>

        <button
          onClick={() => (googleEnabled ? signIn("google", { callbackUrl: "/konto" }) : notConfigured())}
          disabled={status === "loading"}
          className="mt-10 flex w-full items-center justify-center gap-3 rounded-full bg-ivoire px-6 py-4 font-sans text-[13px] text-nuit transition hover:bg-champagne disabled:opacity-60"
        >
          <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.7 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-17.4z" />
            <path fill="#FBBC05" d="M10.4 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.7l7.8-6.1z" />
            <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.5l-7.4-5.7c-2 1.4-4.7 2.3-7.9 2.3-6.4 0-11.8-3.7-13.6-9.4l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
          </svg>
          {lang === "pl" ? "Kontynuuj z Google" : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-ivoire/12" />
          <span className="font-sans text-[11px] uppercase tracking-wide2 text-ivoire/35">{lang === "pl" ? "lub" : "or"}</span>
          <span className="h-px flex-1 bg-ivoire/12" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.includes("@")) return;
            if (googleEnabled) signIn("email", { email, callbackUrl: "/konto" });
            else notConfigured();
          }}
          className="space-y-3"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={lang === "pl" ? "Twój adres e-mail" : "Your email address"}
            className="w-full rounded-full border border-ivoire/20 bg-transparent px-5 py-3.5 font-sans text-[14px] placeholder:text-ivoire/40 focus:border-or focus:outline-none"
          />
          <button type="submit" className="btn-ghost w-full">
            {lang === "pl" ? "Wyślij link logowania" : "Send a magic link"}
          </button>
        </form>

        {note && <p className="mt-5 text-center font-sans text-[12px] leading-relaxed text-or/80">{note}</p>}

        <p className="mt-8 text-center font-sans text-[11px] leading-relaxed text-ivoire/35">
          {lang === "pl"
            ? "Kontynuując, akceptujesz Regulamin i Politykę prywatności Maison Noor."
            : "By continuing you accept Maison Noor's Terms and Privacy Policy."}
        </p>
      </div>
    </div>
  );
}
