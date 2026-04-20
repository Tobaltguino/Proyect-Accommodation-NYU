import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginPageComponent } from './features/auth/login/login.page';
import { AdminHomePageComponent } from './features/admin/home/admin-home.page';
import { StudentHomePageComponent } from './features/student/home/student-home.page';
import { StudentPostulationPageComponent } from './features/student/postulation/postulation.page';
import { StudentStatusPageComponent } from './features/student/status/student-status.page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'admin/home',
    component: AdminHomePageComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['ADMIN'],
    },
  },
  {
    path: 'student/home',
    component: StudentHomePageComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['STUDENT'],
    },
  },
  {
    path: 'student/postulation',
    component: StudentPostulationPageComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['STUDENT'],
    },
  },
  {
    path: 'student/status',
    component: StudentStatusPageComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['STUDENT'],
    },
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
