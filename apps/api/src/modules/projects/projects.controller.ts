import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import {
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
  addProjectMemberSchema,
  createProjectSchema,
  type AddProjectMemberType,
  type CreateProjectType,
} from './project.schema';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('statuses')
  getStatuses() {
    return this.projectsService.findStatuses();
  }

  @Get()
  getProjects(@Session() session: UserSession) {
    return this.projectsService.findMine(session.user.id);
  }

  @Post()
  createProject(
    @Body(new ZodValidationPipe(createProjectSchema))
    dto: CreateProjectType,
    @Session() session: UserSession,
  ) {
    return this.projectsService.create(dto, session.user.id);
  }

  @Get(':projectId/members')
  getProjectMembers(
    @Param('projectId') projectId: string,
    @Session() session: UserSession,
  ) {
    return this.projectsService.findMembers(projectId, session.user.id);
  }

  @Post(':projectId/members')
  @HttpCode(200)
  addProjectMember(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(addProjectMemberSchema))
    dto: AddProjectMemberType,
    @Session() session: UserSession,
  ) {
    return this.projectsService.addMember(projectId, dto, session.user.id);
  }
}
