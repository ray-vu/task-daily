import { ApiError } from "./tasks/http";
import { postgresRecord, postgresWrite } from "./storage/postgres";
function usePostgres() {
  if (process.env.DATABASE_URL) return true;
  if (process.env.VERCEL && !process.env.JSON_SERVER_URL)
    throw new ApiError(
      503,
      "Workspace storage is not configured. Set DATABASE_URL in Vercel and redeploy.",
    );
  return false;
}
function baseUrl() {
  const value = process.env.JSON_SERVER_URL || "http://127.0.0.1:3002";
  const url = new URL(value);
  if (
    process.env.VERCEL &&
    ["localhost", "127.0.0.1", "[::1]", "0.0.0.0"].includes(url.hostname)
  )
    throw new ApiError(
      503,
      "Vercel cannot reach a local JSON Server. Set DATABASE_URL or a hosted JSON_SERVER_URL and redeploy.",
    );
  return value.replace(/\/$/, "");
}
export async function upstream<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (usePostgres()) return postgresRecord<T>(path, init);
  const url = baseUrl();
  let response: Response;
  try {
    response = await fetch(`${url}${path}`, {
      ...init,
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...init.headers },
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    throw new ApiError(
      503,
      "Workspace storage is unavailable. Check JSON_SERVER_URL and ensure JSON Server is running.",
    );
  }
  if (response.status === 404) throw new ApiError(404, "Record not found.");
  if (!response.ok)
    throw new ApiError(
      502,
      "Workspace storage could not complete this request.",
    );
  return response.json() as Promise<T>;
}
// Serialize check + write sequences in this single Next.js process.
const queue = globalThis as typeof globalThis & {
  questJsonWrites?: Promise<unknown>;
};
queue.questJsonWrites ??= Promise.resolve();
export function serialize<T>(action: () => Promise<T>): Promise<T> {
  if (usePostgres()) return postgresWrite(action);
  const result = queue.questJsonWrites!.then(action);
  queue.questJsonWrites = result.catch(() => {});
  return result;
}
