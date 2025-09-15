import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { MamageCitiesComponent } from './pages/mamage-cities/mamage-cities.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { ManageEmployeeComponent } from './pages/manage-employee/manage-employee.component';
import {TableModule} from 'primeng/table';
import { HeaderComponent } from './shared/header/header.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { PagesComponent } from './pages/pages.component';
import { UserComponent } from './user/user.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VerifyOptComponent } from './shared/verify-opt/verify-opt.component';
import { AddEmployeeComponent } from './shared/add-employee/add-employee.component';
import { DialogService } from 'primeng/dynamicdialog';
import { CodeInputModule } from 'angular-code-input';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import {ToastModule} from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpClientModule } from '@angular/common/http';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
@NgModule({
  declarations: [
    AppComponent,
    MamageCitiesComponent,
    ManageEmployeeComponent,
    HeaderComponent,
    RegistrationComponent,
    PagesComponent,
    UserComponent,
    VerifyOptComponent,
    AdminLoginComponent,
    AddEmployeeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    BrowserAnimationsModule,
    CodeInputModule,
    ToastModule,
    HttpClientModule,
    ConfirmDialogModule
  ],
  providers: [DialogService,MessageService,ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
