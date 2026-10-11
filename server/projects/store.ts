import { randomUUID } from "node:crypto";
import { upstream, serialize } from "../json-server";
import { ApiError } from "../tasks/http";
import { idSchema } from "../tasks/validation";
import type { Project, ProjectDraft } from "../../features/projects/types";
import type { Task } from "../../features/tasks/types";
export const listProjects = () => upstream<Project[]>("/projects");
export const getProject = (id: string) =>
  upstream<Project>(`/projects/${idSchema.parse(id)}`);
export function createProject(draft: ProjectDraft) {
  return serialize(async () => {
    const id = draft.id || `PR-${randomUUID()}`;
    if ((await listProjects()).some((project) => project.id === id))
      throw new ApiError(409, "A project with this ID already exists.");
    return upstream<Project>("/projects", {
      method: "POST",
      body: JSON.stringify({ ...draft, id }),
    });
  });
}
export function updateProject(id: string, patch: Partial<Omit<Project, "id">>) {
  return serialize(async () => {
    const previous = await getProject(id);
    return upstream<Project>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...previous, ...patch, id }),
    });
  });
}
export function deleteProject(id: string) {
  return serialize(async () => {
    await getProject(id);
    const tasks = await upstream<Task[]>("/tasks");
    if (tasks.some((task) => task.projectId === id))
      throw new ApiError(
        409,
        "Move or delete this project’s tasks before deleting the project.",
      );
    await upstream(`/projects/${id}`, { method: "DELETE" });
  });
}
