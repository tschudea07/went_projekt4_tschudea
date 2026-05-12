import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string(),
});

export type CreateTaskDto =
  z.infer<typeof createTaskSchema>;