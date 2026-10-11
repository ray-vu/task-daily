import {
  Sprout,
  ChevronDown,
  LayoutDashboard,
  CheckCheck,
  CalendarDays,
  Circle,
  Plus,
  Settings,
} from "lucide-react";
import type { Project } from "../../projects/types";
import type { Task, Section } from "../types";
export function Sidebar({
  tasks,
  section,
  setSection,
  level,
  xp,
  onSettings,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  disabled,
}: {
  tasks: Task[];
  section: Section;
  setSection: (section: Section) => void;
  level: number;
  xp: number;
  onSettings: () => void;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  disabled: boolean;
}) {
  return (
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="Daily Quest home">
        <span className="brand-icon">
          <Sprout size={26} strokeWidth={2.3} />
        </span>
        Daily<span>Quest</span>
      </a>
      <div className="workspace">
        <span className="workspace-icon">
          <Sprout size={19} />
        </span>
        <div>
          <strong>Quest Garden</strong>
          <small>Your space to grow</small>
        </div>
        <ChevronDown size={15} />
      </div>
      <div className="nav-label">WORKSPACE</div>
      <nav>
        {(
          [
            { name: "Overview", icon: LayoutDashboard },
            { name: "My tasks", icon: CheckCheck },
            { name: "Today", icon: CalendarDays },
            { name: "Completed", icon: Circle },
          ] satisfies { name: Section; icon: typeof LayoutDashboard }[]
        ).map(({ name, icon: Icon }) => (
          <button
            key={name}
            className={`nav-item ${section === name ? "active" : ""}`}
            onClick={() => setSection(name)}
          >
            <Icon size={18} />
            {name}
            {name === "My tasks" && (
              <span className="nav-count">
                {tasks.filter((t) => t.status !== "Done").length}
              </span>
            )}
            {name === "Today" && <span className="today-dot" />}
          </button>
        ))}
      </nav>
      <div className="project-navigation">
        <div className="nav-label project-label">
          PROJECTS{" "}
          <button
            className="icon-button"
            aria-label="Create project"
            onClick={onCreateProject}
            disabled={disabled}
          >
            <Plus size={15} />
          </button>
        </div>
        {projects.map((project) => (
          <button
            key={project.id}
            aria-label={`Open project ${project.name}`}
            title={project.name}
            className={`nav-item ${activeProjectId === project.id ? "active" : ""}`}
            onClick={() => onSelectProject(project.id)}
          >
            <span className={`project-dot project-${project.color}`} />
            <span className="project-name">{project.name}</span>
            <span className="project-number">
              {tasks.filter((task) => task.projectId === project.id).length}
            </span>
          </button>
        ))}
        {projects.length === 0 && (
          <button
            className="nav-item first-project"
            onClick={onCreateProject}
            disabled={disabled}
          >
            <Plus size={15} /> Plant your first project
          </button>
        )}
      </div>
      <div className="sidebar-bottom">
        <div className="level-card">
          <span className="level-star">✦</span>
          <div>
            <strong>Level {level} gardener</strong>
            <small>{200 - (xp % 200)} XP to your next level</small>
          </div>
          <div className="level-bar">
            <i style={{ width: `${(xp % 200) / 2}%` }} />
          </div>
        </div>
        <button className="nav-item" onClick={onSettings}>
          <Settings size={18} />
          Settings
        </button>
        <div className="profile">
          <span className="avatar profile-avatar">RV</span>
          <div>
            <strong>Raymond Vu</strong>
            <small>Growing at your own pace</small>
          </div>
          <ChevronDown size={14} />
        </div>
      </div>
    </aside>
  );
}
