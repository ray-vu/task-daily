import { statusLabels } from "../text";
import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import type { Task, Status } from "../types";
import { TaskCard } from "./TaskCard";
export function TaskBoard({
  tasks,
  onCreate,
  onEdit,
  onMove,
}: {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onMove: (id: string, status: Status) => void;
  onCreate: (status: Status, labels: string[]) => void;
}) {
  const [drag, setDrag] = useState<string | null>(null);
  return (
    <div className="board">
      {(["To do", "In progress", "Done"] as Status[]).map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);
        return (
          <section
            key={statusLabels[status]}
            className={`board-column ${status.replaceAll(" ", "-").toLowerCase()}-column`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (drag) onMove(drag, status);
              setDrag(null);
            }}
          >
            <div className="column-heading">
              <span
                className={`status-dot ${status.replaceAll(" ", "-").toLowerCase()}`}
              />
              <h3>{statusLabels[status]}</h3>
              <span className="column-count">{columnTasks.length}</span>
              <button
                className="icon-button"
                aria-label={`Thêm công việc: ${statusLabels[status]}`}
                onClick={() => onCreate(status, [])}
              >
                <Plus size={17} />
              </button>
            </div>
            <div className="column-cards">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onMove={onMove}
                  onDrag={setDrag}
                />
              ))}
              <button className="add-task" onClick={() => onCreate(status, [])}>
                <Plus size={15} /> Thêm công việc
              </button>
            </div>
            {status === "Done" && (
              <div className="done-message">
                <Sparkles size={17} />
                <span>Mỗi việc hoàn thành giúp khu vườn lớn lên.</span>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
