import { apiHandler, readBody } from "../../../../server/tasks/http";
import {
  idSchema,
  taskFields,
  patchSchema,
} from "../../../../server/tasks/validation";
import {
  getTask,
  updateTaskRecord,
  deleteTaskRecord,
} from "../../../../server/tasks/store";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  return apiHandler(async () =>
    Response.json(await getTask(idSchema.parse((await context.params).id))),
  );
}
export async function PATCH(request: Request, context: Context) {
  return apiHandler(async () =>
    Response.json(
      await updateTaskRecord(
        idSchema.parse((await context.params).id),
        await readBody(request, patchSchema),
      ),
    ),
  );
}
export async function PUT(request: Request, context: Context) {
  return apiHandler(async () =>
    Response.json(
      await updateTaskRecord(
        idSchema.parse((await context.params).id),
        await readBody(request, taskFields),
      ),
    ),
  );
}
export async function DELETE(_request: Request, context: Context) {
  return apiHandler(async () => {
    await deleteTaskRecord(idSchema.parse((await context.params).id));
    return new Response(null, { status: 204 });
  });
}
