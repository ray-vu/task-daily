import { z } from "zod";

export const statusSchema = z.enum(["To do", "In progress", "Done"]);
export const idSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{1,100}$/, "Mã bản ghi không hợp lệ");
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(value + "T12:00:00Z");
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "Ngày không hợp lệ");
export const taskFields = z
  .object({
    projectId: idSchema.nullable(),
    title: z.string().trim().min(1).max(200),
    description: z.string().max(10000),
    status: statusSchema,
    priority: z.enum(["High", "Medium", "Low"]),
    assignee: z.string().trim().min(1).max(100),
    labels: z.array(z.string().trim().min(1).max(50)).max(20),
    due: z.union([z.literal(""), dateSchema]),
    points: z.number().int().min(5).max(200).multipleOf(5),
    completedAt: dateSchema.nullable().optional(),
  })
  .strict();
export const createSchema = taskFields.extend({
  id: idSchema.optional(),
  projectId: idSchema.nullable().default(null),
});
export const patchSchema = taskFields
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Cần cung cấp ít nhất một trường dữ liệu",
  );
export const importSchema = z
  .object({
    tasks: z
      .array(
        taskFields.extend({
          id: idSchema,
          projectId: idSchema.nullable().default(null),
        }),
      )
      .min(1)
      .max(500),
  })
  .strict();
export const statusBodySchema = z.object({ status: statusSchema }).strict();
