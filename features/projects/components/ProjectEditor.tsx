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
            <small>A NEW PLACE TO GROW</small>
            <h2>{draft.id ? "Project details" : "Create a project"}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close project"
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
            Project name
            <input
              autoFocus
              required
              maxLength={100}
              value={draft.name}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
              placeholder="What are you growing next?"
            />
          </label>
          <label>
            Description
            <textarea
              rows={3}
              maxLength={5000}
              value={draft.description}
              onChange={(e) =>
                onChange({ ...draft, description: e.target.value })
              }
              placeholder="Give this project a little context..."
            />
          </label>
          <label>
            Project color
            <select
              value={draft.color}
              onChange={(e) =>
                onChange({
                  ...draft,
                  color: e.target.value as ProjectDraft["color"],
                })
              }
            >
              <option value="sage">Sage green</option>
              <option value="peach">Warm peach</option>
              <option value="yellow">Sunshine yellow</option>
              <option value="blue">Sky blue</option>
            </select>
          </label>
        </fieldset>
        {draft.id && (
          <p className="project-delete-note">
            Projects with tasks cannot be deleted. Move their tasks to another
            project or to the inbox first.
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
              Delete project
            </button>
          )}
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" disabled={pending} type="submit">
            <Check size={16} />
            {pending ? "Saving…" : "Save project"}
          </button>
        </div>
      </form>
    </div>
  );
}
