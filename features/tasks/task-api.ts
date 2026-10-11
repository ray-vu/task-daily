import type { Task, Status } from "./types";

import { apiRequest } from "../api-client";
const request = <T>(path: string, init: RequestInit = {}) =>
  apiRequest<T>(`/api/tasks${path}`, init);
export const taskApi = {
  list: () => request<Task[]>(""),
  create: (task: Task) =>
    request<Task>("", { method: "POST", body: JSON.stringify(task) }),
  update: (task: Task) => {
    const { id, ...fields } = task;
    return request<Task>(`/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(fields),
    });
  },
  move: (id: string, status: Status) =>
    request<Task>(`/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  delete: (id: string) =>
    request<void>(`/${encodeURIComponent(id)}`, { method: "DELETE" }),
  import: (tasks: Task[]) =>
    request<{ tasks: Task[]; imported: number; skipped: number }>("/import", {
      method: "POST",
      body: JSON.stringify({ tasks }),
    }),
};
