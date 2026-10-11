import { z } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function readBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new ApiError(415, "Use Content-Type: application/json.");
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 1_000_000)
      throw new ApiError(413, "Request is too large.");
    body = JSON.parse(text);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "Invalid JSON body.");
  }
  return schema.parse(body);
}
export async function apiHandler(action: () => Promise<Response>) {
  try {
    return await action();
  } catch (error) {
    if (error instanceof z.ZodError)
      return Response.json(
        {
          error: "Invalid task data.",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    if (error instanceof ApiError)
      return Response.json({ error: error.message }, { status: error.status });
    console.error("Task API failed:", error);
    return Response.json(
      { error: "Unable to process the task request." },
      { status: 500 },
    );
  }
}
