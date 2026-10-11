const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { PGlite } = require("@electric-sql/pglite");

function loadServer(overrides) {
  const cache = new Map();
  function load(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    new Function("exports", "require", source)(module.exports, (name) => {
      if (overrides[name]) return overrides[name];
      return name.startsWith(".")
        ? load(path.resolve(path.dirname(filename), `${name}.ts`))
        : require(name);
    });
    return module.exports;
  }
  return load;
}

test("PostgreSQL storage executes CRUD, relation checks and rollback", async (t) => {
  const db = new PGlite();
  const previous = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://embedded-test/quest";
  // Run the actual SQL against embedded PostgreSQL. The pg transport is replaced
  // because PGlite does not expose a TCP server; it has one connection.
  let queue = Promise.resolve();
  class Pool {
    on() {}
    async connect() {
      const before = queue;
      let release;
      queue = new Promise((resolve) => (release = resolve));
      await before;
      return { query: (sql, args) => db.query(sql, args), release };
    }
    async query(sql, args) {
      const client = await this.connect();
      try {
        return await client.query(sql, args);
      } finally {
        client.release();
      }
    }
  }
  const keys = [
    "questPostgresPool",
    "questPostgresReady",
    "questPostgresTransaction",
  ];
  t.after(async () => {
    await db.close();
    for (const key of keys) delete globalThis[key];
    if (previous === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous;
  });
  const load = loadServer({
    pg: { Pool },
    "@vercel/functions": { attachDatabasePool() {} },
  });
  const projects = load("server/projects/store.ts");
  const tasks = load("server/tasks/store.ts");
  const storage = load("server/json-server.ts");
  assert.deepEqual(await projects.listProjects(), []);
  assert.deepEqual(await tasks.listTasks(), []);
  await projects.createProject({
    id: "PR-test",
    name: "Persistent project",
    description: "",
    color: "sage",
  });
  const draft = {
    id: "DQ-test",
    projectId: "PR-test",
    title: "Persistent task",
    description: "",
    status: "To do",
    priority: "Medium",
    assignee: "You",
    labels: [],
    due: "",
    points: 20,
  };
  await tasks.createTaskRecord(draft);
  assert.equal((await tasks.getTask(draft.id)).title, draft.title);
  await assert.rejects(projects.deleteProject("PR-test"), { status: 409 });
  await assert.rejects(
    tasks.createTaskRecord({ ...draft, id: "bad", projectId: "missing" }),
    { status: 400 },
  );
  const results = await Promise.allSettled([
    tasks.createTaskRecord({ ...draft, id: "concurrent" }),
    tasks.createTaskRecord({ ...draft, id: "concurrent" }),
  ]);
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(
    results.find((result) => result.status === "rejected").reason.status,
    409,
  );
  const done = await tasks.updateTaskRecord(draft.id, { status: "Done" });
  assert.match(done.completedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(
    (await tasks.updateTaskRecord(draft.id, { title: "Edited" })).completedAt,
    done.completedAt,
  );
  await assert.rejects(
    storage.serialize(async () => {
      await storage.upstream("/tasks", {
        method: "POST",
        body: JSON.stringify({ ...draft, id: "rollback" }),
      });
      throw new Error("Simulated failure");
    }),
  );
  await assert.rejects(tasks.getTask("rollback"), { status: 404 });
  const imported = await tasks.importTasks([{ ...draft, title: "Legacy" }]);
  assert.equal(imported.imported, 1);
  assert.equal(
    (await tasks.importTasks([{ ...draft, title: "Legacy" }])).skipped,
    1,
  );
  await projects.updateProject("PR-test", { name: "Renamed" });
  // Simulate a cold start without resetting the database.
  delete globalThis.questPostgresReady;
  assert.equal((await projects.getProject("PR-test")).name, "Renamed");
  for (const task of await tasks.listTasks())
    await tasks.deleteTaskRecord(task.id);
  await projects.deleteProject("PR-test");
  assert.deepEqual(await projects.listProjects(), []);
  assert.deepEqual(await tasks.listTasks(), []);
});

test("Vercel rejects absent storage and localhost before making a request", async (t) => {
  const previous = { ...process.env };
  t.after(() => {
    for (const key of ["DATABASE_URL", "VERCEL", "JSON_SERVER_URL"])
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
  });
  const load = loadServer({
    "./storage/postgres": {
      postgresRecord: async () => ["postgres"],
      postgresWrite: async (action) => action(),
    },
  });
  const { upstream, serialize } = load("server/json-server.ts");
  process.env.VERCEL = "1";
  delete process.env.DATABASE_URL;
  delete process.env.JSON_SERVER_URL;
  await assert.rejects(
    upstream("/tasks"),
    (error) => error.status === 503 && error.message.includes("DATABASE_URL"),
  );
  for (const host of ["localhost", "127.0.0.1", "[::1]", "0.0.0.0"]) {
    process.env.JSON_SERVER_URL = `http://${host}:3002`;
    await assert.rejects(
      upstream("/projects"),
      (error) =>
        error.status === 503 && error.message.includes("local JSON Server"),
    );
  }
  process.env.DATABASE_URL = "postgresql://configured/quest";
  assert.deepEqual(await upstream("/tasks"), ["postgres"]);
  assert.equal(await serialize(async () => "saved"), "saved");
});
