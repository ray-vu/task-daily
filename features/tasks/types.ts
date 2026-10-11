export type Status = "To do" | "In progress" | "Done";
export type Task = {
  id: string;
  projectId: string | null;
  title: string;
  description: string;
  status: Status;
  priority: "High" | "Medium" | "Low";
  assignee: string;
  labels: string[];
  due: string;
  points: number;
  completedAt?: string | null;
};

export type View = "board" | "list";
export type TaskFilter = "All tasks" | "Assigned to me" | "High priority";
export type Section =
  | "Overview"
  | "My tasks"
  | "Today"
  | "Completed"
  | "Product launch"
  | "Personal"
  | "Project";
