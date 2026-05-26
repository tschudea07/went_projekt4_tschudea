import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { loginSchema, type LoginType } from './user.schema';

@Controller('users')

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @Post()
  createUser(
    @Body(new ZodValidationPipe(loginSchema))
    dto: LoginType,
  ) {
    return this.usersService.create(dto);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }
}
