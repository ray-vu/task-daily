import { priorityLabels, labelText, assigneeText } from "../text";
import {
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  CalendarDays,
  Zap,
  Check,
} from "lucide-react";
import { labelColors, today } from "../task-model";
import type { Task, Status } from "../types";
export function TaskCard({
  task,
  onEdit,
  onMove,
  onDrag,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onMove: (id: string, status: Status) => void;
  onDrag: (id: string | null) => void;
}) {
  return (
    <article
      className={`task-card ${task.status === "Done" ? "finished" : ""}`}
      draggable
      onDragStart={() => onDrag(task.id)}
      onDragEnd={() => onDrag(null)}
      onClick={() => onEdit(task)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onEdit(task);
      }}
    >
      <div className="card-top">
        <span className="task-id">{task.id}</span>
        <button
          className="icon-button"
          aria-label={`Chỉnh sửa ${task.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
      <h3>{task.title}</h3>
      <div className="tags">
        {task.labels.map((label) => (
          <span
            key={labelText(label)}
            className={`tag ${labelColors[label] || "purple"}`}
          >
            {labelText(label)}
          </span>
        ))}
      </div>
      <div className="card-meta">
        <span className={`priority ${task.priority.toLowerCase()}`}>
          {task.priority === "High" ? (
            <ArrowUp size={13} />
          ) : task.priority === "Low" ? (
            <ArrowDown size={13} />
          ) : (
            <span className="medium-mark">=</span>
          )}
          {priorityLabels[task.priority]}
        </span>
        {task.due && (
          <span className="due">
            <CalendarDays size={12} />
            {task.due === today()
              ? "Hôm nay"
              : new Date(task.due + "T12:00:00").toLocaleDateString("vi-VN", {
                  month: "short",
                  day: "numeric",
                })}
          </span>
        )}
      </div>
      <div className="card-footer">
        <span
          className={`avatar ${task.assignee === "Alex" ? "alex" : ""}`}
          title={assigneeText(task.assignee)}
        >
          {task.assignee === "You"
            ? "RV"
            : task.assignee.slice(0, 2).toUpperCase()}
        </span>
        <span className="task-xp">
          <Zap size={12} /> {task.points} điểm
        </span>
        <button
          className={`complete-button ${task.status === "Done" ? "checked" : ""}`}
          title={
            task.status === "Done" ? "Mở lại công việc" : "Hoàn thành công việc"
          }
          aria-label={
            task.status === "Done" ? "Mở lại công việc" : "Hoàn thành công việc"
          }
          onClick={(e) => {
            e.stopPropagation();
            onMove(task.id, task.status === "Done" ? "To do" : "Done");
          }}
        >
          <Check size={14} />
        </button>
      </div>
    </article>
  );
}
