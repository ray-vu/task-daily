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
        aria-label="Dismiss celebration"
        onClick={onClose}
      >
        <X size={17} />
      </button>
      <span className="celebration-star">🌻</span>
      <h2>A little win in bloom!</h2>
      <p>Your garden just got a little brighter.</p>
      <span className="reward-pill">
        <Zap size={16} fill="currentColor" /> +{celebrate.points} XP
      </span>
      {completed >= goal && (
        <strong className="goal-complete">🏆 Daily goal achieved!</strong>
      )}
    </div>
  );
}
