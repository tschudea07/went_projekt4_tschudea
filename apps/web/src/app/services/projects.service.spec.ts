import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProjectsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load project members with credentials', () => {
    service.getProjectMembers('project-1').subscribe();

    const req = httpTesting.expectOne(
      'http://localhost:3000/projects/project-1/members',
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush([]);
  });

  it('should add project members by email with credentials', () => {
    service
      .addProjectMember('project-1', {
        email: 'member@example.com',
      })
      .subscribe();

    const req = httpTesting.expectOne(
      'http://localhost:3000/projects/project-1/members',
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({
      email: 'member@example.com',
    });
    req.flush({
      id: 'user-1',
      name: 'Member User',
      email: 'member@example.com',
      isProjectManager: false,
    });
  });

  it('should promote project members with credentials', () => {
    service.promoteProjectMember('project-1', 'user-1').subscribe();

    const req = httpTesting.expectOne(
      'http://localhost:3000/projects/project-1/members/user-1/manager',
    );

    expect(req.request.method).toBe('PATCH');
    expect(req.request.withCredentials).toBe(true);
    req.flush({
      id: 'user-1',
      name: 'Member User',
      email: 'member@example.com',
      isProjectManager: true,
    });
  });

  it('should remove project members with credentials', () => {
    service.removeProjectMember('project-1', 'user-1').subscribe();

    const req = httpTesting.expectOne(
      'http://localhost:3000/projects/project-1/members/user-1',
    );

    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);
    req.flush({
      id: 'user-1',
      name: 'Member User',
      email: 'member@example.com',
      isProjectManager: false,
    });
  });
});
