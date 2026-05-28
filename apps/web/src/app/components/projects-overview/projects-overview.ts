import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  ProjectSummary,
  ProjectsService,
} from '../../services/projects.service';

@Component({
  selector: 'app-projects-overview',
  imports: [RouterLink],
  templateUrl: './projects-overview.html',
  styleUrl: './projects-overview.css',
})
export class ProjectsOverview implements OnInit {
  constructor(private readonly projectsService: ProjectsService) {}

  protected readonly projects = signal<ProjectSummary[]>([]);
  protected readonly error = signal('');
  protected readonly isLoading = signal(true);

  async ngOnInit() {
    await this.loadProjects();
  }

  protected async loadProjects() {
    this.error.set('');
    this.isLoading.set(true);

    try {
      this.projects.set(await firstValueFrom(this.projectsService.getProjects()));
    } catch {
      this.error.set('Projects could not be loaded.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected formatDate(value: string) {
    return new Intl.DateTimeFormat('de-AT', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }
}
