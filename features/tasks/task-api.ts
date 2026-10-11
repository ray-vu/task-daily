import {
  createSchema,
  taskFields,
  statusBodySchema,
  importSchema,
  idSchema,
} from "../../shared/validation/tasks";
import { validateInput } from "../../shared/validation/client";
import type { Task, Status } from "./types";

import { apiRequest } from "../api-client";
const request = <T>(path: string, init: RequestInit = {}) =>
  apiRequest<T>(`/api/tasks${path}`, init);
export const taskApi = {
  list: () => request<Task[]>(""),
  create: (task: Task) =>
    request<Task>("", {
      method: "POST",
      body: JSON.stringify(validateInput(createSchema, task)),
    }),
  update: (task: Task) => {
    const { id, ...fields } = task;
    return request<Task>(
      `/${encodeURIComponent(validateInput(idSchema, id))}`,
      {
        method: "PUT",
        body: JSON.stringify(validateInput(taskFields, fields)),
      },
    );
  },
  move: (id: string, status: Status) =>
    request<Task>(
      `/${encodeURIComponent(validateInput(idSchema, id))}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(validateInput(statusBodySchema, { status })),
      },
    ),
  delete: (id: string) =>
    request<void>(`/${encodeURIComponent(validateInput(idSchema, id))}`, {
      method: "DELETE",
    }),
  import: (tasks: Task[]) =>
    request<{ tasks: Task[]; imported: number; skipped: number }>("/import", {
      method: "POST",
      body: JSON.stringify(validateInput(importSchema, { tasks })),
    }),
};
