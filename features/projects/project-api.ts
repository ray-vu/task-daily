import { apiRequest } from "../api-client";
import type { Project, ProjectDraft } from "./types";
export const projectApi = {
  list: () => apiRequest<Project[]>("/api/projects"),
  create: (draft: ProjectDraft) =>
    apiRequest<Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify(draft),
    }),
  update: (project: Project) => {
    const { id, ...fields } = project;
    return apiRequest<Project>(`/api/projects/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(fields),
    });
  },
  delete: (id: string) =>
    apiRequest<void>(`/api/projects/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};
