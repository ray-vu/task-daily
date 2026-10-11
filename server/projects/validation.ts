import { z } from "zod";
import { idSchema } from "../tasks/validation";
export const projectFields = z
  .object({
    name: z.string().trim().min(1).max(100),
    description: z.string().max(5000),
    color: z.enum(["sage", "peach", "yellow", "blue"]),
  })
  .strict();
export const projectCreate = projectFields.extend({
  id: idSchema.optional(),
  description: z.string().max(5000).default(""),
  color: z.enum(["sage", "peach", "yellow", "blue"]).default("sage"),
});
export const projectPatch = projectFields
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Cần cung cấp ít nhất một trường dữ liệu",
  );
