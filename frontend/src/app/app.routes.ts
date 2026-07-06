import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginPageComponent } from './features/auth/login/login.page';
import { HomeComponent } from './features/home/home';
import { DashboardLayoutComponent } from './layouts/dashboard-layout';

// Admin
import { AdminHomeComponent } from './features/admin/home/admin-home';
import { AdminRequestsComponent } from './features/admin/requests/admin-requests';
import { AdminAssignmentsComponent } from './features/admin/assignments/admin-assignments';
import { AdminIncidentsComponent } from './features/admin/incidents/admin-incidents';
import { AdminInfrastructureComponent } from './features/admin/infrastructure/admin-infrastructure';
import { AdminStayManagementComponent } from './features/admin/stay-management/admin-stay-management';

// Estudiante 
import { StudentHomePageComponent } from './features/student/home/student-home.page';
import { StudentPostulationPageComponent } from './features/student/postulation/postulation.page';
import { StudentStatusPageComponent } from './features/student/status/student-status.page'; 
import { StudentAvailabilityComponent } from './features/student/availability/student-availability';
import { StudentStayHistoryComponent } from './features/student/stay-history/student-stay-history';
import { StudentIncidentsComponent } from './features/student/incidents/student-incidents';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  
  {
    path: 'login',
    component: LoginPageComponent,
  },

  // ADMIN
  {
    path: 'admin',
    component: DashboardLayoutComponent, 
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['ADMIN'], 
    },
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: AdminHomeComponent },
      { path: 'requests', component: AdminRequestsComponent },
      { path: 'assignments', component: AdminAssignmentsComponent },
      { path: 'incidents', component: AdminIncidentsComponent },
      { path: 'infrastructure', component: AdminInfrastructureComponent },
      { path: 'stay-management', component: AdminStayManagementComponent },
    ]
  },

  // ESTUDIANTE
  {
    path: 'student',
    component: DashboardLayoutComponent, 
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['STUDENT'],
    },
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' }, 
      { path: 'home', component: StudentHomePageComponent },
      { path: 'postulation', component: StudentPostulationPageComponent },
      { path: 'status', component: StudentStatusPageComponent },
      { path: 'availability', component: StudentAvailabilityComponent },
      { path: 'stay-history', component: StudentStayHistoryComponent },
      { path: 'incidents', component: StudentIncidentsComponent },
    ]
  },

  {
    path: '**',
    redirectTo: '',
  },
];