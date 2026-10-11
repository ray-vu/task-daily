import { Check } from "lucide-react";
import type { Task, Status } from "../types";
import { labelColors } from "../task-model";
export function TaskList({
  tasks,
  onEdit,
  onMove,
}: {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onMove: (id: string, status: Status) => void;
}) {
  return (
    <div className="list-view">
      {tasks.map((task) => (
        <div className="list-row" key={task.id}>
          <button
            className={`complete-button ${task.status === "Done" ? "checked" : ""}`}
            onClick={() =>
              onMove(task.id, task.status === "Done" ? "To do" : "Done")
            }
            aria-label="Toggle completed"
          >
            <Check size={14} />
          </button>
          <button className="list-task-title" onClick={() => onEdit(task)}>
            <small>{task.id}</small>
            <strong>{task.title}</strong>
          </button>
          <span className={`tag ${labelColors[task.labels[0]] || "purple"}`}>
            {task.labels[0]}
          </span>
          <select
            aria-label={`Status of ${task.title}`}
            value={task.status}
            onChange={(e) => onMove(task.id, e.target.value as Status)}
          >
            <option>To do</option>
            <option>In progress</option>
            <option>Done</option>
          </select>
          <span className={`priority ${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
          <span className="task-xp">{task.points} XP</span>
        </div>
      ))}
      {tasks.length === 0 && (
        <div className="empty-state">
          A little space for something new. Plant your next task.
        </div>
      )}
    </div>
  );
}
