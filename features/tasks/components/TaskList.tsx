import { priorityLabels, labelText } from "../text";
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
            aria-label="Đổi trạng thái hoàn thành"
          >
            <Check size={14} />
          </button>
          <button className="list-task-title" onClick={() => onEdit(task)}>
            <small>{task.id}</small>
            <strong>{task.title}</strong>
          </button>
          <span className={`tag ${labelColors[task.labels[0]] || "purple"}`}>
            {labelText(task.labels[0] || "")}
          </span>
          <select
            aria-label={`Trạng thái của ${task.title}`}
            value={task.status}
            onChange={(e) => onMove(task.id, e.target.value as Status)}
          >
            <option value="To do">Cần làm</option>
            <option value="In progress">Đang làm</option>
            <option value="Done">Hoàn thành</option>
          </select>
          <span className={`priority ${task.priority.toLowerCase()}`}>
            {priorityLabels[task.priority]}
          </span>
          <span className="task-xp">{task.points} điểm</span>
        </div>
      ))}
      {tasks.length === 0 && (
        <div className="empty-state">
          Chưa có công việc. Hãy tạo công việc tiếp theo.
        </div>
      )}
    </div>
  );
}
