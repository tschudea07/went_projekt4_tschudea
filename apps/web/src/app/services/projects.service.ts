import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { CreateProjectType } from '@lib/schemas/project.schema';

export type ProjectStatus = {
  id: number;
  name: string;
};

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly projectsUrl = 'http://localhost:3000/projects';

  createProject(project: CreateProjectType) {
    return this.http.post(this.projectsUrl, project, {
      withCredentials: true,
    });
  }

  getStatuses() {
    return this.http.get<ProjectStatus[]>(`${this.projectsUrl}/statuses`, {
      withCredentials: true,
    });
  }
}
