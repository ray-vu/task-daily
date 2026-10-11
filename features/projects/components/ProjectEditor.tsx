import { Check, Folder, X } from "lucide-react";
import type { ProjectDraft } from "../types";
export function ProjectEditor({
  draft,
  onChange,
  onSave,
  onDelete,
  onClose,
  pending,
  error,
}: {
  draft: ProjectDraft;
  onChange: (draft: ProjectDraft) => void;
  onSave: (draft: ProjectDraft) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="task-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSave(draft);
        }}
      >
        <div className="modal-header">
          <div>
            <small>KHÔNG GIAN MỚI ĐỂ VUN TRỒNG</small>
            <h2>{draft.id ? "Chi tiết dự án" : "Tạo dự án"}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Đóng dự án"
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
            Tên dự án
            <input
              autoFocus
              required
              maxLength={100}
              value={draft.name}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
              placeholder="Bạn muốn bắt đầu dự án gì?"
            />
          </label>
          <label>
            Mô tả
            <textarea
              rows={3}
              maxLength={5000}
              value={draft.description}
              onChange={(e) =>
                onChange({ ...draft, description: e.target.value })
              }
              placeholder="Thêm mô tả cho dự án..."
            />
          </label>
          <label>
            Màu dự án
            <select
              value={draft.color}
              onChange={(e) =>
                onChange({
                  ...draft,
                  color: e.target.value as ProjectDraft["color"],
                })
              }
            >
              <option value="sage">Xanh lá dịu</option>
              <option value="peach">Cam đào</option>
              <option value="yellow">Vàng nắng</option>
              <option value="blue">Xanh da trời</option>
            </select>
          </label>
        </fieldset>
        {draft.id && (
          <p className="project-delete-note">
            Không thể xóa dự án còn công việc. Hãy chuyển công việc sang dự án
            khác hoặc mục chưa phân loại trước.
          </p>
        )}
        <div className="modal-footer">
          {draft.id && (
            <button
              disabled={pending}
              className="delete-button"
              type="button"
              onClick={() => onDelete(draft.id!)}
            >
              Xóa dự án
            </button>
          )}
          <button type="button" className="secondary-button" onClick={onClose}>
            Hủy
          </button>
          <button className="primary-button" disabled={pending} type="submit">
            <Check size={16} />
            {pending ? "Đang lưu…" : "Lưu dự án"}
          </button>
        </div>
      </form>
    </div>
  );
}
