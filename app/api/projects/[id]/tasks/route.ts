import { apiHandler } from "../../../../../server/tasks/http";
import { getProject } from "../../../../../server/projects/store";
import { listTasks } from "../../../../../server/tasks/store";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return apiHandler(async () => {
    const project = await getProject((await params).id);
    return Response.json(
      (await listTasks()).filter((task) => task.projectId === project.id),
    );
  });
}
