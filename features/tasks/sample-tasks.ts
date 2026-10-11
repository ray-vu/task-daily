import type { Task } from "./types";
import { today } from "./task-model";
export function createSampleTasks(): Task[] {
  return [
    {
      id: "DQ-101",
      projectId: null,
      title: "Design the onboarding experience",
      description:
        "Map the first-run journey and create a welcoming experience for new users. Include wireframes and key interaction states.",
      status: "In progress",
      priority: "High",
      assignee: "You",
      labels: ["Design", "Product"],
      due: today(),
      points: 40,
    },
    {
      id: "DQ-102",
      projectId: null,
      title: "Explore dashboard inspiration",
      description:
        "Collect a few thoughtful references for our next dashboard iteration.",
      status: "To do",
      priority: "Medium",
      assignee: "You",
      labels: ["Design"],
      due: today(),
      points: 20,
    },
    {
      id: "DQ-103",
      projectId: null,
      title: "Write the product brief",
      description:
        "Outline the problem, audience, desired outcomes and scope for the next release.",
      status: "To do",
      priority: "High",
      assignee: "Alex",
      labels: ["Product"],
      due: today(),
      points: 30,
    },
    {
      id: "DQ-104",
      projectId: null,
      title: "Review component library",
      description:
        "Audit shared components for consistency, accessibility and reusable patterns.",
      status: "In progress",
      priority: "Medium",
      assignee: "You",
      labels: ["Development"],
      due: today(),
      points: 30,
    },
    {
      id: "DQ-105",
      projectId: null,
      title: "Plan next week’s priorities",
      description:
        "Make room for the work that matters. Pick three meaningful priorities.",
      status: "To do",
      priority: "Low",
      assignee: "You",
      labels: ["Planning"],
      due: "",
      points: 20,
    },
    {
      id: "DQ-106",
      projectId: null,
      title: "Clean up the workspace",
      description:
        "A clear space for a clear mind. Archive old notes and organize current files.",
      status: "Done",
      priority: "Low",
      assignee: "You",
      labels: ["Personal"],
      due: today(),
      points: 10,
      completedAt: today(),
    },
    {
      id: "DQ-107",
      projectId: null,
      title: "Morning reading session",
      description: "Spend 15 minutes learning something new.",
      status: "Done",
      priority: "Medium",
      assignee: "You",
      labels: ["Personal"],
      due: today(),
      points: 20,
      completedAt: today(),
    },
  ];
}
