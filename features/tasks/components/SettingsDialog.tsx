import { X, Check } from "lucide-react";
export function SettingsDialog({
  goal,
  setGoal,
  onClose,
}: {
  goal: number;
  setGoal: (goal: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="task-modal settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Grow at your own pace</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>
        <p>
          Give your garden a little care each day. Choose a goal that feels
          right for you.
        </p>
        <label>
          Daily task goal
          <input
            type="number"
            min={1}
            max={30}
            value={goal}
            onChange={(e) =>
              setGoal(Math.max(1, Math.min(30, Number(e.target.value) || 1)))
            }
          />
        </label>
        <p className="settings-note">
          Tasks are saved on the server. Your daily goal is saved in this
          browser.
        </p>
        <button className="primary-button" onClick={onClose}>
          All set <Check size={16} />
        </button>
      </div>
    </div>
  );
}
