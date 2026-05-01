import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginPageComponent } from './features/auth/login/login.page';

// 1. Importamos el nuevo Layout Global (Reemplaza al antiguo AdminLayout)
// Asegúrate de que la ruta coincida con donde guardaste el archivo
import { DashboardLayoutComponent } from './layouts/dashboard-layout';

// Admin
import { AdminHomeComponent } from './features/admin/home/admin-home';
import { AdminRequestsComponent } from './features/admin/requests/admin-requests';
import { AdminAssignmentsComponent } from './features/admin/assignments/admin-assignments';
import { AdminIncidentsComponent } from './features/admin/incidents/admin-incidents';
import { AdminInfrastructureComponent } from './features/admin/infrastructure/admin-infrastructure';

// Estudiante (Sin modificar)
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
  
  // ADMIN (Modificado para usar el nuevo DashboardLayoutComponent)
  {
    path: 'admin',
    component: DashboardLayoutComponent, // <- AQUÍ ESTÁ EL CAMBIO
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
    ]
  },

  // ESTUDIANTE (Se mantiene intacto)
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
  
  // ---
  {
    path: '**',
    redirectTo: 'login',
  },
];