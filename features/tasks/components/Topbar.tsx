import { ChevronRight, Flame, Bell } from "lucide-react";
export function Topbar({
  section,
  streak,
  completed,
  notice,
  onToggleNotice,
}: {
  section: string;
  streak: number;
  completed: number;
  notice: boolean;
  onToggleNotice: () => void;
}) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        Quest Garden <ChevronRight size={14} />
        <span>{section}</span>
      </div>
      <div className="topbar-actions">
        <span className="header-streak">
          <Flame size={15} fill="currentColor" /> {streak} day streak
        </span>
        <button
          className="icon-button notification-button"
          aria-label="Notifications"
          onClick={onToggleNotice}
        >
          <Bell size={19} />
          <i />
        </button>
        <span className="avatar">RV</span>
      </div>
      {notice && (
        <div className="notification-popover">
          <strong>A little progress is blooming 🌱</strong>
          <p>
            {completed} tasks completed today. Your garden grows with every
            small win.
          </p>
        </div>
      )}
    </header>
  );
}
