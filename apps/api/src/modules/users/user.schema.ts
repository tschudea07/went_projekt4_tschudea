import * as z from 'zod';

export const createUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
});

export type CreateUserType = z.infer<typeof createUserSchema>;
