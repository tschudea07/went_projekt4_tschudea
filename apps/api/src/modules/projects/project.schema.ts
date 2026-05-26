import * as z from 'zod';

export const createProjectSchema = z
  .object({
    statusId: z.number().int().positive(),
    title: z.string().trim().min(3).max(100),
    description: z.string().trim().min(1).max(1000),
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
