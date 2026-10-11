import { getProject } from "../../../server/projects/store";
import { idSchema, statusSchema } from "../../../server/tasks/validation";
import { apiHandler, readBody } from "../../../server/tasks/http";
import { createSchema } from "../../../server/tasks/validation";
import { listTasks, createTaskRecord } from "../../../server/tasks/store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return apiHandler(async () => {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    const status = url.searchParams.get("status");
    if (projectId) await getProject(idSchema.parse(projectId));
    if (status) statusSchema.parse(status);
    const tasks = await listTasks();
    return Response.json(
      tasks.filter(
        (task) =>
          (!projectId || task.projectId === projectId) &&
          (!status || task.status === status),
      ),
    );
  });
}
export async function POST(request: Request) {
  return apiHandler(async () =>
    Response.json(
      await createTaskRecord(await readBody(request, createSchema)),
      { status: 201 },
    ),
  );
}
