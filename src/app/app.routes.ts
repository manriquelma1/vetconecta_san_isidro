import { Routes } from '@angular/router';

import { invitadoGuard, personalGuard, propietarioGuard, sesionGuard } from './guards/sesion-guard';

import { Dashboard } from './pages/dashboard/dashboard';
import { Agendar } from './pages/agendar/agendar';
import { Internamiento } from './pages/internamiento/internamiento';
import { Historial } from './pages/historial/historial';
import { Login } from './pages/login/login';
import { Perfil } from './pages/perfil/perfil';
import { Recetas } from './pages/recetas/recetas';
import { Recordatorios } from './pages/recordatorios/recordatorios';
import { RegistroAtencion } from './pages/registro-atencion/registro-atencion';
import { GestionCitas } from './pages/gestion-citas/gestion-citas';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [invitadoGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [propietarioGuard] },
  { path: 'agendar', component: Agendar, canActivate: [propietarioGuard] },
  { path: 'gestion-citas', component: GestionCitas, canActivate: [personalGuard] },
  { path: 'historial', component: Historial, canActivate: [sesionGuard] },
  { path: 'internamiento', component: Internamiento, canActivate: [sesionGuard] },
  { path: 'perfil', component: Perfil, canActivate: [sesionGuard] },
  { path: 'recetas', component: Recetas, canActivate: [sesionGuard] },
  { path: 'recordatorios', component: Recordatorios, canActivate: [propietarioGuard] },
  { path: 'registro-atencion', component: RegistroAtencion, canActivate: [sesionGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
