import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import {
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { createProjectSchema, type CreateProjectType } from './project.schema';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('statuses')
  getStatuses() {
    return this.projectsService.findStatuses();
  }

  @Post()
  createProject(
    @Body(new ZodValidationPipe(createProjectSchema))
    dto: CreateProjectType,
    @Session() session: UserSession,
  ) {
    return this.projectsService.create(dto, session.user.id);
  }
}
