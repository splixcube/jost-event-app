import { Component, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss'],
})
export class AddEmployeeComponent {
  employeeForm: FormGroup;
  constructor(
    private ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public fb: FormBuilder,
    public db: AngularFirestore,
    public messageService: MessageService
  ) {
    this.employeeForm = this.fb.group({
      SrNo: [''],
      EmployeeCode: ['', [Validators.required]],
      DepartmentName: ['', [Validators.required]],
      EmployeeName: ['', [Validators.required]],
      MobileNo: ['', [Validators.required,Validators.pattern('(0|91)?[6-9][0-9]{9}')]],
      SportName: ['', [Validators.required]],
     /*  EventName: ['', [Validators.required]], */
      SportType: ['', [Validators.required]],
      EventId: ['', [Validators.required]],
      JerseyType: ['', [Validators.required]],
      JerseySize: ['', [Validators.required]],
      Location: ['', [Validators.required]],
      AppliedDate: ['', [Validators.required]],
      Status: ['', [Validators.required]],
      StatusOn: ['', [Validators.required]],
      TeamName: ['', [Validators.required]],
      city: ['', [Validators.required]],
      registered: [false, [Validators.required]],
      verified: [false, [Validators.required]],
      BusinessUnit: ['', [Validators.required]],
      LocationCode: ['', [Validators.required]],
      State: ['', [Validators.required]],
      Region: ['', [Validators.required]],
      UserCity: ['', [Validators.required]],
    });

    if (this.config.data && !this.config.data.id) {
      this.employeeForm.get('city')?.patchValue(this.config.data);
    }

    if (this.config.data.id) {
      this.employeeForm.patchValue(this.config.data);
    }

  }

  async updateEmployee(id: any) {
    try {
      let data = this.employeeForm.value;
      data.updatedAt = new Date();
      await this.db.collection('employees').doc(id).update(data);
      this.ref.close({ added: true });
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Updated Successfully',
      });
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error Occurred',
      });
    }
  }

  async addEmployee() {
    try {
      let data: any = this.employeeForm.value;
      data.timestamp = new Date();
      data.city = this.config.data;
      await this.db.collection('employees').add(data);
      this.ref.close({ added: true });
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Added Successfully',
      });
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error Occurred',
      });
    }
  }


  getControl(field:any) {
    return this.employeeForm.get(field) as FormControl;
  }


}
