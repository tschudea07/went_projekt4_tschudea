import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { createUserSchema, type CreateUserType } from './user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(
    @Body(new ZodValidationPipe(createUserSchema))
    dto: CreateUserType,
  ) {
    return this.usersService.create(dto);
  }

}
