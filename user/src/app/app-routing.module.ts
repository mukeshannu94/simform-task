import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './core/services/auth-guard.service';
import { NoAuthGuardService } from './core/services/no-auth-guard.service';
const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', canActivate: [NoAuthGuardService], loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: 'users', canActivate: [AuthGuardService], loadChildren: () => import('./users/users.module').then(m => m.UsersModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
