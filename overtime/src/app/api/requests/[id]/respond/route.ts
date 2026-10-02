import { requireUser } from "@/server/auth";
import { body, route } from "@/server/http";
import { mutate, ValidationError } from "@/server/store";
import { agentOffer } from "@/server/views";

type Ctx = { params: { id: string } };

/** An agent answers for themselves only — the user id comes from the session, never the body. */
export const POST = route<Ctx>(async (req, { params }) => {
  const user = await requireUser("agent");
  const { decision, minutes } = await body<{ decision?: string; minutes?: number }>(req);
  if (decision !== "confirm" && decision !== "decline" && decision !== "withdraw") throw new ValidationError("Unknown response.");
  const offer = await mutate((r) => {
    const rec = r.respond(user.id, params.id, decision, typeof minutes === "number" ? minutes : undefined);
    return agentOffer(r, r.request(params.id)!, rec);
  });
  return { offer };
});
