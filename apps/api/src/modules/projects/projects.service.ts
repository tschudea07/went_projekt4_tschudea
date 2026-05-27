import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/lib/services/prisma.service';
import type { CreateProjectType } from './project.schema';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findStatuses() {
    return this.prisma.status.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async create(dto: CreateProjectType, authUserId: string) {
    const appUser = await this.prisma.app_users.findFirst({
      where: {
        user_id: authUserId,
      },
    });

    if (!appUser) {
      throw new NotFoundException('App user was not found.');
    }

    const status = await this.prisma.status.findUnique({
      where: {
        id: dto.statusId,
      },
    });

    if (!status) {
      throw new NotFoundException('Project status was not found.');
    }

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.projects.create({
        data: {
          status_id: dto.statusId,
          title: dto.title,
          description: dto.description,
          start_date: new Date(dto.startDate),
          end_date: new Date(dto.endDate),
          updated_at: new Date(),
        },
      });

      await tx.project_managers.create({
        data: {
          projects_id: project.id,
          users_id: appUser.id,
        },
      });

      return project;
    });
  }
}
