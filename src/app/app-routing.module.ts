import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AuthGuard } from './guard/auth.guard';
import { MamageCitiesComponent } from './pages/mamage-cities/mamage-cities.component';
import { ManageEmployeeComponent } from './pages/manage-employee/manage-employee.component';
import { PagesComponent } from './pages/pages.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { UserComponent } from './user/user.component';

const routes: Routes = [
  {
    path: 'admin',
    component: PagesComponent,
    children: [
      { path: '', component: MamageCitiesComponent },
      { path: 'datasheets', component: MamageCitiesComponent },
      { path: 'manage-employee/:id', component: ManageEmployeeComponent },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent,
  },
  {
    path: 'user',
    component: UserComponent,
    children: [{ path: 'registration', component: RegistrationComponent }],
  },
  { path: '', redirectTo: 'user/registration', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
