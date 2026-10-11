import { X, Check } from "lucide-react";
import type { Project } from "../../projects/types";
import type { Task, Status } from "../types";
export function TaskEditor({
  editing,
  setEditing,
  isExisting,
  onSave,
  onDelete,
  onClose,
  pending,
  error,
  projects,
}: {
  editing: Task;
  setEditing: (task: Task) => void;
  isExisting: boolean;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  pending: boolean;
  error: string | null;
  projects: Project[];
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="task-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSave(editing);
        }}
      >
        <div className="modal-header">
          <div>
            <small>
              {isExisting ? editing.id : "PLANT YOUR NEXT LITTLE WIN"}
            </small>
            <h2>{isExisting ? "Task details" : "Create a task"}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        {error && (
          <div className="sync-error editor-error" role="alert">
            {error}
          </div>
        )}
        <fieldset className="editor-fields" disabled={pending}>
          <label>
            Project
            <select
              aria-label="Task project"
              value={editing.projectId || ""}
              onChange={(e) =>
                setEditing({ ...editing, projectId: e.target.value || null })
              }
            >
              <option value="">Inbox — no project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input
              autoFocus
              required
              value={editing.title}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
              placeholder="What’s your next small win?"
            />
          </label>
          <label>
            Description
            <textarea
              rows={3}
              value={editing.description}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              placeholder="Add context, ideas, or a few next steps..."
            />
          </label>
          <div className="form-grid">
            <label>
              Status
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as Status })
                }
              >
                <option>To do</option>
                <option>In progress</option>
                <option>Done</option>
              </select>
            </label>
            <label>
              Priority
              <select
                value={editing.priority}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    priority: e.target.value as Task["priority"],
                  })
                }
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label>
              Assignee
              <input
                value={editing.assignee}
                onChange={(e) =>
                  setEditing({ ...editing, assignee: e.target.value })
                }
              />
            </label>
            <label>
              Deadline
              <input
                type="date"
                value={editing.due}
                onChange={(e) =>
                  setEditing({ ...editing, due: e.target.value })
                }
              />
            </label>
            <label>
              Labels
              <input
                value={editing.labels.join(", ")}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    labels: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                placeholder="Design, Product"
              />
            </label>
            <label>
              Reward XP
              <input
                type="number"
                min={5}
                max={200}
                step={5}
                value={editing.points}
                onChange={(e) =>
                  setEditing({ ...editing, points: Number(e.target.value) })
                }
              />
            </label>
          </div>
        </fieldset>
        <div className="modal-footer">
          {isExisting && (
            <button
              type="button"
              className="delete-button"
              disabled={pending}
              onClick={() => onDelete(editing.id)}
            >
              Delete task
            </button>
          )}
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={pending}>
            <Check size={16} /> {pending ? "Saving…" : "Save task"}
          </button>
        </div>
      </form>
    </div>
  );
}
