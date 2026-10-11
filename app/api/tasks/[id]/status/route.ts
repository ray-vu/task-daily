import { apiHandler, readBody } from "../../../../../server/tasks/http";
import {
  idSchema,
  statusBodySchema,
} from "../../../../../server/tasks/validation";
import { updateTaskRecord } from "../../../../../server/tasks/store";
export const runtime = "nodejs";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return apiHandler(async () =>
    Response.json(
      await updateTaskRecord(
        idSchema.parse((await params).id),
        await readBody(request, statusBodySchema),
      ),
    ),
  );
}
