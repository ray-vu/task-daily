# Quest Garden

A Next.js task and project manager with a calm garden workspace, Kanban/List views and rewards for daily progress.

## Run

```sh
npm install
npm run dev
```

This starts **both** Next.js (http://localhost:3000, or the next available port) and JSON Server (http://127.0.0.1:3002). In this working session the app is running at **http://localhost:3001**.

For production locally:

```sh
npm run build
npm start
```

To start the services separately, use `npm run dev:web` and `npm run dev:db` in separate terminals. `npm run start:web` runs only the production Next.js server. Stop an already-running JSON Server before starting a second one on port 3002.

Copy `.env.example` to `.env.local` when customizing Next.js settings:

```env
JSON_SERVER_URL=http://127.0.0.1:3002
TASK_TIME_ZONE=Asia/Ho_Chi_Minh
```

The JSON Server process accepts `JSON_SERVER_PORT` (default 3002) and `JSON_DB_FILE` (default `data/db.json`) as shell environment variables. When changing its port, set `JSON_SERVER_URL` to match. `.env.local` is read by Next.js; pass JSON Server's own variables through the shell.

## Storage and migration

### Deploy to Vercel

The local JSON Server is a separate process. Vercel deploys the Next.js functions;
it does not run `npm start` or the JSON Server process alongside them. Without
external storage, `/api/tasks` and `/api/projects` return 503.

1. Connect a PostgreSQL database (for example Neon through the
   [Vercel Marketplace](https://vercel.com/docs/postgres)) to your Vercel project.
2. In **Settings → Environment Variables**, set `DATABASE_URL` to the provider's
   **pooled connection URL**, including its SSL settings. Enable it for Production
   and any Preview deployments you use. Keep this variable server-side.
3. Remove the localhost `JSON_SERVER_URL` from Vercel. Set
   `TASK_TIME_ZONE=Asia/Ho_Chi_Minh` if you want this completion-date timezone.
4. Deploy the branch, or merge it to your production branch and redeploy.
5. Verify `/api/projects` and `/api/tasks` return 200; on a new database both return
   `[]`. Create a project/task and verify it still exists after a redeploy.

When `DATABASE_URL` is present, all task/project APIs use PostgreSQL. The first
request creates `quest_records` automatically; the database role must have CREATE
permission in its default schema. No database connection is needed during build.
Writes use transactions and a database advisory lock to coordinate duplicate-ID
checks, imports and project deletion across Vercel instances. Failed imports roll
back completely on this backend. Connections use a small pool managed by
`@vercel/functions` for function suspension.

Local development continues to use JSON Server when `DATABASE_URL` is absent.
Existing `data/db.json` records are not automatically copied to PostgreSQL; back
up that file before migrating. Browser legacy import remains available.
Alternatively, host JSON Server on a persistent server and set `JSON_SERVER_URL`
to that reachable service URL. Its raw API is internal and must be protected by
your hosting/network configuration.

- Next.js route handlers validate requests and use PostgreSQL when `DATABASE_URL` is set, otherwise the real **JSON Server 0.17.4** process. UI calls `/api/*`, not storage directly.
- JSON Server's official `create()`/`router(filename)` API uses its synchronous file adapter. Successful writes are saved in `data/db.json` before the response is sent. No task/project CRUD uses custom filesystem writes.
- The initial seed, `data/seed.json`, contains empty `tasks` and `projects` arrays. Startup copies it **only when the database does not exist**; existing data is never reset. The mutable database is gitignored. Back up `data/db.json` to preserve server data.
- Legacy `daily-quest-v1` browser tasks are retained. An **Import saved tasks** banner lets you bring them to the server. Matching records are skipped; a conflicting ID gets a deterministic import ID, preserving both versions. Retrying a partial import does not duplicate successfully imported records. The legacy browser backup is never removed or overwritten.
- Imported legacy tasks are placed in the Inbox (`projectId: null`); use the task editor to assign a project. Earlier server records without `projectId` are read as Inbox tasks.
- The daily goal remains local to each browser. Tasks/projects, completion dates and the data used to calculate XP/streak are stored on the server. Other open tabs load changes on refresh; there is no live push synchronization.
- This is a single workspace with no authentication or per-user isolation. With the local JSON Server backend there is no database transaction support or multi-instance write coordination. File storage requires a persistent writable disk and a running JSON Server; use PostgreSQL for Vercel.
- JSON Server binds to loopback. App-level validation and project protection apply to Next.js endpoints. The raw storage port is an internal service.

Official storage documentation: [JSON Server stable v0.17.4](https://github.com/typicode/json-server/tree/v0.17.4#module).

## Projects and tasks

Create a project using the **+** beside Projects in the sidebar. Select it to see only its tasks; new tasks automatically use that project. **Manage project** edits its name, description and color. The task editor can move a task between projects or to the Inbox. My tasks/Overview show all tasks.

Deleting a project containing any task, including completed tasks, returns **409**. Move or delete its tasks first. There is no automatic cascading delete; JSON Server's implicit relation cleanup is disabled, so unrelated Inbox tasks are preserved.

## API

Successful list responses are JSON arrays; single-record responses are JSON objects. Create returns `201`, reads/updates return `200`, and delete returns `204` with no body. Request bodies require `Content-Type: application/json`.

| Method                     | Endpoint                  | Purpose                                                  |
| -------------------------- | ------------------------- | -------------------------------------------------------- |
| GET / POST                 | `/api/projects`           | List / create projects                                   |
| GET / PUT / PATCH / DELETE | `/api/projects/:id`       | Read / replace / update / delete a project               |
| GET                        | `/api/projects/:id/tasks` | List tasks in an existing project                        |
| GET / POST                 | `/api/tasks`              | List / create tasks                                      |
| GET / PUT / PATCH / DELETE | `/api/tasks/:id`          | Read / replace / update / delete a task                  |
| PATCH                      | `/api/tasks/:id/status`   | Update status                                            |
| POST                       | `/api/tasks/import`       | Import legacy tasks without overwriting existing records |

`GET /api/tasks?projectId=PR-...&status=Done` combines optional project/status filters. Unknown project IDs return `404`; invalid status values return `400`. Search and priority/assignee filters in the UI run against the loaded server records.

Create a project:

```sh
curl -X POST http://localhost:3001/api/projects \
  -H 'Content-Type: application/json' \
  -d '{"name":"Product launch","description":"Our next release","color":"sage"}'
```

Use its returned ID when creating a task:

```sh
curl -X POST http://localhost:3001/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"projectId":"PR-RETURNED-ID","title":"Design onboarding","description":"Map the first-run experience","status":"To do","priority":"High","assignee":"You","labels":["Design"],"due":"2026-10-15","points":30}'
```

Complete it:

```sh
curl -X PATCH http://localhost:3001/api/tasks/DQ-RETURNED-ID/status \
  -H 'Content-Type: application/json' \
  -d '{"status":"Done"}'
```

Move it out of a project:

```sh
curl -X PATCH http://localhost:3001/api/tasks/DQ-RETURNED-ID \
  -H 'Content-Type: application/json' -d '{"projectId":null}'
```

Project fields: `name` (1–100 characters), `description` (up to 5,000), `color` (`sage`, `peach`, `yellow`, `blue`). Create defaults description to empty and color to sage. IDs are generated unless supplied; updates cannot change IDs.

Task fields: title (1–200 characters), description (up to 10,000), status (`To do`, `In progress`, `Done`), priority (`High`, `Medium`, `Low`), assignee (1–100), labels (up to 20, each 1–50), due (empty or a real `YYYY-MM-DD` date), points (5–200 in increments of 5), and projectId (existing project ID or null). Create defaults projectId to null; PUT requires every editable field; PATCH accepts a nonempty subset. Unknown fields are rejected.

The server sets `completedAt` on transition to Done, keeps it when editing an already-completed task, and clears it when reopening. Normal writes cannot override completion dates; import preserves legacy completion dates. XP counts currently-completed tasks, with one level per 200 XP; reopening removes those points instead of accumulating duplicate rewards.

Import accepts `{ "tasks": [ ...full legacy task records with IDs... ] }` (1–500 records) and returns `{ "tasks": [...], "imported": N, "skipped": N }`. All input is validated before writes begin. Imports are not transactional; retry after a storage failure to finish safely.

Errors use `{ "error": "...", "details": [{ "field": "...", "message": "..." }] }` (details on validation failures):

| Status    | Meaning                                                          |
| --------- | ---------------------------------------------------------------- |
| 400       | Invalid JSON, field, status, date, or missing referenced project |
| 404       | Record not found                                                 |
| 409       | Duplicate ID or attempted deletion of a nonempty project         |
| 413 / 415 | Body too large / incorrect content type                          |
| 502 / 503 | Storage error / JSON Server unavailable                          |

The UI shows loading/saving and actionable errors. It changes task state and awards XP only after a successful server response. Failed submissions retain the editor draft; retry after correcting fields or restarting storage.

## Code structure and checks

- `app/page.tsx`: page entry point.
- `app/api/`: Next.js task/project route handlers.
- `server/json-server.ts`: upstream HTTP client and process-wide write queue.
- `server/storage/postgres.ts`: persistent Vercel storage, transactions and cross-instance write coordination.
- `server/tasks/`, `server/projects/`: validation, relations and CRUD services.
- `features/tasks/use-task-data.ts`: server state, persistence requests and legacy migration.
- `features/tasks/use-task-workspace.ts`: selection, editor and reward interactions.
- `features/tasks/task-model.ts`: task factory, filters and XP/level/streak calculations.
- `features/tasks/components/`: task UI and garden illustration.
- `features/projects/`: project model, client and editor.
- `scripts/json-server.cjs`: real JSON Server using its file-backed router.

```sh
npm run lint
npm test
npm run build
npm run test:api
npm run format:check
```

API integration tests launch an isolated Next.js server and JSON Server on temporary ports with a disposable temporary database. They cover CRUD, validation, duplicate requests, project relations/protected deletion, import conflict/retry, storage outage and persistence after restart. They do not modify the application database.

`npm test` also executes the PostgreSQL storage SQL against an isolated embedded
PostgreSQL (PGlite), covering transactions/rollback, CRUD, imports, project
protection and cold-start initialization. The test replaces the `pg` TCP transport
with the embedded database's single connection; it does not verify connectivity,
SSL, connection pooling or locking between real production instances. Deployment
configuration tests ensure Vercel never silently falls back to localhost storage.

The responsive Quest Garden interface includes Board/List, drag and drop, search/filter, daily goal, XP, level, streak and celebrations. Ctrl/Cmd+K focuses search; Escape closes dialogs while idle. Animations respect reduced-motion preferences.
