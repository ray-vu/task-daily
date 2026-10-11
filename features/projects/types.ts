export type Project = {
  id: string;
  name: string;
  description: string;
  color: "sage" | "peach" | "yellow" | "blue";
};
export type ProjectDraft = Omit<Project, "id"> & { id?: string };
