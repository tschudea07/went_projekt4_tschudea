import { Injectable, NotFoundException } from '@nestjs/common';
import type { LoginType } from './user.schema';

type User = {
  id: number;
  name?: string;
  email: string;
  password?: string;
};

@Injectable()

export class UsersService {
  private users: User[] = [
    {
      id: 1,
      name: 'Peter',
      email: 'peter@test.com',
    },
    {
      id: 2,
      name: 'Anna',
      email: 'anna@test.com',
    },
  ];

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find((u) => u.id === id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  create(dto: LoginType) {
    const newUser = {
      id: this.users.length + 1,
      ...dto,
    };

    this.users.push(newUser);

    return newUser;
  }

  remove(id: number) {
    const userIndex = this.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = this.users[userIndex];

    this.users.splice(userIndex, 1);

    return deletedUser;
  }
}
