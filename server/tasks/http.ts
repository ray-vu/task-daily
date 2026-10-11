import { z } from "zod";
z.config(z.locales.vi());

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
    throw new ApiError(415, "Yêu cầu cần có Content-Type: application/json.");
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 1_000_000)
      throw new ApiError(413, "Dữ liệu gửi lên quá lớn.");
    body = JSON.parse(text);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "Dữ liệu JSON không hợp lệ.");
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
          error: "Dữ liệu không hợp lệ.",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message:
              issue.code === "invalid_type"
                ? "Sai kiểu dữ liệu."
                : issue.code === "invalid_value" ||
                    issue.code === "invalid_union"
                  ? "Giá trị không hợp lệ."
                  : issue.code === "unrecognized_keys"
                    ? "Dữ liệu có trường không được hỗ trợ."
                    : issue.message
                        .replace(/\bstring\b/g, "chuỗi")
                        .replace(/\bnumber\b/g, "số")
                        .replace(/\barray\b/g, "danh sách"),
          })),
        },
        { status: 400 },
      );
    if (error instanceof ApiError)
      return Response.json({ error: error.message }, { status: error.status });
    console.error("Task API failed:", error);
    return Response.json(
      { error: "Không thể xử lý yêu cầu." },
      { status: 500 },
    );
  }
}
