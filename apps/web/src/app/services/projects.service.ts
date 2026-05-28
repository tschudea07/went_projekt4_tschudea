import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  AddProjectMemberType,
  CreateProjectType,
} from '@lib/schemas/project.schema';

export type ProjectStatus = {
  id: number;
  name: string;
};

export type ProjectSummary = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  membersCount: number;
};

export type ProjectMember = {
  id: string;
  name: string;
  email: string;
};

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly projectsUrl = 'http://localhost:3000/projects';

  createProject(project: CreateProjectType) {
    return this.http.post<ProjectSummary>(this.projectsUrl, project, {
      withCredentials: true,
    });
  }

  getProjects() {
    return this.http.get<ProjectSummary[]>(this.projectsUrl, {
      withCredentials: true,
    });
  }

  getStatuses() {
    return this.http.get<ProjectStatus[]>(`${this.projectsUrl}/statuses`, {
      withCredentials: true,
    });
  }

  getProjectMembers(projectId: string) {
    return this.http.get<ProjectMember[]>(
      `${this.projectsUrl}/${projectId}/members`,
      {
        withCredentials: true,
      },
    );
  }

  addProjectMember(projectId: string, member: AddProjectMemberType) {
    return this.http.post<ProjectMember>(
      `${this.projectsUrl}/${projectId}/members`,
      member,
      {
        withCredentials: true,
      },
    );
  }
}
