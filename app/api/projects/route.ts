import { apiHandler, readBody } from "../../../server/tasks/http";
import { projectCreate } from "../../../server/projects/validation";
import { listProjects, createProject } from "../../../server/projects/store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  return apiHandler(async () => Response.json(await listProjects()));
}
export async function POST(request: Request) {
  return apiHandler(async () =>
    Response.json(await createProject(await readBody(request, projectCreate)), {
      status: 201,
    }),
  );
}
