import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { createUserSchema, type CreateUserType } from './user.schema';

@Controller('users')
@AllowAnonymous()
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
