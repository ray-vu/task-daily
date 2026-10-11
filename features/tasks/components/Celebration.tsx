import { X, Zap } from "lucide-react";
import type { Task } from "../types";
export function Celebration({
  celebrate,
  completed,
  goal,
  onClose,
}: {
  celebrate: Task;
  completed: number;
  goal: number;
  onClose: () => void;
}) {
  return (
    <div className="celebration" role="status">
      <div className="confetti">
        {Array.from({ length: 28 }, (_, i) => (
          <i
            key={i}
            style={{
              left: `${i * 3.7}%`,
              background: ["#72b681", "#f3cd62", "#9ccdba", "#edaf91"][i % 4],
              animationDelay: `${(i % 7) * 0.08}s`,
              transform: `rotate(${i * 17}deg)`,
            }}
          />
        ))}
      </div>
      <button
        className="icon-button"
        aria-label="Đóng thông báo chúc mừng"
        onClick={onClose}
      >
        <X size={17} />
      </button>
      <span className="celebration-star">🌻</span>
      <h2>Một thành công nhỏ vừa đơm hoa!</h2>
      <p>Khu vườn của bạn vừa tươi sáng hơn.</p>
      <span className="reward-pill">
        <Zap size={16} fill="currentColor" /> +{celebrate.points} điểm
      </span>
      {completed >= goal && (
        <strong className="goal-complete">🏆 Đã đạt mục tiêu hôm nay!</strong>
      )}
    </div>
  );
}
