import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent {
  step = 1
  registrationForm: any
  employeeData: any = null
  OTP:any = null
  Disciplines:any[]=[]
  registrationPage=true;
  constructor(public fb: FormBuilder, public db: AngularFirestore,
    private messageService: MessageService,
    public http:HttpClient
  ) {
    this.registrationForm = this.fb.group({
      EmployeeCode: ['', [Validators.required]],
    });
  }

  async sendOtp() {
    let res: any = (
      await this.db
        .collection('employees', (ref) =>
          ref.where(
            'EmployeeCode',
            '==',
            this.registrationForm.value.EmployeeCode
          )
        )
        .get()
        .toPromise()
    )?.docs;
    if (res.length > 0) {
      this.employeeData = {...res[0].data(),id:res[0].id}
      if(this.employeeData?.registered) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'You are already registered',
        });
        return
      }
      this.registrationPage=false
      let obj: any = {}
      obj['registrationCode'] = Math.floor(Math.random() * 9000) + 1000;
      this.db.collection("employees").doc(this.employeeData.id).update(obj)
      this.http.get(`https://control.msg91.com/api/v5/otp?template_id=63dcb496e3b61344ab2943f5&mobile=91${this.employeeData.MobileNo}&authkey=248597AbjzXnV40063d79d7dP1&otp=${obj['registrationCode']}`).subscribe(res=>{console.log(res)})
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Code',
        detail: 'Please Enter a valid employee code',
      });
    }
  }

  async verifyOtp() {
    let empData: any = (
      await this.db
        .collection('employees')
        .doc(this.employeeData.id)
        .get()
        .toPromise()
    )?.data();
    if (empData['registrationCode'].toString() == this.OTP?.toString()) {
      (
        await this.db
          .collection('employees', (ref) =>
            ref.where(
              'EmployeeCode',
              '==',
              this.registrationForm.value.EmployeeCode
            )
          )
          .get()
          .toPromise()
      )?.docs.forEach(async (doc) => {
        let docData :any= doc.data()
        this.Disciplines.push(docData?.Discipline)
        await this.db
          .collection('employees')
          .doc(doc.id)
          .update({ registered: true });
      });
      this.step = 2

      this.employeeData = null;
      this.registrationForm.reset();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid OTP',
        detail: 'Entered OTP is incorrect',
      });
    }
  }

  // this called every time when user changed the code
  onCodeChanged(code: string) {
    this.OTP = code;
  }

  // this called only if user entered full code
  onCodeCompleted(code: string) {
    this.OTP = code;
  }
}
