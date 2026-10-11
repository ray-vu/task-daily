import type { Task, Status, Section, TaskFilter } from "./types";
export const today = () => new Date().toLocaleDateString("en-CA");
export const labelColors: Record<string, string> = {
  Design: "purple",
  Product: "blue",
  Development: "green",
  Planning: "orange",
  Personal: "pink",
};

export function createTask(
  status: Status = "To do",
  labels: string[] = ["Design"],
): Task {
  return {
    id: `DQ-${crypto.randomUUID()}`,
    projectId: null,
    title: "",
    description: "",
    status,
    priority: "Medium",
    assignee: "You",
    labels,
    due: today(),
    points: 20,
  };
}
export function getProgress(tasks: Task[], date = new Date()) {
  const dateKey = date.toLocaleDateString("en-CA");
  const done = tasks.filter((task) => task.status === "Done");
  const completed = done.filter((task) => task.completedAt === dateKey).length;
  const xp = done.reduce((sum, task) => sum + task.points, 0);
  const dates = new Set(done.map((task) => task.completedAt));
  const cursor = new Date(date);
  let streak = 0;
  if (!dates.has(dateKey)) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(cursor.toLocaleDateString("en-CA"))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { completed, xp, level: Math.floor(xp / 200) + 1, streak };
}
export function filterTasks(
  tasks: Task[],
  query: string,
  filter: TaskFilter,
  section: Section,
) {
  return tasks.filter((task) => {
    const matchesQuery =
      `${task.title} ${task.description} ${task.labels.join(" ")} ${task.id}`
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesFilter =
      filter === "All tasks" ||
      (filter === "Assigned to me" && task.assignee === "You") ||
      (filter === "High priority" && task.priority === "High");
    const matchesSection =
      (section !== "Today" || task.due === today()) &&
      (section !== "Completed" || task.status === "Done") &&
      (section !== "Personal" || task.labels.includes("Personal")) &&
      (section !== "Product launch" || !task.labels.includes("Personal"));
    return matchesQuery && matchesFilter && matchesSection;
  });
}
