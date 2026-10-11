import { Flame, Sparkles, Trophy, Zap } from "lucide-react";
import { GardenScene } from "./GardenScene";

export function GardenProgress({
  completed,
  goal,
  streak,
  xp,
}: {
  completed: number;
  goal: number;
  streak: number;
  xp: number;
}) {
  const percentage = Math.min(1, completed / goal);
  const remaining = Math.max(0, goal - completed);
  return (
    <aside className="garden-panel" aria-label="Tiến độ hôm nay">
      <div className="garden-panel-heading">
        <span>
          <Sparkles size={16} /> KHU VƯỜN MỖI NGÀY
        </span>
        <span className="garden-season">Tiếp tục vun trồng</span>
      </div>
      <div className="garden-landscape">
        <GardenScene />
        <div className="garden-intro">
          <h2>Khu vườn của bạn đang lớn lên!</h2>
          <p>Mỗi việc hoàn thành gieo thêm một cơ hội.</p>
        </div>
        <div
          className="progress-ring"
          role="progressbar"
          aria-label="Mục tiêu công việc mỗi ngày"
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={Math.min(completed, goal)}
        >
          <svg viewBox="0 0 112 112" aria-hidden="true">
            <circle cx="56" cy="56" r="47" className="ring-track" />
            <circle
              cx="56"
              cy="56"
              r="47"
              className="ring-fill"
              pathLength="100"
              strokeDasharray={`${percentage * 100} 100`}
            />
          </svg>
          <div>
            <strong>
              {completed}
              <span>/{goal}</span>
            </strong>
            <small>việc hôm nay</small>
          </div>
        </div>
        <div className="garden-encouragement">
          <strong>
            {remaining === 0 ? "Một ngày trọn vẹn!" : "Thêm một chút nắng nữa."}
          </strong>
          <span>
            {remaining === 0
              ? "Bạn đã đạt mục tiêu hôm nay."
              : `Còn ${remaining} công việc để đạt mục tiêu hôm nay.`}
          </span>
        </div>
      </div>
      <div className="garden-rewards">
        <div>
          <span className="reward-icon">
            <Zap size={20} fill="currentColor" />
          </span>
          <div>
            <strong>{xp}</strong>
            <small>điểm kinh nghiệm</small>
          </div>
        </div>
        <div>
          <span className="streak-icon">
            <Flame size={23} fill="currentColor" />
          </span>
          <div>
            <strong>{streak}</strong>
            <small>ngày liên tiếp</small>
          </div>
        </div>
      </div>
      <div className="garden-note">
        <span className="note-icon">
          <Trophy size={19} />
        </span>
        <div>
          <strong>
            {remaining === 0
              ? "Bạn xứng đáng được ăn mừng."
              : "Tiến bộ từ những điều nhỏ mỗi ngày."}
          </strong>
          <p>
            {remaining === 0
              ? "Nghỉ một chút và tận hưởng thành quả của bạn."
              : "Bắt đầu bằng một bước nhỏ để thành quả đơm hoa."}
          </p>
        </div>
      </div>
    </aside>
  );
}
