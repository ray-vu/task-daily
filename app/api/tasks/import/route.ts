import { apiHandler, readBody } from "../../../../server/tasks/http";
import { importSchema } from "../../../../server/tasks/validation";
import { importTasks } from "../../../../server/tasks/store";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return apiHandler(async () =>
    Response.json(
      await importTasks((await readBody(request, importSchema)).tasks),
    ),
  );
}
