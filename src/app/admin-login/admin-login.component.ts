import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent {
  loginForm: FormGroup;

  constructor(public fb: FormBuilder,public router:Router,private toastService:MessageService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  login() {
    try {
      const data = this.loginForm.value;
      if(data.email===environment.adminEmail  &&  data.password===environment.adminPassword   )  {
       localStorage.setItem('isLoggedIn','#@4$56123')
       this.router.navigateByUrl('/admin')
      }
       if(data.email===environment.adminEmailReadonly  &&  data.password===environment.adminPasswordReadonly   )  {
       localStorage.setItem('isLoggedIn','#@4$56123')
       localStorage.setItem('isAdminReadonly','true')
       this.router.navigateByUrl('/admin')
      }
      else {
        this.toastService.add({severity:'error', summary: 'Error', detail: 'Unable to Login,Please Try again'})
      }
    } catch (err) {
    }
  }
}
