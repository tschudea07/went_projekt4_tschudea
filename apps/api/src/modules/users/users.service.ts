import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/lib/services/prisma.service';
import type { CreateUserType } from './user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserType) {
    const userRole = await this.prisma.roles.findFirst({
      where: {
        name: 'admin',
      },
    });

    if (!userRole) {
      throw new NotFoundException(
        'Role "admin" was not found.',
      );
    }

    return this.prisma.app_users.create({
      data: {
        user_id: dto.id,
        email: dto.email,
        name: dto.name,
        roles_id: userRole.id,
        created_at: new Date(),
        updated_at: new Date()
      },
    });
  }
}