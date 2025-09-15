import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { DialogService } from 'primeng/dynamicdialog';

import * as XLSX from 'xlsx';
import { VerifyOptComponent } from 'src/app/shared/verify-opt/verify-opt.component';
import { Table } from 'primeng/table';
import { AddEmployeeComponent } from 'src/app/shared/add-employee/add-employee.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import * as FileSaver from 'file-saver';
@Component({
  selector: 'app-manage-employee',
  templateUrl: './manage-employee.component.html',
  styleUrls: ['./manage-employee.component.scss'],
})
export class ManageEmployeeComponent {
  cityData:any=null
  selectedEmployees: any =[];
  importcolumns = [
    'SrNo',
    'EmployeeCode',
    'EmployeeName',
    'BusinessUnit',
    'DepartmentName',
    'MobileNo',
    'SportName',
    'SportType',
    'EventId',
    'JerseyType',
    'JerseySize',
    'Location',
    'LocationCode',
    'AppliedDate',
    'Status',
    'StatusOn',
    'TeamName'
  ];
  exportColumns: any[] = [
    { field: 'EmployeeCode', header: 'Employee Code' },
    { field: 'EmployeeName', header: 'Employee Name' },
     { field: 'BusinessUnit', header: 'Business Unit' },
    { field: 'DepartmentName', header: 'Department Name' },
    { field: 'MobileNo', header: 'MobileNo' },
    { field: 'SportName', header: 'Sport Name' },
    { field: 'SportType', header: 'Sport Type' },
   { field: 'TeamName', header: 'Team Name' },
    { field: 'EventId', header: 'EventId' },
    { field: 'JerseyType', header: 'Jersey Type' },
    { field: 'JerseySize', header: 'Jersey Size' },
       { field: 'LocationCode', header: 'Location Code' },
    { field: 'Location', header: 'Location' },
       { field: 'UserCity', header: 'City' },
          { field: 'State', header: 'State' },
             { field: 'Region', header: 'Region' },
    { field: 'AppliedDate', header: 'Applied Date' },
    { field: 'Status', header: 'Status' },
    { field: 'StatusOn', header: 'Status On' },
   
    { field: 'registered', header: 'Registered',hide:false },
    { field: 'verified', header: 'Verified',hide:false  },
  ];
  cityId:any;
  employees: any = [];

  checkDeletePermision:any='false';
  constructor(
    public route: ActivatedRoute,
    public db: AngularFirestore,
    public dialogService: DialogService,
    public confirmationService: ConfirmationService,
    public messageService: MessageService
  ) {

    this.cityId = this.route.snapshot.paramMap.get('id');
    this.db.collection("cities").doc(this.cityId).get().subscribe(res=>{
      this.cityData=res.data()
    })
    this.getAllEmployees();
    this.checkDeletePermision=localStorage.getItem('isAdminReadonly')||'false'
  }


  getAllEmployees() {
    this.db
      .collection('employees', (ref) => ref.where('city', '==', this.cityId))
      .snapshotChanges()
      .pipe(
        map((actions: any) =>
          actions.map((a: any) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      )
      .subscribe((res) => {
        this.employees = res;
        console.log(res);
      });
  }

  onFileChange(event: any) {
    console.log(event);
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }

    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    reader.onload = async (e: any) => {
      /* create workbook */
      const binarystr: string = e.target.result;
      try {
        const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });

        /* selected the first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        const data: any = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
       
        if (
          JSON.stringify(Object.keys(data[0]))
        ) {
          let excelData = data.map((item: any) => {
            return {
              city: this.cityId,
              registered: false,
              verified: false,
              SrNo: item.SrNo || '',
             EmployeeCode: item.EmployeeCode || item['Employee Code'],
             EmployeeName: item.EmployeeName || item['Employee Name'],
             BusinessUnit: item.BusinessUnit || item['Business Unit'] || '',
             DepartmentName: item.DepartmentName || item['Department Name'],
             MobileNo: item.MobileNo || '',
             SportName: item.SportName || item['Sport Name'] || '',
             SportType: item.SportType || item['Sport Type'] || '',
             TeamName: item.TeamName || item['Team Name'] || '',
             EventId: item.EventId || item['Event Id'],
             JerseyType: item.JerseyType || '',
             JerseySize: item.JerseySize || '',
             LocationCode: item.LocationCode || item['Location Code'] || '',
             Location: item.Location || '',
             UserCity: item.City || item['UserCity']  || '',
             State: item.State || '',
             Region: item.Region || '',
             AppliedDate: item.AppliedDate || '',
             Status: item.Status || '',
             StatusOn: item.StatusOn || '',
            };
          });
          console.log(excelData);
          await this.bulkImport(excelData);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Imported Successfully',
          });
          event.target.value = null;
        } else {
          console.log(data,"excelData",this.importcolumns);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Invalid  Excel Format',
          });
          event.target.value = null;
        }
      } catch (err) {
        console.log(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid File Format',
        });
        event.target.value = null;
      }
    };
  }

  async bulkImport(data: any) {
    return new Promise((resolve, reject) => {
      this.addQueryBatch(data, resolve).catch(reject);
    });
  }

  async addQueryBatch(contacts: any, resolve: any) {
    const chunkSize = 490;
    for (let i = 0; i < contacts.length; i += chunkSize) {
      const chunk = contacts.slice(i, i + chunkSize);
      const batch = this.db.firestore.batch();
      for await (const iterator of chunk) {
        const docRef = this.db
          .collection('employees')
          .doc(this.db.createId()).ref;
        const timestamp: any = new Date();
        iterator.timestamp = timestamp;
        batch.set(docRef, iterator);
      }
      await batch.commit();
    }
    resolve();
  }

  verify(id: any) {
    // code to verify otp and call this function
    this.db.collection('employees').doc(id).update({ verified: true });
  }

  registerEmployee(id: any) {
    // code to verify otp and call this function
    this.db.collection('employees').doc(id).update({ registered: true });
  }

  dismiss() {}

  verifyOTP(data: any) {
    this.verify(data.id);
   /*  const ref = this.dialogService.open(VerifyOptComponent, {
      data: {
        ...data,
        type: 'verificationCode',
      },
      header: 'Verify OTP',
      width: '35%',
    });
    ref.onClose.subscribe((res: any) => {
      if (res && res.verified) {
        this.verify(res.id);
      }
    }); */
  }

  register(data: any) {
  const ref = this.dialogService.open(VerifyOptComponent, {
      data: {
        ...data,
        type: 'registrationCode',
      },
      header: 'Verify OTP',
      width: '35%',
    });
    ref.onClose.subscribe((res: any) => {
      if (res && res.verified) {
        this.registerEmployee(res.id);
      }
    }); 
  }

  deleteRow(id: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteEmployee(id);
      },
    });
  }

  deleteEmployee(id: any) {
    this.db.collection('employees').doc(id).delete();
  }

  clear(table: Table, inp: any) {
    inp.value = '';
    table.clear();
  }

  edit(data: any) {
    data.city = this.cityId;
    const ref = this.dialogService.open(AddEmployeeComponent, {
      data: data,
      header: 'Edit Employee',
      width: '85%',
    });
    ref.onClose.subscribe((res: any) => {
      if (res && res?.added) {
      }
    });
  }

  add() {
    const ref = this.dialogService.open(AddEmployeeComponent, {
      data: this.cityId,
      header: 'Add Employee',
      width: '85%',
    });
    ref.onClose.subscribe((res: any) => {
      if (res && res?.added) {
      }
    });
  }

  import() {
    document.getElementById('fileinp')?.click();
  }



  exportExcel(table: Table) {
    console.log(table);
   
    let filteredData:any
     if(this.selectedEmployees?.length>0) {
      filteredData=table.selection.map((item:any)=>{
        let obj:any={}
        this.exportColumns.forEach((column)=>{
          obj[column.field]=item[column.field]
        })
        return obj
      })
     }
     else {
       filteredData=(table.filteredValue ? table.filteredValue : table.value).map((item)=>{
        console.log(item);
        let obj:any={}
        this.exportColumns.forEach((column)=>{
          if(column.field=='registered' || column.field=='verified' ) {
            obj[column.field]=item[column.field] ? 'Yes' : 'No'
          }
           if(column.field=='UserCity' ) {
            obj['City']=item['UserCity'] || ''
          } 
          else {
            obj[column.field]=item[column.field]
          }

        })
        return obj
      })
     }

// return
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(filteredData);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "Employee-Data");
    });
}

saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
}
}
