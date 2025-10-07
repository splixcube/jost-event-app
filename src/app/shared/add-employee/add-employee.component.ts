import { Component, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { map } from 'rxjs';
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
      DepartmentName: [''],
      EmployeeName: ['', [Validators.required]],
      MobileNo: ['', [Validators.required,Validators.pattern('(0|91)?[6-9][0-9]{9}')]],
      SportName: ['', [Validators.required]],
      SportType: [''],
      EventId: [''],
      JerseyType: [''],
      JerseySize: ['', [Validators.required]],
      Location: [''],
      AppliedDate:[new Date().toISOString().split('T')[0]],
      Status: [''],
      StatusOn: [new Date().toISOString().split('T')[0]],
      TeamName: [''],
      city: [''],
      registered: [false],
      verified: [false],
      BusinessUnit: [''],
      LocationCode: [''],
      State: [''],
      Region: [''],
      UserCity: [''],
    });

  console.log(this.config.data);
     

    if (this.config.data && !this.config.data.id) {
       this.setCity(this.config.data);
      this.employeeForm.get('city')?.patchValue(this.config.data);
    } 

    if (this.config.data.id) {
      this.employeeForm.patchValue(this.config.data);
    }

  }
  setCity(id:any) {

    this.db
      .collection('cities').doc(id).get()
      .pipe(
        map((actions: any) => {
            const data = actions.data() as any;
            const id = actions.id;
            return { id, ...data };
          })
        )
      .subscribe((res: any) => {
        console.log(res);
        this.employeeForm.get('UserCity')?.patchValue(res.name);
       
      });
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
