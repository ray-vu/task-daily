const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Compile the pure TypeScript module in memory, without Next.js or a browser.
const filename = path.join(__dirname, "../features/tasks/task-model.ts");
const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const model = { exports: {} };
new Function("exports", "require", source)(model.exports, require);
const { getProgress, filterTasks, createTask } = model.exports;
const date = new Date(2026, 9, 11, 12);
const task = (overrides = {}) => ({
  id: "DQ-test",
  title: "Review design",
  description: "Check accessibility",
  status: "To do",
  priority: "Medium",
  assignee: "You",
  labels: ["Design"],
  due: "2026-10-11",
  points: 20,
  ...overrides,
});

test("XP counts only completed tasks and determines level", () => {
  const progress = getProgress(
    [
      task({ status: "Done", points: 200, completedAt: "2026-10-11" }),
      task({ status: "In progress", points: 100 }),
    ],
    date,
  );
  assert.deepEqual(progress, { completed: 1, xp: 200, level: 2, streak: 1 });
  assert.equal(getProgress([task({ points: 200 })], date).xp, 0);
});

test("streak deduplicates dates, includes yesterday, and stops at a gap", () => {
  const tasks = ["2026-10-10", "2026-10-10", "2026-10-09", "2026-10-07"].map(
    (completedAt) => task({ status: "Done", completedAt }),
  );
  assert.equal(getProgress(tasks, date).streak, 2);
  assert.equal(getProgress(tasks, new Date(2026, 9, 12, 12)).streak, 0);
});

test("search and priority/assignee filters combine with project scope", () => {
  const tasks = [
    task({ id: "DQ-1", priority: "High" }),
    task({
      id: "DQ-2",
      labels: ["Personal"],
      priority: "High",
      assignee: "Alex",
    }),
    task({
      id: "DQ-3",
      title: "Write brief",
      description: "",
      labels: ["Product"],
    }),
  ];
  assert.deepEqual(
    filterTasks(tasks, "ACCESSIBILITY", "High priority", "Product launch").map(
      (t) => t.id,
    ),
    ["DQ-1"],
  );
  assert.equal(filterTasks(tasks, "", "Assigned to me", "Personal").length, 0);
  assert.equal(filterTasks(tasks, "DQ-3", "All tasks", "My tasks").length, 1);
  assert.equal(filterTasks(tasks, "", "All tasks", "Completed").length, 0);
});

test("task factory preserves defaults and column-specific status/labels", () => {
  assert.deepEqual(createTask().labels, ["Design"]);
  const draft = createTask("In progress", []);
  assert.equal(draft.status, "In progress");
  assert.deepEqual(draft.labels, []);
  assert.equal(draft.points, 20);
});
