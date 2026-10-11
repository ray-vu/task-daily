const jsonServer = require("json-server");
const path = require("node:path");
require("./prepare-db.cjs");
const filename = path.resolve(process.env.JSON_DB_FILE || "data/db.json");
const port = Number(process.env.JSON_SERVER_PORT || 3002);
const app = jsonServer.create();
app.use(jsonServer.defaults({ noCors: true, logger: false }));
app.use(jsonServer.bodyParser);
// Passing the filename uses JSON Server's synchronous file adapter:
// successful responses are sent after the JSON write, including during restarts.
// Next.js owns project relations and refuses deletion of non-empty projects.
// Disable JSON Server’s implicit cleanup of nullable projectId references.
app.use(jsonServer.router(filename, { foreignKeySuffix: "__questRelation" }));
const server = app.listen(port, "127.0.0.1", () =>
  console.log(`JSON Server: http://127.0.0.1:${port} → ${filename}`),
);
server.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
