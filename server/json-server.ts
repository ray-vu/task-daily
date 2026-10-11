import { ApiError } from "./tasks/http";
const baseUrl = () => process.env.JSON_SERVER_URL || "http://127.0.0.1:3002";
export async function upstream<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      ...init,
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...init.headers },
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    throw new ApiError(
      503,
      "Workspace storage is unavailable. Start JSON Server and retry.",
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
  const result = queue.questJsonWrites!.then(action);
  queue.questJsonWrites = result.catch(() => {});
  return result;
}
