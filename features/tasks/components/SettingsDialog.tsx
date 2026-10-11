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
          <h2>Phát triển theo nhịp của bạn</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Đóng cài đặt"
          >
            <X size={20} />
          </button>
        </div>
        <p>Chăm sóc khu vườn mỗi ngày. Chọn mục tiêu phù hợp với bạn.</p>
        <label>
          Mục tiêu công việc mỗi ngày
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
          Công việc được lưu trên máy chủ. Mục tiêu mỗi ngày được lưu trong
          trình duyệt này.
        </p>
        <button className="primary-button" onClick={onClose}>
          Xong <Check size={16} />
        </button>
      </div>
    </div>
  );
}
