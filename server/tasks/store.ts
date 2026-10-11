import { randomUUID, createHash } from "node:crypto";
import type { Task } from "../../features/tasks/types";
import { ApiError } from "./http";
import { upstream, serialize } from "../json-server";
import { idSchema } from "./validation";

type StoredTask = Omit<Task, "completedAt"> & { completedAt?: string | null };
const localDate = () =>
  new Date().toLocaleDateString("en-CA", {
    timeZone: process.env.TASK_TIME_ZONE || "Asia/Ho_Chi_Minh",
  });
async function validateProject(projectId: string | null | undefined) {
  if (projectId) {
    try {
      await upstream(`/projects/${idSchema.parse(projectId)}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404)
        throw new ApiError(400, "Dự án đã chọn không tồn tại.");
      throw error;
    }
  }
}
const normalize = (task: StoredTask): StoredTask => ({
  ...task,
  projectId: task.projectId ?? null,
});
export const listTasks = async () =>
  (await upstream<StoredTask[]>("/tasks")).map(normalize);
export const getTask = async (id: string) =>
  normalize(await upstream<StoredTask>(`/tasks/${idSchema.parse(id)}`));

function withCompletion(draft: StoredTask, previous?: StoredTask): StoredTask {
  return {
    ...draft,
    completedAt:
      draft.status === "Done"
        ? previous?.status === "Done"
          ? previous.completedAt || localDate()
          : localDate()
        : null,
  };
}
export function createTaskRecord(
  draft: Omit<StoredTask, "id"> & { id?: string },
) {
  return serialize(async () => {
    await validateProject(draft.projectId);
    const id = draft.id || `DQ-${randomUUID()}`;
    const existing = await listTasks();
    if (existing.some((task) => task.id === id))
      throw new ApiError(409, "Đã có công việc với mã này.");
    return upstream<StoredTask>("/tasks", {
      method: "POST",
      body: JSON.stringify(withCompletion({ ...draft, id })),
    });
  });
}
export function updateTaskRecord(
  id: string,
  patch: Partial<Omit<StoredTask, "id">>,
) {
  return serialize(async () => {
    const previous = await getTask(id);
    await validateProject(patch.projectId);
    const next = withCompletion({ ...previous, ...patch, id }, previous);
    return upstream<StoredTask>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(next),
    });
  });
}
export function deleteTaskRecord(id: string) {
  return serialize(async () => {
    await getTask(id);
    await upstream(`/tasks/${id}`, { method: "DELETE" });
  });
}
export function importTasks(drafts: StoredTask[]) {
  return serialize(async () => {
    for (const draft of drafts) await validateProject(draft.projectId);
    const existing = await listTasks();
    let imported = 0;
    let skipped = 0;
    for (const draft of drafts) {
      const normalized = {
        ...draft,
        completedAt:
          draft.status === "Done" ? draft.completedAt || localDate() : null,
      };
      const sameId = existing.find((task) => task.id === draft.id);
      const canonical = (task: StoredTask) =>
        JSON.stringify([
          task.title,
          task.description,
          task.status,
          task.priority,
          task.assignee,
          task.labels,
          task.due,
          task.points,
          task.completedAt || null,
          task.projectId || null,
        ]);
      if (sameId && canonical(sameId) === canonical(normalized)) {
        skipped++;
        continue;
      }
      const id = sameId
        ? `${draft.id.slice(0, 50)}-import-${createHash("sha256").update(canonical(normalized)).digest("hex").slice(0, 16)}`
        : draft.id;
      if (existing.some((task) => task.id === id)) {
        skipped++;
        continue;
      }
      const saved = await upstream<StoredTask>("/tasks", {
        method: "POST",
        body: JSON.stringify({ ...normalized, id }),
      });
      existing.push(saved);
      imported++;
    }
    return { tasks: existing, imported, skipped };
  });
}
