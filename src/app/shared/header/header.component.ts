import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(public router:Router,public confirmationService:ConfirmationService) {
  }


  logout() {
    this.confirmationService.confirm({
    message: 'Are you sure that you want to logout?',
    accept: () => {
      localStorage.clear()
      this.router.navigateByUrl('/admin/login')
    }
});

  }

}
