import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { Gestion } from './gestion/gestion';

export const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    { path: 'gestion', component: Gestion }
];

export const appRouter = provideRouter(routes);