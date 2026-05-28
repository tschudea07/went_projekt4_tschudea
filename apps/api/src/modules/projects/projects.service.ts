import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/lib/services/prisma.service';
import type {
  AddProjectMemberType,
  CreateProjectType,
} from './project.schema';

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

      await tx.users_projects.create({
        data: {
          projects_id: project.id,
          users_id: appUser.id,
        },
      });

      return this.toProjectSummary({
        ...project,
        status,
        _count: {
          users_projects: 1,
        },
      });
    });
  }

  async findMine(authUserId: string) {
    const appUser = await this.findAppUserByAuthId(authUserId);

    const projects = await this.prisma.projects.findMany({
      where: {
        OR: [
          {
            project_managers: {
              some: {
                users_id: appUser.id,
              },
            },
          },
          {
            users_projects: {
              some: {
                users_id: appUser.id,
              },
            },
          },
        ],
      },
      include: {
        status: true,
        _count: {
          select: {
            users_projects: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return projects.map((project) => this.toProjectSummary(project));
  }

  async findMembers(projectId: string, authUserId: string) {
    await this.assertProjectManager(projectId, authUserId);

    const members = await this.prisma.users_projects.findMany({
      where: {
        projects_id: projectId,
      },
      include: {
        app_users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        app_users: {
          name: 'asc',
        },
      },
    });

    return members.map((member) => this.toProjectMember(member.app_users));
  }

  async addMember(
    projectId: string,
    dto: AddProjectMemberType,
    authUserId: string,
  ) {
    await this.assertProjectManager(projectId, authUserId);

    const member = await this.prisma.app_users.findFirst({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!member) {
      throw new NotFoundException('User was not found.');
    }

    const existingMember = await this.prisma.users_projects.findUnique({
      where: {
        users_id_projects_id: {
          users_id: member.id,
          projects_id: projectId,
        },
      },
      include: {
        app_users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (existingMember) {
      return this.toProjectMember(existingMember.app_users);
    }

    const projectMember = await this.prisma.users_projects.create({
      data: {
        projects_id: projectId,
        users_id: member.id,
      },
      include: {
        app_users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.toProjectMember(projectMember.app_users);
  }

  private async findAppUserByAuthId(authUserId: string) {
    const appUser = await this.prisma.app_users.findFirst({
      where: {
        user_id: authUserId,
      },
    });

    if (!appUser) {
      throw new NotFoundException('App user was not found.');
    }

    return appUser;
  }

  private async assertProjectManager(projectId: string, authUserId: string) {
    const appUser = await this.findAppUserByAuthId(authUserId);

    const project = await this.prisma.projects.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project was not found.');
    }

    const projectManager = await this.prisma.project_managers.findFirst({
      where: {
        projects_id: projectId,
        users_id: appUser.id,
      },
    });

    if (!projectManager) {
      throw new ForbiddenException(
        'Only project managers can manage project members.',
      );
    }

    return appUser;
  }

  private toProjectSummary(project: {
    id: string;
    title: string;
    description: string;
    start_date: Date;
    end_date: Date;
    status: {
      id: number;
      name: string;
    };
    _count: {
      users_projects: number;
    };
  }) {
    return {
      id: project.id,
      title: project.title,
      description: project.description,
      startDate: project.start_date.toISOString(),
      endDate: project.end_date.toISOString(),
      status: project.status,
      membersCount: project._count.users_projects,
    };
  }

  private toProjectMember(member: {
    id: string;
    name: string;
    email: string;
  }) {
    return {
      id: member.id,
      name: member.name,
      email: member.email,
    };
  }
}
