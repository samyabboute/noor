import { parseDirectory } from "@/lib/directory-import";
import { requireUser } from "@/server/auth";
import { body, route } from "@/server/http";
import { mutate, ValidationError } from "@/server/store";

type Ctx = { params: Record<string, string> };

/** Import or refresh a distribution list from an Outlook export (pasted text or the text of a .docx). */
export const POST = route<Ctx>(async (req) => {
  const user = await requireUser("monitoring");
  const b = await body<{ listId?: string; name?: string; address?: string; text?: string }>(req);
  const text = String(b.text || "");
  if (text.length > 500_000) throw new ValidationError("That file is too large.");
  const { people, skipped } = parseDirectory(text);
  const result = await mutate((r) => r.importList(user.id, { listId: b.listId || undefined, name: String(b.name || ""), address: typeof b.address === "string" ? b.address : undefined, people }));
  return { ...result, skipped: skipped.length };
});
