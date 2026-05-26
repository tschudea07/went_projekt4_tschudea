import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/lib/services/prisma.service';
import type { CreateUserType } from './user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}


  create(dto: CreateUserType) {
    return this.prisma.user.upsert({
      where: { email: dto.email },
      update: {
        id: dto.id,
        name: dto.name,
        email: dto.email,
        updatedAt: new Date(),
      },
      create: {
        id: dto.id,
        name: dto.name,
        email: dto.email,
        emailVerified: false,
        updatedAt: new Date(),
      },
    });
  }
}
