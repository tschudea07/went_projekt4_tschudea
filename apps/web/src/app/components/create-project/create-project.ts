import { Component, OnInit, signal } from '@angular/core';
import { form, FormField, validateStandardSchema } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { createProjectSchema, type CreateProjectType } from '@lib/schemas/project.schema';
import { firstValueFrom } from 'rxjs';
import {
  ProjectStatus,
  ProjectSummary,
  ProjectsService,
} from '../../services/projects.service';

@Component({
  selector: 'app-create-project',
  imports: [FormField, RouterLink],
  templateUrl: './create-project.html',
  styleUrl: './create-project.css',
})
export class CreateProject implements OnInit {
  constructor(private readonly projectsService: ProjectsService) {}

  formData = signal<CreateProjectType>({
    statusId: 0,
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  error = signal('');
  message = signal('');
  createdProject = signal<ProjectSummary | null>(null);
  statuses = signal<ProjectStatus[]>([]);
  statusTouched = signal(false);

  form = form(this.formData, (schemaPath) => {
    validateStandardSchema(schemaPath, createProjectSchema);
  });

  async ngOnInit() {
    try {
      this.statuses.set(await firstValueFrom(this.projectsService.getStatuses()));
    } catch {
      this.error.set('Project statuses could not be loaded.');
    }
  }

  onStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const statusId = Number(select.value);

    this.statusTouched.set(true);
    this.formData.update((data) => ({
      ...data,
      statusId,
    }));
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    this.error.set('');
    this.message.set('');
    this.createdProject.set(null);

    if (this.form().invalid()) {
      return;
    }

    try {
      const project = await firstValueFrom(
        this.projectsService.createProject(this.formData()),
      );
      this.message.set('Project created.');
      this.createdProject.set(project);
      this.formData.set({
        statusId: 0,
        title: '',
        description: '',
        startDate: '',
        endDate: '',
      });
      this.statusTouched.set(false);
    } catch {
      this.error.set('Project could not be created. Please try again.');
    }
  }
}
