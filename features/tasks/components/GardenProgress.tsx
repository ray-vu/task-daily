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
    <aside className="garden-panel" aria-label="Daily progress">
      <div className="garden-panel-heading">
        <span>
          <Sparkles size={16} /> YOUR DAILY GARDEN
        </span>
        <span className="garden-season">Keep growing</span>
      </div>
      <div className="garden-landscape">
        <GardenScene />
        <div className="garden-intro">
          <h2>Your quest is growing!</h2>
          <p>Every small win plants a little possibility.</p>
        </div>
        <div
          className="progress-ring"
          role="progressbar"
          aria-label="Daily task goal"
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
            <small>tasks today</small>
          </div>
        </div>
        <div className="garden-encouragement">
          <strong>
            {remaining === 0
              ? "A day in full bloom!"
              : "A little more sunshine."}
          </strong>
          <span>
            {remaining === 0
              ? "Your daily goal is complete."
              : `${remaining} more ${remaining === 1 ? "task" : "tasks"} to your daily goal.`}
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
            <small>XP earned</small>
          </div>
        </div>
        <div>
          <span className="streak-icon">
            <Flame size={23} fill="currentColor" />
          </span>
          <div>
            <strong>{streak}</strong>
            <small>day streak</small>
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
              ? "You earned a moment to celebrate."
              : "Progress grows with a little care."}
          </strong>
          <p>
            {remaining === 0
              ? "Take a breath. Enjoy your well-earned wins."
              : "Show up, take a small step, and let it bloom."}
          </p>
        </div>
      </div>
    </aside>
  );
}
