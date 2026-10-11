import { assigneeText, labelText, labelValue } from "../text";
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
              {isExisting ? editing.id : "GIEO MẦM CHO THÀNH CÔNG TIẾP THEO"}
            </small>
            <h2>{isExisting ? "Chi tiết công việc" : "Tạo công việc"}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Đóng"
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
            Dự án
            <select
              aria-label="Dự án của công việc"
              value={editing.projectId || ""}
              onChange={(e) =>
                setEditing({ ...editing, projectId: e.target.value || null })
              }
            >
              <option value="">Chưa phân loại — không thuộc dự án</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tiêu đề
            <input
              autoFocus
              required
              maxLength={200}
              value={editing.title}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
              placeholder="Bạn muốn hoàn thành việc gì tiếp theo?"
            />
          </label>
          <label>
            Mô tả
            <textarea
              rows={3}
              maxLength={10000}
              value={editing.description}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              placeholder="Thêm mô tả, ý tưởng hoặc các bước tiếp theo..."
            />
          </label>
          <div className="form-grid">
            <label>
              Trạng thái
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as Status })
                }
              >
                <option value="To do">Cần làm</option>
                <option value="In progress">Đang làm</option>
                <option value="Done">Hoàn thành</option>
              </select>
            </label>
            <label>
              Độ ưu tiên
              <select
                value={editing.priority}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    priority: e.target.value as Task["priority"],
                  })
                }
              >
                <option value="High">Cao</option>
                <option value="Medium">Trung bình</option>
                <option value="Low">Thấp</option>
              </select>
            </label>
            <label>
              Người phụ trách
              <input
                required
                maxLength={100}
                value={assigneeText(editing.assignee)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    assignee: e.target.value === "Bạn" ? "You" : e.target.value,
                  })
                }
              />
            </label>
            <label>
              Hạn hoàn thành
              <input
                type="date"
                value={editing.due}
                onChange={(e) =>
                  setEditing({ ...editing, due: e.target.value })
                }
              />
            </label>
            <label>
              Nhãn
              <input
                value={editing.labels.map(labelText).join(", ")}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    labels: e.target.value
                      .split(",")
                      .map((s) => labelValue(s.trim())),
                  })
                }
                placeholder="Thiết kế, Sản phẩm"
              />
            </label>
            <label>
              Điểm thưởng
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
              Xóa công việc
            </button>
          )}
          <button type="button" className="secondary-button" onClick={onClose}>
            Hủy
          </button>
          <button className="primary-button" type="submit" disabled={pending}>
            <Check size={16} /> {pending ? "Đang lưu…" : "Lưu công việc"}
          </button>
        </div>
      </form>
    </div>
  );
}
