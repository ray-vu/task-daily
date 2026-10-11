import { useEffect, useRef, useState } from "react";
import type { Project, ProjectDraft } from "../projects/types";
import { projectApi } from "../projects/project-api";
import type { Task, Status } from "./types";
import { taskApi } from "./task-api";

const LEGACY_KEY = "daily-quest-v1";
const IMPORT_KEY = "daily-quest-imported-v1";
const GOAL_KEY = "daily-quest-goal-v1";

/** Server-confirmed task state. Local storage retains goals and the legacy backup. */
export function useTaskData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goal, setGoal] = useState(5);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [legacy, setLegacy] = useState<Task[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const goalReady = useRef(false);
  const lock = useRef(false);
  const mounted = useRef(false);

  function report(error: unknown) {
    setError(
      error instanceof Error
        ? error.message
        : "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
    );
  }
  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [tasks, projects] = await Promise.all([
        taskApi.list(),
        projectApi.list(),
      ]);
      setTasks(tasks);
      setProjects(projects);
      setLoadFailed(false);
    } catch (error) {
      report(error);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    mounted.current = true;
    try {
      const saved = localStorage.getItem(LEGACY_KEY);
      const old = saved ? JSON.parse(saved) : null;
      const savedGoal = Number(
        localStorage.getItem(GOAL_KEY) || old?.goal || 5,
      );
      setGoal(Math.max(1, Math.min(30, savedGoal || 5)));
      if (
        Array.isArray(old?.tasks) &&
        old.tasks.length &&
        localStorage.getItem(IMPORT_KEY) !== JSON.stringify(old.tasks)
      )
        setLegacy(old.tasks);
    } catch {
      setMessage(
        "Dữ liệu cũ vẫn được giữ trong trình duyệt nhưng không thể đọc. Hãy xuất bản sao trước khi nhập thủ công.",
      );
    }
    goalReady.current = true;
    void refresh();
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (goalReady.current) {
      try {
        localStorage.setItem(GOAL_KEY, String(goal));
      } catch {}
    }
  }, [goal]);

  async function mutate<T>(
    action: () => Promise<T>,
    apply: (result: T) => void,
  ) {
    if (lock.current || loading || loadFailed) return false;
    lock.current = true;
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const result = await action();
      if (mounted.current) apply(result);
      return true;
    } catch (error) {
      if (mounted.current) {
        report(error);
        try {
          const [tasks, projects] = await Promise.all([
            taskApi.list(),
            projectApi.list(),
          ]);
          setTasks(tasks);
          setProjects(projects);
        } catch {}
      }
      return false;
    } finally {
      lock.current = false;
      if (mounted.current) setPending(false);
    }
  }
  const upsert = (saved: Task) =>
    setTasks((current) =>
      current.some((task) => task.id === saved.id)
        ? current.map((task) => (task.id === saved.id ? saved : task))
        : [...current, saved],
    );
  async function save(draft: Task, onSuccess: (saved: Task) => void) {
    const clean = {
      ...draft,
      labels: draft.labels.map((label) => label.trim()).filter(Boolean),
    };
    return mutate(
      () =>
        tasks.some((task) => task.id === draft.id)
          ? taskApi.update(clean)
          : taskApi.create(clean),
      (saved) => {
        upsert(saved);
        onSuccess(saved);
      },
    );
  }
  async function move(
    id: string,
    status: Status,
    onSuccess: (saved: Task) => void,
  ) {
    return mutate(
      () => taskApi.move(id, status),
      (saved) => {
        upsert(saved);
        onSuccess(saved);
      },
    );
  }
  async function remove(id: string, onSuccess: () => void) {
    return mutate(
      () => taskApi.delete(id),
      () => {
        setTasks((current) => current.filter((task) => task.id !== id));
        onSuccess();
      },
    );
  }
  async function importLegacy() {
    const snapshot = JSON.stringify(legacy);
    return mutate(
      () =>
        taskApi.import(
          legacy.map((task) => ({
            ...task,
            projectId: task.projectId || null,
            labels: task.labels.map((label) => label.trim()).filter(Boolean),
          })),
        ),
      (result) => {
        setTasks(result.tasks);
        setLegacy([]);
        setMessage(
          `Đã nhập ${result.imported} công việc. Bỏ qua ${result.skipped} công việc đã có trên máy chủ. Bản sao trong trình duyệt vẫn được giữ lại.`,
        );
        try {
          localStorage.setItem(IMPORT_KEY, snapshot);
        } catch {}
      },
    );
  }
  async function saveProject(
    draft: ProjectDraft,
    onSuccess: (saved: Project) => void,
  ) {
    return mutate(
      () =>
        draft.id
          ? projectApi.update(draft as Project)
          : projectApi.create(draft),
      (saved) => {
        setProjects((current) =>
          current.some((project) => project.id === saved.id)
            ? current.map((project) =>
                project.id === saved.id ? saved : project,
              )
            : [...current, saved],
        );
        onSuccess(saved);
      },
    );
  }
  async function removeProject(id: string, onSuccess: () => void) {
    return mutate(
      () => projectApi.delete(id),
      () => {
        setProjects((current) =>
          current.filter((project) => project.id !== id),
        );
        onSuccess();
      },
    );
  }
  return {
    tasks,
    projects,
    saveProject,
    removeProject,
    goal,
    setGoal,
    loading,
    pending,
    error,
    loadFailed,
    legacy,
    message,
    refresh,
    save,
    move,
    remove,
    importLegacy,
  };
}
