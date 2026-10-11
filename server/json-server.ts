import { ApiError } from "./tasks/http";
import { postgresRecord, postgresWrite } from "./storage/postgres";
function usePostgres() {
  if (process.env.DATABASE_URL) return true;
  if (process.env.VERCEL && !process.env.JSON_SERVER_URL)
    throw new ApiError(
      503,
      "Chưa cấu hình nơi lưu dữ liệu. Hãy đặt DATABASE_URL trên Vercel và triển khai lại.",
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
      "Vercel không thể kết nối JSON Server trên máy cá nhân. Hãy đặt DATABASE_URL hoặc JSON_SERVER_URL của máy chủ và triển khai lại.",
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
      "Không thể kết nối nơi lưu dữ liệu. Hãy kiểm tra JSON_SERVER_URL và bảo đảm JSON Server đang chạy.",
    );
  }
  if (response.status === 404)
    throw new ApiError(404, "Không tìm thấy dữ liệu.");
  if (!response.ok)
    throw new ApiError(502, "Không thể hoàn tất yêu cầu lưu dữ liệu.");
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
