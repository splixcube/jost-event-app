import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-verify-opt',
  templateUrl: './verify-opt.component.html',
  styleUrls: ['./verify-opt.component.scss']
})
export class VerifyOptComponent {

  otp: any
  constructor(private ref: DynamicDialogRef, public config: DynamicDialogConfig, public db: AngularFirestore, private messageService: MessageService, public http: HttpClient) {
    // code to send otp and save it in db
    let obj: any = {}
    obj[this.config.data.type] = Math.floor(Math.random() * 9000) + 1000;
    // let headers = new HttpHeaders({
    //   'content-type': 'application/json',
    //   'authkey': '248597AbjzXnV40063d79d7dP1'
    // });
    // let options = { headers: headers };
    // this.http.post("https://api.msg91.com/api/v5/flow/", {
    //   "flow_id": "63d77f61391e9748b437ce77",
    //   "sender": "RLVNOW",
    //   "recipients": [
    //     {
    //       "mobiles": "91" + this.config.data.MobileNo,
    //       "VAR1": obj[this.config.data.type].toString(),
    //       "VAR2": "VALUE 2"
    //     }
    //   ]
    // }, options).subscribe(res=>{console.log(res)})
    this.http.get(`https://control.msg91.com/api/v5/otp?template_id=63dcb496e3b61344ab2943f5&mobile=91${this.config.data.MobileNo}&authkey=248597AbjzXnV40063d79d7dP1&otp=${obj[this.config.data.type]}`).subscribe(res=>{console.log(res)})
    this.db.collection("employees").doc(this.config.data.id).update(obj)
  }

  async verify() {
    let empData: any = (await this.db.collection("employees").doc(this.config.data.id).get().toPromise())?.data()
    if (this.otp == environment.adminOTP || empData[this.config.data.type] == this.otp) {
      this.ref.close({ id: this.config.data.id, verified: true })
    } else {
      this.messageService.add({ severity: 'error', summary: 'Invalid OTP', detail: 'Entered OTP is incorrect' });
    }
  }



}
