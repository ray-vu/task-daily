import { projectCreate, projectFields } from "../../shared/validation/projects";
import { idSchema } from "../../shared/validation/tasks";
import { validateInput } from "../../shared/validation/client";
import { apiRequest } from "../api-client";
import type { Project, ProjectDraft } from "./types";
export const projectApi = {
  list: () => apiRequest<Project[]>("/api/projects"),
  create: (draft: ProjectDraft) =>
    apiRequest<Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify(validateInput(projectCreate, draft)),
    }),
  update: (project: Project) => {
    const { id, ...fields } = project;
    return apiRequest<Project>(
      `/api/projects/${encodeURIComponent(validateInput(idSchema, id))}`,
      {
        method: "PUT",
        body: JSON.stringify(validateInput(projectFields, fields)),
      },
    );
  },
  delete: (id: string) =>
    apiRequest<void>(
      `/api/projects/${encodeURIComponent(validateInput(idSchema, id))}`,
      {
        method: "DELETE",
      },
    ),
};
