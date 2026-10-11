import { z } from "zod";

// The API independently validates again; browser checks can be bypassed.
export function validateInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success)
    throw new Error(
      "Dữ liệu không hợp lệ. Vui lòng kiểm tra các trường và độ dài nội dung.",
    );
  return result.data;
}
