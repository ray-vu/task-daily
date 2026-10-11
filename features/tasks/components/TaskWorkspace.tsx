import { type RefObject } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import type { Task, Status, Section, View, TaskFilter } from "../types";
import { TaskBoard } from "./TaskBoard";
import { TaskList } from "./TaskList";
export function TaskWorkspace({
  section,
  visible,
  view,
  setView,
  query,
  setQuery,
  filter,
  setFilter,
  onCreate,
  onEdit,
  onMove,
  searchRef,
}: {
  section: string;
  visible: Task[];
  view: View;
  setView: (view: View) => void;
  query: string;
  setQuery: (query: string) => void;
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
  onCreate: (status: Status, labels: string[]) => void;
  onEdit: (task: Task) => void;
  onMove: (id: string, status: Status) => void;
  searchRef: RefObject<HTMLInputElement | null>;
}) {
  return (
    <section className="task-section">
      <div className="task-toolbar">
        <div className="task-heading">
          <h2>{section === "Tổng quan" ? "Công việc của bạn" : section}</h2>
          <span className="total-count">{visible.length}</span>
        </div>
        <div className="toolbar-tools">
          <div className="view-toggle">
            <button
              className={view === "board" ? "selected" : ""}
              onClick={() => setView("board")}
            >
              <LayoutGrid size={15} />
              Bảng
            </button>
            <button
              className={view === "list" ? "selected" : ""}
              onClick={() => setView("list")}
            >
              <List size={16} />
              Danh sách
            </button>
          </div>
        </div>
      </div>
      <div className="filter-toolbar">
        <label className="search">
          <Search size={16} />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm công việc..."
          />
          <kbd>⌘ K</kbd>
        </label>
        <div className="filter-actions">
          <select
            aria-label="Lọc công việc"
            value={filter}
            onChange={(e) => setFilter(e.target.value as TaskFilter)}
          >
            <option value="All tasks">Tất cả công việc</option>
            <option value="Assigned to me">Giao cho tôi</option>
            <option value="High priority">Ưu tiên cao</option>
          </select>
          <span className="filter-divider" />
          <span className="member-stack">
            <span className="avatar">RV</span>
            <span className="avatar alex">AL</span>
          </span>
          <span className="members-text">Cùng nhau tiến bộ</span>
        </div>
      </div>
      {view === "board" ? (
        <TaskBoard
          tasks={visible}
          onCreate={onCreate}
          onEdit={onEdit}
          onMove={onMove}
        />
      ) : (
        <TaskList tasks={visible} onEdit={onEdit} onMove={onMove} />
      )}
    </section>
  );
}
