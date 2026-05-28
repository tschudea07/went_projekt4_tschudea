import * as z from 'zod';

export const createProjectSchema = z
  .object({
    statusId: z.number().int().positive('Status is required'),
    title: z.string().trim().min(3, 'Title must have at least 3 characters').max(100),
    description: z.string().trim().min(1, 'Description is required').max(1000),
    startDate: z.iso.datetime({ local: true }),
    endDate: z.iso.datetime({ local: true }),
  })
  .superRefine((data, ctx) => {
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date must be after start date',
      });
    }
  });

export type CreateProjectType = z.infer<typeof createProjectSchema>;

export const addProjectMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email())
    .transform((email) => email.toLowerCase()),
});

export type AddProjectMemberType = z.infer<typeof addProjectMemberSchema>;
