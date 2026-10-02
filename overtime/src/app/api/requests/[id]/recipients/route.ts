import type { RecipientSource } from "@/lib/types";
import { requireUser } from "@/server/auth";
import { body, route } from "@/server/http";
import { repo, ValidationError } from "@/server/store";

type Ctx = { params: { id: string } };

export const POST = route<Ctx>(async (req, { params }) => {
  const user = await requireUser("monitoring");
  const { items } = await body<{ items?: { userId: string; source?: RecipientSource }[] }>(req);
  if (!Array.isArray(items) || !items.length) throw new ValidationError("Choose at least one agent to add.");
  const r = repo();
  const clean = items.map((it) => ({
    userId: String(it.userId),
    source: (it.source?.type === "dl" && r.dls().some((d) => d.id === (it.source as { id: string }).id)
      ? it.source
      : it.source?.type === "group" && r.groups().some((g) => g.id === (it.source as { id: string }).id)
        ? it.source
        : { type: "individual" }) as RecipientSource,
  }));
  const added = r.addRecipients(user.id, params.id, clean);
  return { added: added.length };
});

export const DELETE = route<Ctx>(async (req, { params }) => {
  const user = await requireUser("monitoring");
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) throw new ValidationError("Missing agent.");
  repo().removeRecipient(user.id, params.id, userId);
  return { ok: true };
});
