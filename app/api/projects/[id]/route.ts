import { apiHandler, readBody } from "../../../../server/tasks/http";
import { idSchema } from "../../../../server/tasks/validation";
import {
  projectFields,
  projectPatch,
} from "../../../../server/projects/validation";
import {
  getProject,
  updateProject,
  deleteProject,
} from "../../../../server/projects/store";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  return apiHandler(async () =>
    Response.json(await getProject(idSchema.parse((await params).id))),
  );
}
export async function PATCH(request: Request, { params }: Context) {
  return apiHandler(async () =>
    Response.json(
      await updateProject(
        idSchema.parse((await params).id),
        await readBody(request, projectPatch),
      ),
    ),
  );
}
export async function PUT(request: Request, { params }: Context) {
  return apiHandler(async () =>
    Response.json(
      await updateProject(
        idSchema.parse((await params).id),
        await readBody(request, projectFields),
      ),
    ),
  );
}
export async function DELETE(_request: Request, { params }: Context) {
  return apiHandler(async () => {
    await deleteProject(idSchema.parse((await params).id));
    return new Response(null, { status: 204 });
  });
}
