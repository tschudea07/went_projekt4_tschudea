import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

jest.mock('src/lib/services/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from 'src/lib/services/prisma.service';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  const manager = {
    id: 'manager-app-user-id',
    user_id: 'manager-auth-user-id',
    name: 'Project Manager',
    email: 'manager@example.com',
  };

  const member = {
    id: 'member-app-user-id',
    name: 'Project Member',
    email: 'member@example.com',
  };

  function createPrismaMock() {
    return {
      $transaction: jest.fn(),
      app_users: {
        findFirst: jest.fn(),
      },
      status: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      projects: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      project_managers: {
        create: jest.fn(),
        count: jest.fn(),
        deleteMany: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      users_projects: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };
  }

  function createService(prisma = createPrismaMock()) {
    return {
      prisma,
      service: new ProjectsService(prisma as unknown as PrismaService),
    };
  }

  it('adds registered users when the authenticated user is project manager', async () => {
    const { prisma, service } = createService();

    prisma.app_users.findFirst
      .mockResolvedValueOnce(manager)
      .mockResolvedValueOnce(member);
    prisma.projects.findUnique.mockResolvedValue({ id: 'project-id' });
    prisma.project_managers.findFirst.mockResolvedValue({
      projects_id: 'project-id',
      users_id: manager.id,
    });
    prisma.users_projects.findUnique.mockResolvedValue(null);
    prisma.users_projects.create.mockResolvedValue({
      app_users: member,
    });

    await expect(
      service.addMember(
        'project-id',
        { email: member.email },
        manager.user_id,
      ),
    ).resolves.toEqual({
      ...member,
      isProjectManager: false,
    });

    expect(prisma.users_projects.create).toHaveBeenCalledWith({
      data: {
        projects_id: 'project-id',
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
  });

  it('rejects users who are not project managers', async () => {
    const { prisma, service } = createService();

    prisma.app_users.findFirst.mockResolvedValue(manager);
    prisma.projects.findUnique.mockResolvedValue({ id: 'project-id' });
    prisma.project_managers.findFirst.mockResolvedValue(null);

    await expect(
      service.addMember(
        'project-id',
        { email: member.email },
        manager.user_id,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects unknown project members', async () => {
    const { prisma, service } = createService();

    prisma.app_users.findFirst
      .mockResolvedValueOnce(manager)
      .mockResolvedValueOnce(null);
    prisma.projects.findUnique.mockResolvedValue({ id: 'project-id' });
    prisma.project_managers.findFirst.mockResolvedValue({
      projects_id: 'project-id',
      users_id: manager.id,
    });

    await expect(
      service.addMember(
        'project-id',
        { email: 'missing@example.com' },
        manager.user_id,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns existing members without creating duplicate rows', async () => {
    const { prisma, service } = createService();

    prisma.app_users.findFirst
      .mockResolvedValueOnce(manager)
      .mockResolvedValueOnce(member);
    prisma.projects.findUnique.mockResolvedValue({ id: 'project-id' });
    prisma.project_managers.findFirst.mockResolvedValue({
      projects_id: 'project-id',
      users_id: manager.id,
    });
    prisma.users_projects.findUnique.mockResolvedValue({
      app_users: member,
    });

    await expect(
      service.addMember(
        'project-id',
        { email: member.email },
        manager.user_id,
      ),
    ).resolves.toEqual({
      ...member,
      isProjectManager: false,
    });

    expect(prisma.users_projects.create).not.toHaveBeenCalled();
  });

  it('marks project managers in the members list', async () => {
    const { prisma, service } = createService();

    prisma.app_users.findFirst.mockResolvedValue(manager);
    prisma.projects.findUnique.mockResolvedValue({ id: 'project-id' });
    prisma.project_managers.findFirst.mockResolvedValue({
      projects_id: 'project-id',
      users_id: manager.id,
    });
    prisma.users_projects.findMany.mockResolvedValue([
      {
        app_users: manager,
      },
      {
        app_users: member,
      },
    ]);
    prisma.project_managers.findMany.mockResolvedValue([
      {
        users_id: manager.id,
      },
    ]);

    await expect(
      service.findMembers('project-id', manager.user_id),
    ).resolves.toEqual([
      {
        id: manager.id,
        name: manager.name,
        email: manager.email,
        isProjectManager: true,
      },
      {
        id: member.id,
        name: member.name,
        email: member.email,
        isProjectManager: false,
      },
    ]);
  });

  it('adds the creator as project manager and project member', async () => {
    const { prisma, service } = createService();
    const project = {
      id: 'project-id',
      title: 'Launch',
      description: 'Launch project',
      start_date: new Date('2026-05-01T08:00:00.000Z'),
      end_date: new Date('2026-05-02T08:00:00.000Z'),
    };
    const status = {
      id: 1,
      name: 'Planning',
    };

    prisma.app_users.findFirst.mockResolvedValue(manager);
    prisma.status.findUnique.mockResolvedValue(status);
    prisma.$transaction.mockImplementation((callback) =>
      callback({
        projects: {
          create: jest.fn().mockResolvedValue(project),
        },
        project_managers: {
          create: prisma.project_managers.create,
        },
        users_projects: {
          create: prisma.users_projects.create,
        },
      }),
    );

    await service.create(
      {
        statusId: status.id,
        title: project.title,
        description: project.description,
        startDate: '2026-05-01T08:00',
        endDate: '2026-05-02T08:00',
      },
      manager.user_id,
    );

    expect(prisma.project_managers.create).toHaveBeenCalledWith({
      data: {
        projects_id: project.id,
        users_id: manager.id,
      },
    });
    expect(prisma.users_projects.create).toHaveBeenCalledWith({
      data: {
        projects_id: project.id,
        users_id: manager.id,
      },
    });
  });

  it('promotes a project member to project manager', async () => {
    const { prisma, service } = createService();

    prisma.app_users.findFirst.mockResolvedValue(manager);
    prisma.projects.findUnique.mockResolvedValue({ id: 'project-id' });
    prisma.project_managers.findFirst.mockResolvedValue({
      projects_id: 'project-id',
      users_id: manager.id,
    });
    prisma.users_projects.findUnique.mockResolvedValue({
      app_users: member,
    });
    prisma.project_managers.findUnique.mockResolvedValue(null);

    await expect(
      service.promoteMemberToManager(
        'project-id',
        member.id,
        manager.user_id,
      ),
    ).resolves.toEqual({
      ...member,
      isProjectManager: true,
    });

    expect(prisma.project_managers.create).toHaveBeenCalledWith({
      data: {
        projects_id: 'project-id',
        users_id: member.id,
      },
    });
  });

  it('removes a regular project member', async () => {
    const { prisma, service } = createService();

    prisma.app_users.findFirst.mockResolvedValue(manager);
    prisma.projects.findUnique.mockResolvedValue({ id: 'project-id' });
    prisma.project_managers.findFirst.mockResolvedValue({
      projects_id: 'project-id',
      users_id: manager.id,
    });
    prisma.users_projects.findUnique.mockResolvedValue({
      app_users: member,
    });
    prisma.project_managers.findUnique.mockResolvedValue(null);
    prisma.$transaction.mockImplementation((callback) =>
      callback({
        project_managers: {
          deleteMany: prisma.project_managers.deleteMany,
        },
        users_projects: {
          deleteMany: prisma.users_projects.deleteMany,
        },
      }),
    );

    await expect(
      service.removeMember('project-id', member.id, manager.user_id),
    ).resolves.toEqual({
      ...member,
      isProjectManager: false,
    });

    expect(prisma.users_projects.deleteMany).toHaveBeenCalledWith({
      where: {
        projects_id: 'project-id',
        users_id: member.id,
      },
    });
  });

  it('removes a project manager when another manager remains', async () => {
    const { prisma, service } = createService();

    prisma.app_users.findFirst.mockResolvedValue(manager);
    prisma.projects.findUnique.mockResolvedValue({ id: 'project-id' });
    prisma.project_managers.findFirst.mockResolvedValue({
      projects_id: 'project-id',
      users_id: manager.id,
    });
    prisma.users_projects.findUnique.mockResolvedValue({
      app_users: member,
    });
    prisma.project_managers.findUnique.mockResolvedValue({
      projects_id: 'project-id',
      users_id: member.id,
    });
    prisma.project_managers.count.mockResolvedValue(2);
    prisma.$transaction.mockImplementation((callback) =>
      callback({
        project_managers: {
          deleteMany: prisma.project_managers.deleteMany,
        },
        users_projects: {
          deleteMany: prisma.users_projects.deleteMany,
        },
      }),
    );

    await expect(
      service.removeMember('project-id', member.id, manager.user_id),
    ).resolves.toEqual({
      ...member,
      isProjectManager: true,
    });

    expect(prisma.project_managers.deleteMany).toHaveBeenCalledWith({
      where: {
        projects_id: 'project-id',
        users_id: member.id,
      },
    });
  });

  it('rejects removing the last project manager', async () => {
    const { prisma, service } = createService();

    prisma.app_users.findFirst.mockResolvedValue(manager);
    prisma.projects.findUnique.mockResolvedValue({ id: 'project-id' });
    prisma.project_managers.findFirst.mockResolvedValue({
      projects_id: 'project-id',
      users_id: manager.id,
    });
    prisma.users_projects.findUnique.mockResolvedValue({
      app_users: manager,
    });
    prisma.project_managers.findUnique.mockResolvedValue({
      projects_id: 'project-id',
      users_id: manager.id,
    });
    prisma.project_managers.count.mockResolvedValue(1);

    await expect(
      service.removeMember('project-id', manager.id, manager.user_id),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
