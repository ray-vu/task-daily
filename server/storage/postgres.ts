import { AsyncLocalStorage } from "node:async_hooks";
import { Pool, type PoolClient } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import { ApiError } from "../tasks/http";
import { z } from "zod";

const state = globalThis as typeof globalThis & {
  questPostgresPool?: Pool;
  questPostgresReady?: Promise<void>;
  questPostgresTransaction?: AsyncLocalStorage<PoolClient>;
};
const transaction = (state.questPostgresTransaction ??=
  new AsyncLocalStorage<PoolClient>());

function pool() {
  if (!state.questPostgresPool) {
    state.questPostgresPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 5000,
      statement_timeout: 10000,
    });
    state.questPostgresPool.on("error", () => {
      console.error("Idle workspace database connection failed.");
    });
    attachDatabasePool(state.questPostgresPool);
  }
  return state.questPostgresPool;
}

async function ready() {
  state.questPostgresReady ??= (async () => {
    const client = await pool().connect();
    try {
      await client.query("BEGIN");
      // Coordinate schema creation across cold starts and deployed instances.
      await client.query("SELECT pg_advisory_xact_lock(114617, 1)");
      await client.query(`CREATE TABLE IF NOT EXISTS quest_records (
        collection TEXT NOT NULL CHECK (collection IN ('tasks', 'projects')),
        id TEXT NOT NULL,
        data JSONB NOT NULL,
        PRIMARY KEY (collection, id)
      )`);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  })().catch((error) => {
    state.questPostgresReady = undefined;
    throw error;
  });
  await state.questPostgresReady;
}

function storageError(error: unknown): never {
  if (error instanceof ApiError) throw error;
  if ((error as { code?: string })?.code === "23505")
    throw new ApiError(409, "Đã có bản ghi với mã này.");
  throw new ApiError(
    503,
    "Không thể kết nối cơ sở dữ liệu. Hãy kiểm tra DATABASE_URL và kết nối database.",
  );
}

export async function postgresRecord<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  try {
    await ready();
    const match = /^\/(tasks|projects)(?:\/([^/]+))?$/.exec(path);
    if (!match) throw new ApiError(400, "Đường dẫn lưu trữ không hợp lệ.");
    const [, collection, id] = match;
    const db = transaction.getStore() || pool();
    const method = init.method || "GET";
    if (method === "GET") {
      const result = id
        ? await db.query(
            "SELECT data FROM quest_records WHERE collection = $1 AND id = $2",
            [collection, id],
          )
        : await db.query(
            "SELECT data FROM quest_records WHERE collection = $1 ORDER BY id",
            [collection],
          );
      if (id && !result.rows.length)
        throw new ApiError(404, "Không tìm thấy dữ liệu.");
      return (
        id ? result.rows[0].data : result.rows.map((row) => row.data)
      ) as T;
    }
    if (method === "DELETE" && id) {
      const result = await db.query(
        "DELETE FROM quest_records WHERE collection = $1 AND id = $2 RETURNING data",
        [collection, id],
      );
      if (!result.rows.length)
        throw new ApiError(404, "Không tìm thấy dữ liệu.");
      return result.rows[0].data as T;
    }
    if (method === "POST" || (method === "PUT" && id)) {
      const data = JSON.parse(String(init.body));
      const result =
        method === "POST"
          ? await db.query(
              "INSERT INTO quest_records (collection, id, data) VALUES ($1, $2, $3::jsonb) RETURNING data",
              [collection, data.id, JSON.stringify(data)],
            )
          : await db.query(
              "UPDATE quest_records SET data = $3::jsonb WHERE collection = $1 AND id = $2 RETURNING data",
              [collection, id, JSON.stringify(data)],
            );
      if (!result.rows.length)
        throw new ApiError(404, "Không tìm thấy dữ liệu.");
      return result.rows[0].data as T;
    }
    throw new ApiError(405, "Thao tác lưu trữ không được hỗ trợ.");
  } catch (error) {
    return storageError(error);
  }
}

export async function postgresWrite<T>(action: () => Promise<T>): Promise<T> {
  let client: PoolClient | undefined;
  try {
    await ready();
    client = await pool().connect();
    await client.query("BEGIN");
    // Protect check + write operations, including project relations, across instances.
    await client.query("SELECT pg_advisory_xact_lock(114617, 2)");
    const result = await transaction.run(client, action);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client?.query("ROLLBACK").catch(() => {});
    // Preserve validation errors from the action; only translate driver failures.
    if (error instanceof ApiError || error instanceof z.ZodError) throw error;
    return storageError(error);
  } finally {
    client?.release();
  }
}
