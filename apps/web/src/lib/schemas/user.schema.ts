import * as z from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(10),
});

export const signUpSchema = z
  .object({
    name: z.string().min(5, 'Name must have a minimun of 5 chars'),
    email: z.email(),
    password: z.string().min(12),
    confirmPassword: z.string().min(12),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: "Passwords don't match",
      });
    }
  });

export type LoginType = z.infer<typeof loginSchema>;
export type SignUpType = z.infer<typeof signUpSchema>;
