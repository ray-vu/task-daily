const fs = require("node:fs");
const path = require("node:path");
const database = path.resolve(process.env.JSON_DB_FILE || "data/db.json");
if (!fs.existsSync(database)) {
  fs.mkdirSync(path.dirname(database), { recursive: true });
  fs.copyFileSync(
    path.resolve("data/seed.json"),
    database,
    fs.constants.COPYFILE_EXCL,
  );
  console.log(
    `Created ${database} from empty seed. Existing databases are never replaced.`,
  );
}
