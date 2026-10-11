import type { Section, Status, Task } from "./types";

export const sectionLabels: Record<Section, string> = {
  Overview: "Tổng quan",
  "My tasks": "Công việc của tôi",
  Today: "Hôm nay",
  Completed: "Đã hoàn thành",
  "Product launch": "Ra mắt sản phẩm",
  Personal: "Cá nhân",
  Project: "Dự án",
};
export const statusLabels: Record<Status, string> = {
  "To do": "Cần làm",
  "In progress": "Đang làm",
  Done: "Hoàn thành",
};
export const priorityLabels: Record<Task["priority"], string> = {
  High: "Cao",
  Medium: "Trung bình",
  Low: "Thấp",
};
const labels: Record<string, string> = {
  Design: "Thiết kế",
  Product: "Sản phẩm",
  Development: "Phát triển",
  Planning: "Lập kế hoạch",
  Personal: "Cá nhân",
};
export const labelText = (label: string) => labels[label] || label;
export const labelValue = (label: string) =>
  Object.keys(labels).find((key) => labels[key] === label) || label;
export const assigneeText = (assignee: string) =>
  assignee === "You" ? "Bạn" : assignee;
