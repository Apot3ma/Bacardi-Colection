import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { GestionComponent } from './gestion/gestion.component';

export const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'gestion', component: GestionComponent }
];

export const appRouter = provideRouter(routes);