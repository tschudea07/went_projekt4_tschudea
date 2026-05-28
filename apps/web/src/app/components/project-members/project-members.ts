import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  addProjectMemberSchema,
  type AddProjectMemberType,
} from '@lib/schemas/project.schema';
import { firstValueFrom } from 'rxjs';
import {
  ProjectMember,
  ProjectsService,
} from '../../services/projects.service';

@Component({
  selector: 'app-project-members',
  imports: [RouterLink],
  templateUrl: './project-members.html',
  styleUrl: './project-members.css',
})
export class ProjectMembers implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly projectsService: ProjectsService,
  ) {}

  protected readonly projectId = signal('');
  protected readonly email = signal('');
  protected readonly members = signal<ProjectMember[]>([]);
  protected readonly error = signal('');
  protected readonly emailError = signal('');
  protected readonly message = signal('');
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);

  protected readonly canSubmit = computed(
    () => this.email().trim().length !== 0 && !this.isSubmitting(),
  );

  async ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('projectId');

    if (!projectId) {
      this.error.set('Project id is missing.');
      this.isLoading.set(false);
      return;
    }

    this.projectId.set(projectId);
    await this.loadMembers();
  }

  protected onEmailInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.email.set(input.value);
    this.emailError.set('');
  }

  protected async loadMembers() {
    this.error.set('');
    this.isLoading.set(true);

    try {
      this.members.set(
        await firstValueFrom(
          this.projectsService.getProjectMembers(this.projectId()),
        ),
      );
    } catch (error) {
      this.error.set(this.toErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async onSubmit(event: Event) {
    event.preventDefault();
    this.error.set('');
    this.emailError.set('');
    this.message.set('');

    const parsedMember = addProjectMemberSchema.safeParse({
      email: this.email(),
    });

    if (!parsedMember.success) {
      this.emailError.set('Please enter a valid email address.');
      return;
    }

    await this.addMember(parsedMember.data);
  }

  private async addMember(member: AddProjectMemberType) {
    this.isSubmitting.set(true);

    try {
      const addedMember = await firstValueFrom(
        this.projectsService.addProjectMember(this.projectId(), member),
      );

      this.message.set(`${addedMember.name} is now part of this project.`);
      this.email.set('');
      await this.loadMembers();
    } catch (error) {
      this.error.set(this.toErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private toErrorMessage(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) {
        return 'Only project managers can manage project members.';
      }

      if (error.status === 404) {
        return 'Project or user could not be found.';
      }
    }

    return 'Project members could not be updated.';
  }
}
