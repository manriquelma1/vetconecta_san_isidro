import { Routes } from '@angular/router';

import { invitadoGuard, sesionGuard } from './guards/sesion-guard';

import { Dashboard } from './pages/dashboard/dashboard';
import { Agendar } from './pages/agendar/agendar';
import { Internamiento } from './pages/internamiento/internamiento';
import { Historial } from './pages/historial/historial';
import { Login } from './pages/login/login';
import { Perfil } from './pages/perfil/perfil';
import { Recetas } from './pages/recetas/recetas';
import { Recordatorios } from './pages/recordatorios/recordatorios';
import { RegistroAtencion } from './pages/registro-atencion/registro-atencion';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [invitadoGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [sesionGuard] },
  { path: 'agendar', component: Agendar, canActivate: [sesionGuard] },
  { path: 'historial', component: Historial, canActivate: [sesionGuard] },
  { path: 'internamiento', component: Internamiento, canActivate: [sesionGuard] },
  { path: 'perfil', component: Perfil, canActivate: [sesionGuard] },
  { path: 'recetas', component: Recetas, canActivate: [sesionGuard] },
  { path: 'recordatorios', component: Recordatorios, canActivate: [sesionGuard] },
  { path: 'registro-atencion', component: RegistroAtencion, canActivate: [sesionGuard] },
  { path: '**', redirectTo: 'dashboard' }
];