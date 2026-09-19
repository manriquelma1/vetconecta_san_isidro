import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Agendar } from './pages/agendar/agendar';
import { Internamiento } from './pages/internamiento/internamiento';
import { Historial } from './pages/historial/historial';
import { Perfil } from './pages/perfil/perfil';
import { Recetas } from './pages/recetas/recetas';

export const routes: Routes = [
    {path:'',redirectTo:'dashboard', pathMatch:'full'},
    {path: 'dashboard', component: Dashboard},
    {path: 'agendar', component: Agendar},
    {path:'historial', component: Historial},
    {path: 'internamiento', component: Internamiento},
    {path: 'perfil', component: Perfil},
    {path: 'recetas', component: Recetas},
    {path: '**', redirectTo: 'dashboard'}
];
