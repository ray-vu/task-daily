const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const net = require("node:net");

const reservePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
function launch(args, env = {}) {
  const child = spawn(process.execPath, args, {
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.logs = "";
  child.stdout.on("data", (chunk) => (child.logs += chunk));
  child.stderr.on("data", (chunk) => (child.logs += chunk));
  return child;
}
async function stop(child) {
  if (child && child.exitCode === null) {
    const closed = new Promise((resolve) => child.once("exit", resolve));
    child.kill("SIGTERM");
    await closed;
  }
}
async function waitReady(url, child) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(child.logs);
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not start: ${child.logs}`);
}

test("Next.js task API + JSON Server persistence", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "quest-api-"));
  const dbFile = path.join(dir, "db.json");
  await fs.writeFile(dbFile, JSON.stringify({ tasks: [], projects: [] }));
  const [dbPort, webPort] = await Promise.all([reservePort(), reservePort()]);
  const dbUrl = `http://127.0.0.1:${dbPort}`;
  const webUrl = `http://127.0.0.1:${webPort}`;
  const dbArgs = [path.resolve("scripts/json-server.cjs")];
  const dbEnv = { JSON_DB_FILE: dbFile, JSON_SERVER_PORT: String(dbPort) };
  let db = launch(dbArgs, dbEnv);
  let web;
  t.after(async () => {
    await stop(web);
    await stop(db);
    await fs.rm(dir, { recursive: true, force: true });
  });
  await waitReady(`${dbUrl}/tasks`, db);
  web = launch(
    [
      require.resolve("next/dist/bin/next"),
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(webPort),
    ],
    { JSON_SERVER_URL: dbUrl },
  );
  await waitReady(`${webUrl}/api/tasks`, web);
  await t.test(
    "production CSP uses fresh nonces on rendered framework scripts",
    async () => {
      const first = await fetch(webUrl);
      const policy = first.headers.get("content-security-policy");
      assert.ok(policy);
      const nonce = /'nonce-([^']+)'/.exec(policy)[1];
      const scripts = policy
        .split(";")
        .find((part) => part.trim().startsWith("script-src "));
      assert.ok(scripts.includes("'strict-dynamic'"));
      assert.ok(!scripts.includes("'unsafe-inline'"));
      assert.ok(!scripts.includes("'unsafe-eval'"));
      assert.ok(policy.includes("script-src-attr 'none'"));
      assert.ok(policy.includes("object-src 'none'"));
      assert.equal(first.headers.get("x-content-type-options"), "nosniff");
      assert.ok(first.headers.get("cache-control").includes("no-store"));
      const html = await first.text();
      const tags = html.match(/<script\b[^>]*>/g);
      assert.ok(tags.length > 0);
      for (const tag of tags) assert.ok(tag.includes(`nonce="${nonce}"`));
      const second = await fetch(webUrl);
      assert.notEqual(
        /'nonce-([^']+)'/.exec(
          second.headers.get("content-security-policy"),
        )[1],
        nonce,
      );
    },
  );
  async function api(url = "", method = "GET", body) {
    const response = await fetch(`${webUrl}/api/tasks${url}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    return {
      status: response.status,
      data: response.status === 204 ? null : await response.json(),
    };
  }
  const draft = {
    id: "DQ-api-test",
    projectId: null,
    title: "API regression task",
    description: "An isolated test record",
    status: "To do",
    priority: "High",
    assignee: "You",
    labels: ["Design"],
    due: "2026-10-11",
    points: 25,
  };
  await t.test(
    "CRUD, status transitions and completion date ownership",
    async () => {
      assert.deepEqual((await api()).data, []);
      assert.equal((await api("", "POST", draft)).status, 201);
      assert.equal((await api("/DQ-api-test")).data.title, draft.title);
      assert.equal((await api("", "POST", draft)).status, 409);
      const completed = await api("/DQ-api-test/status", "PATCH", {
        status: "Done",
      });
      assert.equal(completed.status, 200);
      assert.match(completed.data.completedAt, /^\d{4}-\d{2}-\d{2}$/);
      const changed = await api("/DQ-api-test", "PATCH", {
        title: "Edited task",
        completedAt: "2000-01-01",
      });
      assert.equal(changed.data.title, "Edited task");
      assert.equal(changed.data.completedAt, completed.data.completedAt);
      assert.equal(
        (await api("/DQ-api-test/status", "PATCH", { status: "In progress" }))
          .data.completedAt,
        null,
      );
      const { id, ...fields } = draft;
      assert.equal(
        (
          await api("/DQ-api-test", "PUT", {
            ...fields,
            title: "Replaced task",
          })
        ).data.title,
        "Replaced task",
      );
      const stored = JSON.parse(await fs.readFile(dbFile, "utf8"));
      assert.equal(stored.tasks[0].title, "Replaced task");
    },
  );
  await t.test("validation, malformed JSON and not-found errors", async () => {
    for (const invalid of [
      { ...draft, id: "new", title: " " },
      { ...draft, id: "new", status: "Invalid" },
      { ...draft, id: "new", points: 17 },
      { ...draft, id: "new", due: "2026-02-30" },
      { ...draft, id: "new", extra: true },
    ])
      assert.equal((await api("", "POST", invalid)).status, 400);
    assert.equal((await api("/missing")).status, 404);
    assert.equal((await api("/missing", "DELETE")).status, 404);
    assert.equal((await api("/DQ-api-test", "PATCH", {})).status, 400);
    assert.equal(
      (
        await api("/DQ-api-test/status", "PATCH", {
          status: "Done",
          title: "unwanted",
        })
      ).status,
      400,
    );
    assert.equal(
      (await api("/DQ-api-test", "PUT", { title: "Incomplete" })).status,
      400,
    );
    const malformed = await fetch(`${webUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    assert.equal(malformed.status, 400);
    const media = await fetch(`${webUrl}/api/tasks`, {
      method: "POST",
      body: "{}",
    });
    assert.equal(media.status, 415);
  });
  await t.test(
    "import preserves conflicting records and retries without duplication",
    async () => {
      const legacy = { ...draft, title: "Legacy browser version" };
      const first = await api("/import", "POST", { tasks: [legacy] });
      assert.equal(first.status, 200);
      assert.equal(first.data.imported, 1);
      assert.equal(
        first.data.tasks.find((task) => task.id === draft.id).title,
        "Replaced task",
      );
      const second = await api("/import", "POST", { tasks: [legacy] });
      assert.equal(second.data.imported, 0);
      assert.equal(second.data.skipped, 1);
      assert.equal(second.data.tasks.length, 2);
      const count = (await api()).data.length;
      assert.equal(
        (
          await api("/import", "POST", {
            tasks: [legacy, { ...draft, id: "bad", points: 1 }],
          })
        ).status,
        400,
      );
      assert.equal((await api()).data.length, count);
    },
  );
  async function projectApi(url = "", method = "GET", body) {
    const response = await fetch(`${webUrl}/api/projects${url}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    return {
      status: response.status,
      data: response.status === 204 ? null : await response.json(),
    };
  }
  await t.test(
    "project CRUD, task relations and protected deletion",
    async () => {
      assert.equal(
        (await projectApi("", "POST", { id: "PR-test", name: "Test project" }))
          .status,
        201,
      );
      assert.equal((await projectApi("/PR-test")).data.name, "Test project");
      assert.equal(
        (
          await projectApi("/PR-test", "PUT", {
            name: "Replaced project",
            description: "Full update",
            color: "peach",
          })
        ).data.color,
        "peach",
      );
      assert.equal(
        (await projectApi("/PR-test", "PATCH", { name: "Updated project" }))
          .data.name,
        "Updated project",
      );
      assert.equal(
        (await api("/DQ-api-test", "PATCH", { projectId: "PR-test" })).status,
        200,
      );
      assert.equal((await api("?projectId=PR-test")).data.length, 1);
      assert.equal((await projectApi("/PR-test/tasks")).data.length, 1);
      assert.equal((await projectApi("/PR-test", "DELETE")).status, 409);
      assert.equal(
        (await api("/DQ-api-test", "PATCH", { projectId: "PR-missing" }))
          .status,
        400,
      );
      assert.equal(
        (
          await api("", "POST", {
            ...draft,
            id: "DQ-invalid-project",
            projectId: "PR-missing",
          })
        ).status,
        400,
      );
      assert.equal((await projectApi("", "POST", { name: " " })).status, 400);
      assert.equal(
        (await api("/DQ-api-test", "PATCH", { projectId: null })).status,
        200,
      );
      assert.equal((await projectApi("/PR-test", "DELETE")).status, 204);
      assert.equal((await api("/DQ-api-test")).data.projectId, null);
      assert.equal((await projectApi("/PR-test")).status, 404);
      assert.equal(
        (
          await projectApi("", "POST", {
            id: "PR-persistent",
            name: "Persistent project",
          })
        ).status,
        201,
      );
    },
  );
  await t.test(
    "simultaneous creates with the same ID are not duplicated",
    async () => {
      const results = await Promise.all([
        api("", "POST", { ...draft, id: "DQ-concurrent" }),
        api("", "POST", { ...draft, id: "DQ-concurrent" }),
      ]);
      assert.deepEqual(
        results.map((result) => result.status).sort(),
        [201, 409],
      );
    },
  );
  await t.test(
    "storage outage responds 503; records survive JSON Server restart",
    async () => {
      await stop(db);
      assert.equal((await api()).status, 503);
      assert.equal(
        (await api("/DQ-api-test/status", "PATCH", { status: "Done" })).status,
        503,
      );
      db = launch(dbArgs, dbEnv);
      await waitReady(`${dbUrl}/tasks`, db);
      assert.equal((await api("/DQ-api-test")).data.title, "Replaced task");
      assert.equal((await api()).data.length, 3);
      assert.equal(
        (await projectApi("/PR-persistent")).data.name,
        "Persistent project",
      );
    },
  );
  await t.test("delete persists and subsequent reads return 404", async () => {
    assert.equal((await api("/DQ-api-test", "DELETE")).status, 204);
    assert.equal((await api("/DQ-api-test")).status, 404);
    assert.equal(
      JSON.parse(await fs.readFile(dbFile, "utf8")).tasks.some(
        (task) => task.id === draft.id,
      ),
      false,
    );
  });
});
