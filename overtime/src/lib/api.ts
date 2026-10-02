/** Tiny client fetch helper with human error messages. */
export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init || {};
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...(rest.headers || {}) },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new Error("You seem to be offline. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || "Something went wrong. Please try again.");
  return data as T;
}
