import { Routes } from '@angular/router';
import { CreateProject } from '@components/create-project/create-project';
import { Login } from '@components/login/login';
import { ProjectMembers } from '@components/project-members/project-members';
import { ProjectsOverview } from '@components/projects-overview/projects-overview';
import { Signup } from '@components/signup/signup';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
  },
  {
    path: 'signup',
    component: Signup,
    canActivate: [guestGuard],
  },
  {
    path: 'create-project',
    component: CreateProject,
    canActivate: [authGuard],
  },
  {
    path: 'projects',
    component: ProjectsOverview,
    canActivate: [authGuard],
  },
  {
    path: 'projects/:projectId/members',
    component: ProjectMembers,
    canActivate: [authGuard],
  },
];
