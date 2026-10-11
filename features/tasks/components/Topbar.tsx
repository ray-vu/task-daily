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
        Vườn nhiệm vụ <ChevronRight size={14} />
        <span>{section}</span>
      </div>
      <div className="topbar-actions">
        <span className="header-streak">
          <Flame size={15} fill="currentColor" /> {streak} ngày liên tiếp
        </span>
        <button
          className="icon-button notification-button"
          aria-label="Thông báo"
          onClick={onToggleNotice}
        >
          <Bell size={19} />
          <i />
        </button>
        <span className="avatar">RV</span>
      </div>
      {notice && (
        <div className="notification-popover">
          <strong>Mỗi bước tiến đều đang nảy mầm 🌱</strong>
          <p>
            Hôm nay bạn đã hoàn thành {completed} công việc. Mỗi bước tiến đều
            giúp khu vườn lớn lên.
          </p>
        </div>
      )}
    </header>
  );
}
