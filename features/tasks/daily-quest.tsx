"use client";
import { sectionLabels } from "./text";
import { useTaskWorkspace } from "./use-task-workspace";
import { ProjectEditor } from "../projects/components/ProjectEditor";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { GardenProgress } from "./components/GardenProgress";
import { WorkspaceHeading } from "./components/WorkspaceHeading";
import { TaskWorkspace } from "./components/TaskWorkspace";
import { TaskEditor } from "./components/TaskEditor";
import { SettingsDialog } from "./components/SettingsDialog";
import { TaskSyncNotice } from "./components/TaskSyncNotice";
import { Celebration } from "./components/Celebration";

export function DailyQuest() {
  const workspace = useTaskWorkspace();
  const { tasks, section, goal, progress, editing, celebrate } = workspace;
  return (
    <div className="app-shell">
      <Sidebar
        projects={workspace.projects}
        activeProjectId={workspace.activeProjectId}
        onSelectProject={workspace.selectProject}
        onCreateProject={workspace.startProject}
        disabled={workspace.busy}
        tasks={tasks}
        section={section}
        setSection={workspace.setSection}
        level={progress.level}
        xp={progress.xp}
        onSettings={() => workspace.setSettings(true)}
      />
      <div className="main-shell">
        <Topbar
          section={workspace.activeProject?.name || sectionLabels[section]}
          streak={progress.streak}
          completed={progress.completed}
          notice={workspace.notice}
          onToggleNotice={() => workspace.setNotice(!workspace.notice)}
        />
        <main>
          <WorkspaceHeading
            disabled={workspace.busy}
            section={section}
            onCreate={() => workspace.startTask()}
          />
          {workspace.activeProject && (
            <div className="project-summary">
              <div>
                <strong>{workspace.activeProject.name}</strong>
                {workspace.activeProject.description && (
                  <p>{workspace.activeProject.description}</p>
                )}
              </div>
              <button
                className="secondary-button"
                disabled={workspace.busy}
                onClick={() =>
                  workspace.setProjectEditing(workspace.activeProject!)
                }
              >
                Quản lý dự án
              </button>
            </div>
          )}
          <TaskSyncNotice
            loading={workspace.loading}
            pending={workspace.pending}
            error={workspace.error}
            loadFailed={workspace.loadFailed}
            legacyCount={workspace.legacy.length}
            message={workspace.message}
            onRefresh={() => void workspace.refresh()}
            onImport={() => void workspace.importLegacy()}
          />
          <div
            className="garden-workspace"
            aria-busy={workspace.loading || workspace.pending}
          >
            <fieldset className="workspace-controls" disabled={workspace.busy}>
              <TaskWorkspace
                section={
                  workspace.activeProject?.name || sectionLabels[section]
                }
                visible={workspace.visible}
                view={workspace.view}
                setView={workspace.setView}
                query={workspace.query}
                setQuery={workspace.setQuery}
                filter={workspace.filter}
                setFilter={workspace.setFilter}
                searchRef={workspace.searchRef}
                onCreate={workspace.startTask}
                onEdit={workspace.openTask}
                onMove={workspace.moveTask}
              />
            </fieldset>
            <GardenProgress
              completed={progress.completed}
              goal={goal}
              streak={progress.streak}
              xp={progress.xp}
            />
          </div>
          <footer className="page-footer">
            <span>
              <span className="footer-spark">✦</span> Mỗi bước tiến đều đáng
              quý.
            </span>
            <span>Vun trồng mỗi ngày, mở ra những cơ hội mới.</span>
          </footer>
        </main>
      </div>
      {editing && (
        <TaskEditor
          projects={workspace.projects}
          editing={editing}
          setEditing={workspace.setEditing}
          pending={workspace.pending}
          error={workspace.error}
          isExisting={tasks.some((task) => task.id === editing.id)}
          onSave={workspace.saveTask}
          onDelete={workspace.deleteTask}
          onClose={workspace.closeEditor}
        />
      )}
      {workspace.projectEditing && (
        <ProjectEditor
          draft={workspace.projectEditing}
          onChange={workspace.setProjectEditing}
          onSave={workspace.saveProject}
          onDelete={workspace.deleteProject}
          onClose={() => {
            if (!workspace.pending) workspace.setProjectEditing(null);
          }}
          pending={workspace.pending}
          error={workspace.error}
        />
      )}
      {workspace.settings && (
        <SettingsDialog
          goal={goal}
          setGoal={workspace.setGoal}
          onClose={() => workspace.setSettings(false)}
        />
      )}
      {celebrate && (
        <Celebration
          celebrate={celebrate}
          completed={progress.completed}
          goal={goal}
          onClose={() => workspace.setCelebrate(null)}
        />
      )}
    </div>
  );
}
