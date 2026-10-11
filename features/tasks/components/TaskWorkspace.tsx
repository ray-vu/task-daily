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
          <h2>{section === "Overview" ? "Your tasks" : section}</h2>
          <span className="total-count">{visible.length}</span>
        </div>
        <div className="toolbar-tools">
          <div className="view-toggle">
            <button
              className={view === "board" ? "selected" : ""}
              onClick={() => setView("board")}
            >
              <LayoutGrid size={15} />
              Board
            </button>
            <button
              className={view === "list" ? "selected" : ""}
              onClick={() => setView("list")}
            >
              <List size={16} />
              List
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
            placeholder="Search your tasks..."
          />
          <kbd>⌘ K</kbd>
        </label>
        <div className="filter-actions">
          <select
            aria-label="Filter tasks"
            value={filter}
            onChange={(e) => setFilter(e.target.value as TaskFilter)}
          >
            <option>All tasks</option>
            <option>Assigned to me</option>
            <option>High priority</option>
          </select>
          <span className="filter-divider" />
          <span className="member-stack">
            <span className="avatar">RV</span>
            <span className="avatar alex">AL</span>
          </span>
          <span className="members-text">Just us, making progress</span>
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
