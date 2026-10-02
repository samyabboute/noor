"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Language } from "@/lib/types";
import { api } from "@/lib/api";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

const LANGS: { value: Language; label: string }[] = [
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "en", label: "English" },
  { value: "pl", label: "Polski" },
];

export function LanguagePicker({ value }: { value: Language }) {
  const [lang, setLang] = useState(value);
  const router = useRouter();
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        label="Confirmation language"
        value={lang}
        className="w-44"
        options={LANGS}
        onChange={async (v) => {
          const prev = lang;
          setLang(v as Language);
          try {
            await api("/api/me/language", { method: "POST", json: { language: v } });
            toast({ title: "Language saved", description: "Your next confirmation email uses it." });
            router.refresh();
          } catch (e) {
            setLang(prev);
            toast({ tone: "error", title: "Couldn’t save", description: (e as Error).message });
          }
        }}
      />
      <span className="text-[13px] text-ink-400">Used for the confirmation email Overtime prepares for you.</span>
    </div>
  );
}
