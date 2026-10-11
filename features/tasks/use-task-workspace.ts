import { useEffect, useState, useRef } from "react";
import type { ProjectDraft } from "../projects/types";
import type { Task, Status, Section, TaskFilter, View } from "./types";
import { createTask, filterTasks, getProgress } from "./task-model";
import { useTaskData } from "./use-task-data";

/** Workspace interactions; task I/O and migration live in useTaskData. */
export function useTaskWorkspace() {
  const data = useTaskData();
  const { tasks } = data;
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectEditing, setProjectEditing] = useState<ProjectDraft | null>(
    null,
  );
  const activeProject = data.projects.find(
    (project) => project.id === activeProjectId,
  );
  const [section, setSection] = useState<Section>("My tasks");
  const [view, setView] = useState<View>("board");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TaskFilter>("All tasks");
  const [editing, setEditing] = useState<Task | null>(null);
  const [celebrate, setCelebrate] = useState<Task | null>(null);
  const [settings, setSettings] = useState(false);
  const [notice, setNotice] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const busy = data.loading || data.pending || data.loadFailed;

  useEffect(() => {
    if (!celebrate) return;
    const timer = setTimeout(() => setCelebrate(null), 4500);
    return () => clearTimeout(timer);
  }, [celebrate]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        if (!data.pending) {
          setEditing(null);
          setProjectEditing(null);
        }
        setSettings(false);
        setNotice(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [data.pending]);
  function openTask(task: Task) {
    if (!busy) setEditing(task);
  }
  function startTask(status: Status = "To do", labels: string[] = ["Design"]) {
    if (!busy)
      setEditing({ ...createTask(status, labels), projectId: activeProjectId });
  }
  function closeEditor() {
    if (!data.pending) {
      setEditing(null);
      setProjectEditing(null);
    }
  }
  async function moveTask(id: string, status: Status) {
    const previous = tasks.find((task) => task.id === id);
    if (!previous || previous.status === status) return;
    await data.move(id, status, (saved) => {
      if (status === "Done" && previous.status !== "Done") setCelebrate(saved);
    });
  }
  async function saveTask(draft: Task) {
    const previous = tasks.find((task) => task.id === draft.id);
    await data.save(draft, (saved) => {
      if (saved.status === "Done" && previous?.status !== "Done")
        setCelebrate(saved);
      setEditing(null);
    });
  }
  async function deleteTask(id: string) {
    await data.remove(id, () => setEditing(null));
  }
  return {
    ...data,
    busy,
    section,
    setSection: (section: Section) => {
      setSection(section);
      setActiveProjectId(null);
    },
    activeProjectId,
    activeProject,
    projectEditing,
    setProjectEditing,
    selectProject: (id: string) => {
      setActiveProjectId(id);
      setSection("Project");
    },
    startProject: () => {
      if (!busy)
        setProjectEditing({ name: "", description: "", color: "sage" });
    },
    saveProject: async (draft: ProjectDraft) => {
      await data.saveProject(draft, (saved) => {
        setProjectEditing(null);
        setActiveProjectId(saved.id);
        setSection("Project");
      });
    },
    deleteProject: async (id: string) => {
      await data.removeProject(id, () => {
        setProjectEditing(null);
        if (activeProjectId === id) {
          setActiveProjectId(null);
          setSection("My tasks");
        }
      });
    },
    view,
    setView,
    query,
    setQuery,
    filter,
    setFilter,
    editing,
    setEditing,
    celebrate,
    setCelebrate,
    settings,
    setSettings,
    notice,
    setNotice,
    searchRef,
    progress: getProgress(tasks),
    visible: filterTasks(tasks, query, filter, section).filter(
      (task) => !activeProjectId || task.projectId === activeProjectId,
    ),
    openTask,
    startTask,
    closeEditor,
    moveTask,
    saveTask,
    deleteTask,
  };
}
